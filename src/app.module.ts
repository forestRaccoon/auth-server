import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TokenModule } from './modules/token/token.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { PasswordResetModule } from './modules/password-reset/password-reset.module';
import { LoginHistoryModule } from './modules/login-history/login-history.module';
import { UserSessionModule } from './modules/user-session/user-session.module';
import { MailModule } from './modules/mail/mail.module';
import { AvatarModule } from './modules/avatar/avatar.module';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
    imports: [
        ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({ uri: config.get('database.mongoUri') }),
            inject: [ConfigService],
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [{
                ttl: config.get('throttle.ttl'),
                limit: config.get('throttle.limit'),
            }],
        }),
        CommonModule,
        AuthModule,
        UserModule,
        TokenModule,
        EmailVerificationModule,
        PasswordResetModule,
        LoginHistoryModule,
        UserSessionModule,
        MailModule,
        AvatarModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}