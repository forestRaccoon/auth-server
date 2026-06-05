import { IsNotEmpty, Length, Matches } from 'class-validator';

export class DeletionCodeDto {
    @IsNotEmpty()
    @Length(6, 6)
    @Matches(/^[A-Z0-9]{6}$/i, { message: 'Code must be 6 alphanumeric characters' })
    code: string;
}