import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsPasswordStrong, IsResetCode } from '../decorators/validators.decorator';

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsResetCode()
    @IsNotEmpty()
    code: string;

    @IsPasswordStrong()
    @IsNotEmpty()
    newPassword: string;
}