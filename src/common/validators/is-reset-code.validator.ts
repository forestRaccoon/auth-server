import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validationConstants } from '../../config/validation.constants';

@ValidatorConstraint({ name: 'isResetCode', async: false })
export class IsResetCodeConstraint implements ValidatorConstraintInterface {
    validate(code: string): boolean {
        const c = validationConstants.resetCode;
        const regex = new RegExp(`^[${c.charset}]{${c.length}}$`);
        return regex.test(code);
    }

    defaultMessage(args: ValidationArguments): string {
        const c = validationConstants.resetCode;
        return `Reset code must be ${c.length} alphanumeric characters (${c.charset}).`;
    }
}