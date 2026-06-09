import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { getPasswordDescription } from '../../config/validation.constants';

export class PasswordDto {
    @ApiProperty({ example: 'MyCurrentPassword123!', description: getPasswordDescription() })
    @IsNotEmpty()
    @IsString()
    password: string;
}