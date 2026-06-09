import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({ example: 'ABC123', description: '6-character alphanumeric verification code' })
    @IsNotEmpty()
    @Length(6, 6)
    @Matches(/^[A-Z0-9]{6}$/i)
    code: string;
}