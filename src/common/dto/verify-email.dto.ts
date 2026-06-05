import { IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
    @IsNotEmpty()
    @Length(6, 6)
    @Matches(/^[A-Z0-9]{6}$/i)
    code: string;
}