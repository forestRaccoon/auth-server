import { IsMongoId, IsEnum } from 'class-validator';
import { UserRole } from '../../modules/user/schemas/user.schema';

export class ChangeRoleDto {
    @IsMongoId()
    userId: string;

    @IsEnum(UserRole)
    role: UserRole;
}