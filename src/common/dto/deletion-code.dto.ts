import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordDto {
    @ApiProperty({
        example: 'MyCurrentPassword123!',
        description: 'Current user password for verification',
        minLength: 1,
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}