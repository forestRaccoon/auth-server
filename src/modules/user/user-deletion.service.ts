import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDeletionToken } from './schemas/user-deletion-token.schema';
import { UserService } from './user.service';
import { MailQueueService } from '../mail/mail-queue.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class UserDeletionService {
    constructor(
        @InjectModel(UserDeletionToken.name) private tokenModel: Model<UserDeletionToken>,
        private userService: UserService,
        private mailQueue: MailQueueService,
        private config: ConfigService,
    ) {}

    async requestDeletion(userId: string, email: string | null, locale: string): Promise<void> {
        await this.tokenModel.deleteMany({ userId: new Types.ObjectId(userId) });

        const code = this.generateCode();
        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const expiresMinutes = this.config.get('DELETION_CODE_EXPIRES_MINUTES') || 15;
        const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
        await this.tokenModel.create({
            userId: new Types.ObjectId(userId),
            codeHash,
            expiresAt,
        });

        if (email) {
            await this.mailQueue.sendAccountDeletionCode(email, code, expiresMinutes, locale);
        }
    }

    async confirmDeletion(userId: string, code: string): Promise<void> {
        const token = await this.tokenModel.findOne({
            userId: new Types.ObjectId(userId),
            expiresAt: { $gt: new Date() },
        });
        if (!token) throw new BadRequestException('No pending deletion request or code expired');

        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        if (token.codeHash !== codeHash) throw new BadRequestException('Invalid code');

        await this.tokenModel.deleteOne({ _id: token._id });
        await this.userService.hardDeleteUser(userId);
    }

    private generateCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }
}