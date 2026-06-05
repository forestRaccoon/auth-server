import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetToken, PasswordResetTokenSchema } from './schemas/password-reset-token.schema';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: PasswordResetToken.name, schema: PasswordResetTokenSchema }]),
        UserModule,
        MailModule,
    ],
    providers: [PasswordResetService],
    exports: [PasswordResetService],
})
export class PasswordResetModule {}