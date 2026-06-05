import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ValidationConfigService } from '../services/validation-config.service';

@ValidatorConstraint({ name: 'isResetCode', async: true })
@Injectable()
export class IsResetCodeConstraint implements ValidatorConstraintInterface {
    constructor(private validationConfig: ValidationConfigService) {}

    async validate(code: string) {
        const len = this.validationConfig.getResetCodeLength();
        const charset = this.validationConfig.getResetCodeCharset();
        const regex = new RegExp(`^[${charset}]{${len}}$`);
        return regex.test(code);
    }

    defaultMessage(args: ValidationArguments) {
        const len = this.validationConfig.getResetCodeLength();
        return `Reset code must be ${len} alphanumeric characters.`;
    }
}