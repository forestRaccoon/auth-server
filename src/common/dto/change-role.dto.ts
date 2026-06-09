import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsEnum } from 'class-validator';
import { UserRole } from '../../modules/user/schemas/user.schema';

export class ChangeRoleDto {
    @ApiProperty({ example: '60d21b4667d0d8992e610c85', description: 'MongoDB ObjectId of the user' })
    @IsMongoId()
    userId: string;

    @ApiProperty({ enum: UserRole, description: 'New role for the user' })
    @IsEnum(UserRole)
    role: UserRole;
}