import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsPasswordStrongConstraint } from '../validators/is-password-strong.validator';
import { IsResetCodeConstraint } from '../validators/is-reset-code.validator';

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPasswordStrongConstraint,
        });
    };
}

export function IsResetCode(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsResetCodeConstraint,
        });
    };
}