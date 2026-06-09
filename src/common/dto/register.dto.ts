import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { IsPasswordStrong } from '../decorators/validators.decorator';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address (must be unique)',
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Password – min 8 chars, at least one letter and one number',
        required: true,
    })
    @IsPasswordStrong()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: 'John',
        description: 'First name (2-50 characters)',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Last name (optional, 2-50 characters)',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;
}