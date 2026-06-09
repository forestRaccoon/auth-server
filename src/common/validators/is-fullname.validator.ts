import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validationConstants } from '../../config/validation.constants';

@ValidatorConstraint({ name: 'isFullName', async: false })
export class IsFullNameConstraint implements ValidatorConstraintInterface {
    validate(name: string): boolean {
        if (!name) return false;
        const n = validationConstants.fullName;
        return name.length >= n.minLength && name.length <= n.maxLength;
    }

    defaultMessage(args: ValidationArguments): string {
        const n = validationConstants.fullName;
        return `Name must be ${n.minLength}-${n.maxLength} characters.`;
    }
}