import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsPasswordStrong, IsResetCode } from '../decorators/validators.decorator';

export class ResetPasswordDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'ABC123', description: '6-character alphanumeric code received via email' })
    @IsResetCode()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'NewPassword456!', description: 'New password (must satisfy password policy)' })
    @IsPasswordStrong()
    @IsNotEmpty()
    newPassword: string;
}