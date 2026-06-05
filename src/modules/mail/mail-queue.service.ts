import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class MailQueueService {
    constructor(@InjectQueue('mail') private mailQueue: Queue) {}

    async sendVerificationEmail(email: string, code: string, locale: string) {
        await this.mailQueue.add('send-verification', { email, code, locale });
    }

    async sendPasswordResetEmail(email: string, code: string, expiresMinutes: number, locale: string) {
        await this.mailQueue.add('send-password-reset', { email, code, expiresMinutes, locale });
    }

    async sendNewDeviceNotification(email: string, ip: string, userAgent: string, locale: string) {
        await this.mailQueue.add('send-new-device', { email, ip, userAgent, locale });
    }

    async sendAccountLockedNotification(email: string, permanent: boolean, locale: string) {
        await this.mailQueue.add('send-account-locked', { email, permanent, locale });
    }

    async sendAccountDeletionCode(email: string, code: string, expiresMinutes: number, locale: string) {
        await this.mailQueue.add('send-deletion-code', { email, code, expiresMinutes, locale });
    }
}