import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { UserSessionModule } from '../user-session/user-session.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
        JwtModule.register({}),
        UserSessionModule,
    ],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}