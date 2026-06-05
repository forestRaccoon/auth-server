import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { IsPasswordStrong } from '../decorators/validators.decorator';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsPasswordStrong()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;
}