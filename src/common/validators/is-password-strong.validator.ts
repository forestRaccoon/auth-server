import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validationConstants } from '../../config/validation.constants';

@ValidatorConstraint({ name: 'isPasswordStrong', async: false })
export class IsPasswordStrongConstraint implements ValidatorConstraintInterface {
    validate(password: string): boolean {
        const p = validationConstants.password;
        if (password.length < p.minLength || password.length > p.maxLength) return false;
        if (p.requireLetter && !/[A-Za-z]/.test(password)) return false;
        if (p.requireNumber && !/\d/.test(password)) return false;
        if (p.requireSpecial) {
            const hasSpecial = new RegExp(`[${p.specialChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]`).test(password);
            if (!hasSpecial) return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments): string {
        const p = validationConstants.password;
        let msg = `Password must be ${p.minLength}-${p.maxLength} characters`;
        if (p.requireLetter) msg += ', contain at least one letter';
        if (p.requireNumber) msg += ', contain at least one number';
        if (p.requireSpecial) msg += `, contain at least one special character (${p.specialChars})`;
        return msg + '.';
    }
}