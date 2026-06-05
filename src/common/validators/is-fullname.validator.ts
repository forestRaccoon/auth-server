import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationConfigService } from '../services/validation-config.service';

@ValidatorConstraint({ name: 'isFullName', async: true })
@Injectable()
export class IsFullNameConstraint implements ValidatorConstraintInterface {
    constructor(private validationConfig: ValidationConfigService) {}

    async validate(name: string) {
        if (!name) return !this.validationConfig.isFullNameRequired();
        const min = this.validationConfig.getFullNameMinLength();
        const max = this.validationConfig.getFullNameMaxLength();
        return name.length >= min && name.length <= max;
    }

    defaultMessage(args: ValidationArguments) {
        const min = this.validationConfig.getFullNameMinLength();
        const max = this.validationConfig.getFullNameMaxLength();
        return `Full name must be ${min}-${max} characters.`;
    }
}