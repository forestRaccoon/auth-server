import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { getEmailDescription } from '../../config/validation.constants';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com', description: getEmailDescription() })
    @IsEmail()
    email: string;
}