import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { getEmailDescription, getPasswordDescription } from '../../config/validation.constants';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: getEmailDescription() })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Password123!', description: getPasswordDescription() })
    @IsNotEmpty()
    password: string;
}