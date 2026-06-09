import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsEnum } from 'class-validator';
import { UserRole } from '../../modules/user/schemas/user.schema';
import { getObjectIdDescription, getRoleDescription } from '../../config/validation.constants';

export class ChangeRoleDto {
    @ApiProperty({ example: '60d21b4667d0d8992e610c85', description: getObjectIdDescription() })
    @IsMongoId()
    userId: string;

    @ApiProperty({ enum: UserRole, description: getRoleDescription() })
    @IsEnum(UserRole)
    role: UserRole;
}