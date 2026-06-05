import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PasswordResetToken } from './schemas/password-reset-token.schema';
import { UserService } from '../user/user.service';
import { MailQueueService } from '../mail/mail-queue.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
    constructor(
        @InjectModel(PasswordResetToken.name) private tokenModel: Model<PasswordResetToken>,
        private userService: UserService,
        private mailQueue: MailQueueService,
        private config: ConfigService,
    ) {}

    async createAndSend(userId: string, email: string, locale: string): Promise<void> {
        await this.tokenModel.deleteMany({ userId: new Types.ObjectId(userId) });
        const code = this.generateCode();
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const expiresMinutes = this.config.get('RESET_CODE_EXPIRES_MINUTES') || 15;
        const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
        await this.tokenModel.create({
            userId: new Types.ObjectId(userId),
            codeHash,
            expiresAt,
        });
        await this.mailQueue.sendPasswordResetEmail(email, code, expiresMinutes, locale);
    }

    async verify(userId: string, code: string): Promise<void> {
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const token = await this.tokenModel.findOne({
            userId: new Types.ObjectId(userId),
            codeHash,
            expiresAt: { $gt: new Date() },
        });
        if (!token) throw new BadRequestException('Invalid or expired code');
        await this.tokenModel.deleteOne({ _id: token._id });
    }

    async deleteAllUserResetTokens(userId: string): Promise<void> {
        await this.tokenModel.deleteMany({ userId: new Types.ObjectId(userId) });
    }

    private generateCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }
}