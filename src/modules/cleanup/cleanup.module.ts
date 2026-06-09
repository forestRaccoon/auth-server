import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [CleanupService],
})
export class CleanupModule {}