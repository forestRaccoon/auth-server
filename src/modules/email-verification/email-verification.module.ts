import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationToken, EmailVerificationTokenSchema } from './schemas/email-verification-token.schema';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: EmailVerificationToken.name, schema: EmailVerificationTokenSchema }]),
        UserModule,
        MailModule,
    ],
    providers: [EmailVerificationService],
    exports: [EmailVerificationService],
})
export class EmailVerificationModule {}