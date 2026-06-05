import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationConfigService } from '../services/validation-config.service';

@ValidatorConstraint({ name: 'isPasswordStrong', async: true })
@Injectable()
export class IsPasswordStrongConstraint implements ValidatorConstraintInterface {
    constructor(private validationConfig: ValidationConfigService) {}

    async validate(password: string) {
        const min = this.validationConfig.getPasswordMinLength();
        const max = this.validationConfig.getPasswordMaxLength();
        if (password.length < min || password.length > max) return false;
        if (this.validationConfig.isPasswordRequireLetter() && !/[A-Za-z]/.test(password)) return false;
        if (this.validationConfig.isPasswordRequireNumber() && !/\d/.test(password)) return false;
        if (this.validationConfig.isPasswordRequireSpecial()) {
            const specialChars = this.validationConfig.getPasswordSpecialChars();
            const hasSpecial = new RegExp(`[${specialChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`).test(password);
            if (!hasSpecial) return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const min = this.validationConfig.getPasswordMinLength();
        const max = this.validationConfig.getPasswordMaxLength();
        let msg = `Password must be ${min}-${max} characters`;
        if (this.validationConfig.isPasswordRequireLetter()) msg += ', contain at least one letter';
        if (this.validationConfig.isPasswordRequireNumber()) msg += ', contain at least one number';
        if (this.validationConfig.isPasswordRequireSpecial()) {
            msg += `, contain at least one special character (${this.validationConfig.getPasswordSpecialChars()})`;
        }
        return msg + '.';
    }
}