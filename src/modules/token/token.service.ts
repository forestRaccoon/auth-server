import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './schemas/refresh-token.schema';
import { UserSessionService } from '../user-session/user-session.service';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
        private jwtService: JwtService,
        private config: ConfigService,
        private sessionService: UserSessionService,
    ) {}

    generateAccessToken(userId: string): string {
        return this.jwtService.sign(
            { sub: userId },
            {
                secret: this.config.get('jwt.accessSecret'),
                expiresIn: this.config.get('jwt.accessExpires'),
            },
        );
    }

    generateRefreshToken(userId: string): { token: string; jti: string } {
        const jti = uuidv4();
        const token = this.jwtService.sign(
            { sub: userId, jti },
            {
                secret: this.config.get('jwt.refreshSecret'),
                expiresIn: this.config.get('jwt.refreshExpires'),
            },
        );
        return { token, jti };
    }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    async saveRefreshToken(userId: string, refreshToken: string, jti: string, ip: string, userAgent: string): Promise<void> {
        const tokenHash = this.hashToken(refreshToken);
        const expiresIn = this.config.get('jwt.refreshExpires');
        const expiresMs = this.parseExpiresIn(expiresIn);
        const expiresAt = new Date(Date.now() + expiresMs);
        await this.refreshTokenModel.create({
            userId: new Types.ObjectId(userId),
            tokenHash,
            jti,
            expiresAt,
        });
        if (ip && userAgent) {
            await this.sessionService.createSession(userId, jti, ip, userAgent, expiresAt);
        }
    }

    async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        const tokenHash = this.hashToken(refreshToken);
        const doc = await this.refreshTokenModel.findOne({
            userId: new Types.ObjectId(userId),
            tokenHash,
            expiresAt: { $gt: new Date() },
        });
        return !!doc;
    }

    async deleteRefreshToken(refreshToken: string): Promise<void> {
        const tokenHash = this.hashToken(refreshToken);
        const doc = await this.refreshTokenModel.findOne({ tokenHash });
        if (doc && doc.jti) {
            await this.sessionService.revokeSessionByJti(doc.jti);
        }
        await this.refreshTokenModel.deleteOne({ tokenHash });
    }

    async revokeRefreshTokenByJti(jti: string): Promise<void> {
        await this.refreshTokenModel.findOneAndDelete({ jti });
        await this.sessionService.revokeSessionByJti(jti);
    }

    async deleteAllUserRefreshTokens(userId: string): Promise<void> {
        const tokens = await this.refreshTokenModel.find({ userId: new Types.ObjectId(userId) });
        for (const token of tokens) {
            await this.sessionService.revokeSessionByJti(token.jti);
        }
        await this.refreshTokenModel.deleteMany({ userId: new Types.ObjectId(userId) });
    }

    async generateResetCode(userId: string): Promise<string> {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const expiresMinutes = this.config.get('RESET_CODE_EXPIRES_MINUTES') || 15;
        const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
        await this.refreshTokenModel.create({
            userId: new Types.ObjectId(userId),
            tokenHash: codeHash,
            jti: `reset_${uuidv4()}`,
            expiresAt,
        });
        return code;
    }

    async verifyResetCode(userId: string, code: string): Promise<void> {
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const doc = await this.refreshTokenModel.findOne({
            userId: new Types.ObjectId(userId),
            tokenHash: codeHash,
            expiresAt: { $gt: new Date() },
        });
        if (!doc) throw new UnauthorizedException('Invalid or expired code');
        await doc.deleteOne();
    }

    private parseExpiresIn(expiresIn: string): number {
        const value = parseInt(expiresIn);
        const unit = expiresIn.slice(-1);
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 7 * 24 * 60 * 60 * 1000;
        }
    }
}