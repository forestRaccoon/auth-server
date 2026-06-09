import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { validationConstants, getCodeDescription } from '../../config/validation.constants';

const { resetCode } = validationConstants;

export class DeletionCodeDto {
    @ApiProperty({ example: 'A7F3K9', description: getCodeDescription() })
    @IsNotEmpty()
    @Length(resetCode.length, resetCode.length)
    @Matches(new RegExp(`^[${resetCode.charset}]{${resetCode.length}}$`), {
        message: `Code must be ${resetCode.length} alphanumeric characters`,
    })
    code: string;
}