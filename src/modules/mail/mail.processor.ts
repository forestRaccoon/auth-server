import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from './mail.service';
import { I18nService } from '../../common/services/i18n.service';

@Processor('mail')
export class MailProcessor {
    constructor(private mailService: MailService, private i18n: I18nService) {}

    @Process('send-verification')
    async handleVerification(job: Job<{ email: string; code: string; locale: string }>) {
        const { email, code, locale } = job.data;
        const html = this.mailService.getTemplate(locale, 'verify', { code });
        await this.mailService.send(email, 'Verify your email', html);
    }

    @Process('send-password-reset')
    async handlePasswordReset(job: Job<{ email: string; code: string; expiresMinutes: number; locale: string }>) {
        const { email, code, expiresMinutes, locale } = job.data;
        const html = this.mailService.getTemplate(locale, 'reset', { code, expiresMinutes });
        await this.mailService.send(email, 'Reset your password', html);
    }

    @Process('send-new-device')
    async handleNewDevice(job: Job<{ email: string; ip: string; userAgent: string; locale: string }>) {
        const { email, ip, userAgent, locale } = job.data;
        const html = this.mailService.getTemplate(locale, 'new-device', { ip, userAgent });
        await this.mailService.send(email, 'New sign-in detected', html);
    }

    @Process('send-account-locked')
    async handleAccountLocked(job: Job<{ email: string; permanent: boolean; locale: string }>) {
        const { email, permanent, locale } = job.data;
        const html = this.mailService.getTemplate(locale, 'locked', { permanent });
        await this.mailService.send(email, 'Account locked', html);
    }

    @Process('send-deletion-code')
    async handleDeletionCode(job: Job<{ email: string; code: string; expiresMinutes: number; locale: string }>) {
        const { email, code, expiresMinutes, locale } = job.data;
        const html = this.mailService.getTemplate(locale, 'deletion', { code, expiresMinutes });
        await this.mailService.send(email, 'Account deletion confirmation', html);
    }
}