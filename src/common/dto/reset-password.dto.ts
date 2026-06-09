import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsPasswordStrong, IsResetCode } from '../decorators/validators.decorator';
import { getEmailDescription, getPasswordDescription, getCodeDescription } from '../../config/validation.constants';

export class ResetPasswordDto {
    @ApiProperty({ example: 'user@example.com', description: getEmailDescription() })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'ABC123', description: getCodeDescription() })
    @IsResetCode()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'NewPassword456!', description: getPasswordDescription() })
    @IsPasswordStrong()
    @IsNotEmpty()
    newPassword: string;
}