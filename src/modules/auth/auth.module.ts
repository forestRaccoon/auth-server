import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { LoginHistoryModule } from '../login-history/login-history.module';
import { MailModule } from '../mail/mail.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({}),
        UserModule,
        TokenModule,
        LoginHistoryModule,
        MailModule,
        EmailVerificationModule,
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}