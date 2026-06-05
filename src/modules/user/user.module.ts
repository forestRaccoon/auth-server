import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSeedService } from './user-seed.service';
import { UserDeletionService } from './user-deletion.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserDeletionToken, UserDeletionTokenSchema } from './schemas/user-deletion-token.schema';
import { TokenModule } from '../token/token.module';
import { UserSessionModule } from '../user-session/user-session.module';
import { MailModule  } from '../mail/mail.module';
import { AvatarModule } from '../avatar/avatar.module';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserDeletionToken.name, schema: UserDeletionTokenSchema },
        ]),
        TokenModule,
        UserSessionModule,
        MailModule ,
        AvatarModule,
        CommonModule,
    ],
    providers: [UserService, UserSeedService, UserDeletionService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}