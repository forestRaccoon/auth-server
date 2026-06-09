import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private config: ConfigService,
    ) {}

    @Cron(process.env.CLEANUP_CRON_SCHEDULE || '0 0 * * *')
    async cleanUnverifiedUsers() {
        const enabled = this.config.get('cleanup.unverifiedEnabled');
        if (!enabled) {
            this.logger.log('Cleanup of unverified users is disabled');
            return;
        }

        const days = this.config.get('cleanup.unverifiedDays');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await this.userModel.deleteMany({
            isEmailVerified: false,
            createdAt: { $lt: cutoffDate },
        });

        if (result.deletedCount > 0) {
            this.logger.log(`Deleted ${result.deletedCount} unverified users (older than ${days} days)`);
        } else {
            this.logger.log('No unverified users to delete');
        }
    }
}