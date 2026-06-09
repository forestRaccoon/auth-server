import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsUrl, IsEnum } from 'class-validator';
import { UserRole } from '../../modules/user/schemas/user.schema';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Jane', description: 'New first name (2-50 chars)' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;

    @ApiPropertyOptional({ example: 'Smith', description: 'New last name (2-50 chars)' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
    @IsOptional()
    @IsUrl()
    avatar?: string;

    @ApiPropertyOptional({ enum: UserRole, description: 'New role (requires admin rights)' })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}