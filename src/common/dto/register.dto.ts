// src/common/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';
import { IsPasswordStrong } from '../decorators/validators.decorator';
import {
    validationConstants,
    getEmailDescription,
    getPasswordDescription,
    getNameDescription,
} from '../../config/validation.constants';

const { fullName } = validationConstants;

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com', description: getEmailDescription() })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Password123!', description: getPasswordDescription() })
    @IsPasswordStrong()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'John', description: getNameDescription() })
    @IsString()
    @IsNotEmpty()
    @MinLength(fullName.minLength)
    @MaxLength(fullName.maxLength)
    firstName: string;

    @ApiPropertyOptional({ example: 'Doe', description: `${getNameDescription()} (optional)` })
    @IsOptional()
    @IsString()
    @MinLength(fullName.minLength)
    @MaxLength(fullName.maxLength)
    lastName?: string;

    @ApiPropertyOptional({ example: 'en', description: 'User language preference (ru or en). Default: en', enum: ['ru', 'en'] })
    @IsOptional()
    @IsIn(['ru', 'en'])
    locale?: string;
}