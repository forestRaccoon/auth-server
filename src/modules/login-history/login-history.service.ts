import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoginHistory } from './schemas/login-history.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginHistoryService {
    constructor(
        @InjectModel(LoginHistory.name) private historyModel: Model<LoginHistory>,
        private config: ConfigService,
    ) {}

    async logLogin(userId: string, ip: string, userAgent: string, success: boolean, failureReason?: string): Promise<void> {
        await this.historyModel.create({
            userId: new Types.ObjectId(userId),
            ip,
            userAgent,
            success,
            failureReason,
        });
    }

    async getUserHistory(userId: string, limit?: number): Promise<LoginHistory[]> {
        const maxLimit = this.config.get('loginHistory.limit') || 10;
        const effectiveLimit = Math.min(limit || maxLimit, maxLimit);
        return this.historyModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(effectiveLimit)
            .exec();
    }

    async isNewDevice(userId: string, ip: string, userAgent: string): Promise<boolean> {
        const recentSuccess = await this.historyModel.findOne({
            userId: new Types.ObjectId(userId),
            ip,
            userAgent,
            success: true,
            createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
        });
        return !recentSuccess;
    }
}