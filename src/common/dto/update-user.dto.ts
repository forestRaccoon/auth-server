import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsEnum, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../modules/user/schemas/user.schema';
import {
    validationConstants,
    getNameDescription,
    getAvatarDescription,
    getRoleDescription,
} from '../../config/validation.constants';

const { fullName } = validationConstants;

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Jane', description: getNameDescription() })
    @IsOptional()
    @IsString()
    @MinLength(fullName.minLength)
    @MaxLength(fullName.maxLength)
    firstName?: string;

    @ApiPropertyOptional({ example: 'Smith', description: getNameDescription() })
    @IsOptional()
    @IsString()
    @MinLength(fullName.minLength)
    @MaxLength(fullName.maxLength)
    lastName?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: getAvatarDescription() })
    @IsOptional()
    @IsUrl()
    avatar?: string;

    @ApiPropertyOptional({ enum: UserRole, description: getRoleDescription() })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}