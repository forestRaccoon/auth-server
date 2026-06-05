import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSessionService } from './user-session.service';
import { UserSessionController } from './user-session.controller';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema }])],
    providers: [UserSessionService],
    controllers: [UserSessionController],
    exports: [UserSessionService],
})
export class UserSessionModule {}