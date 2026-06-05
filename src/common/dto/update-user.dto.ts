import { IsString, IsOptional, MinLength, MaxLength, IsUrl, IsEnum } from 'class-validator';
import { UserRole } from '../../modules/user/schemas/user.schema';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @IsOptional()
    @IsUrl()
    avatar?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}