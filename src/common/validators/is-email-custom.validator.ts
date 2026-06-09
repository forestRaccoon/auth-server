import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validationConstants } from '../../config/validation.constants';

@ValidatorConstraint({ name: 'isEmailCustom', async: false })
export class IsEmailCustomConstraint implements ValidatorConstraintInterface {
    validate(email: string): boolean {
        if (!email) return false;
        const e = validationConstants.email;
        if (email.length < e.minLength || email.length > e.maxLength) return false;

        // Базовая проверка формата email
        const basicRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!basicRegex.test(email)) return false;

        if (e.requireTld) {
            const parts = email.split('.');
            if (parts.length < 2 || parts[parts.length - 1].length < 2) return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments): string {
        const e = validationConstants.email;
        return `Email must be ${e.minLength}-${e.maxLength} characters and valid format.`;
    }
}