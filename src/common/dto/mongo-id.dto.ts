import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class MongoIdParamDto {
    @ApiProperty({ example: '60d21b4667d0d8992e610c85', description: 'MongoDB ObjectId' })
    @IsMongoId()
    id: string;
}