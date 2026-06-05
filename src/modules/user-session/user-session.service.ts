import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSession } from './schemas/user-session.schema';

@Injectable()
export class UserSessionService {
    constructor(@InjectModel(UserSession.name) private sessionModel: Model<UserSession>) {}

    async createSession(userId: string, jti: string, ip: string, userAgent: string, expiresAt: Date): Promise<UserSession> {
        const session = new this.sessionModel({
            userId: new Types.ObjectId(userId),
            refreshTokenJti: jti,
            ip,
            userAgent,
            expiresAt,
            isActive: true,
        });
        return session.save();
    }

    async getActiveSessions(userId: string): Promise<UserSession[]> {
        return this.sessionModel.find({
            userId: new Types.ObjectId(userId),
            isActive: true,
            expiresAt: { $gt: new Date() },
        }).exec();
    }

    async revokeSessionByJti(jti: string): Promise<void> {
        await this.sessionModel.findOneAndUpdate({ refreshTokenJti: jti }, { isActive: false });
    }

    async revokeAllSessions(userId: string, exceptJti?: string): Promise<void> {
        const filter: any = { userId: new Types.ObjectId(userId), isActive: true };
        if (exceptJti) filter.refreshTokenJti = { $ne: exceptJti };
        await this.sessionModel.updateMany(filter, { isActive: false });
    }

    async deactivateAllSessions(userId: string): Promise<void> {
        await this.sessionModel.updateMany({ userId: new Types.ObjectId(userId), isActive: true }, { isActive: false });
    }
}