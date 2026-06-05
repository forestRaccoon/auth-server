import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationConfigService } from '../services/validation-config.service';

@ValidatorConstraint({ name: 'isEmailCustom', async: true })
@Injectable()
export class IsEmailCustomConstraint implements ValidatorConstraintInterface {
    constructor(private validationConfig: ValidationConfigService) {}

    async validate(email: string) {
        if (!email) return false;
        const min = this.validationConfig.getEmailMinLength();
        const max = this.validationConfig.getEmailMaxLength();
        if (email.length < min || email.length > max) return false;

        const regex = this.validationConfig.getEmailRegex();
        if (regex) return regex.test(email);

        // Standard email regex
        const basicRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!basicRegex.test(email)) return false;

        if (this.validationConfig.isEmailRequireTld()) {
            const parts = email.split('.');
            if (parts.length < 2 || parts[parts.length - 1].length < 2) return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const min = this.validationConfig.getEmailMinLength();
        const max = this.validationConfig.getEmailMaxLength();
        return `Email must be ${min}-${max} characters and have a valid format.`;
    }
}