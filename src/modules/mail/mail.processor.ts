import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from './mail.service';
import { I18nService } from '../../common/services/i18n.service';

@Processor('mail')
export class MailProcessor {
    constructor(
        private mailService: MailService,
        private i18n: I18nService,
    ) {}

    private getSubject(locale: string, type: string): string {
        const subjects: Record<string, Record<string, string>> = {
            en: {
                verify: 'Verify your email',
                reset: 'Reset your password',
                newDevice: 'New sign-in detected',
                locked: 'Account locked',
                deletion: 'Confirm account deletion',
            },
            ru: {
                verify: 'Подтверждение email',
                reset: 'Сброс пароля',
                newDevice: 'Новый вход в аккаунт',
                locked: 'Блокировка аккаунта',
                deletion: 'Подтверждение удаления аккаунта',
            },
        };
        const lang = locale === 'ru' ? 'ru' : 'en';
        return subjects[lang]?.[type] || subjects.en[type];
    }

    @Process('send-verification')
    async handleVerification(job: Job<{ email: string; code: string; locale: string }>) {
        try {
            const { email, code, locale } = job.data;
            const year = new Date().getFullYear();
            const subject = this.getSubject(locale, 'verify');
            const html = this.mailService.getTemplate(locale, 'verify', { code, year });
            await this.mailService.send(email, subject, html);
        } catch (error) {
            console.error(`Failed to send verification email: ${error.message}`);
            throw error;
        }
    }

    @Process('send-password-reset')
    async handlePasswordReset(job: Job<{ email: string; code: string; expiresMinutes: number; locale: string }>) {
        try {
            const { email, code, expiresMinutes, locale } = job.data;
            const year = new Date().getFullYear();
            const subject = this.getSubject(locale, 'reset');
            const html = this.mailService.getTemplate(locale, 'reset', { code, expiresMinutes, year });
            await this.mailService.send(email, subject, html);
        } catch (error) {
            console.error(`Failed to send password reset email: ${error.message}`);
            throw error;
        }
    }

    @Process('send-new-device')
    async handleNewDevice(job: Job<{ email: string; ip: string; userAgent: string; locale: string }>) {
        try {
            const { email, ip, userAgent, locale } = job.data;
            const year = new Date().getFullYear();
            const timestamp = new Date().toLocaleString();
            const subject = this.getSubject(locale, 'newDevice');
            const html = this.mailService.getTemplate(locale, 'new-device', { ip, userAgent, timestamp, year });
            await this.mailService.send(email, subject, html);
        } catch (error) {
            console.error(`Failed to send new device email: ${error.message}`);
            throw error;
        }
    }

    @Process('send-account-locked')
    async handleAccountLocked(job: Job<{ email: string; permanent: boolean; locale: string }>) {
        try {
            const { email, permanent, locale } = job.data;
            const year = new Date().getFullYear();
            const subject = this.getSubject(locale, 'locked');
            const html = this.mailService.getTemplate(locale, 'locked', { permanent, year });
            await this.mailService.send(email, subject, html);
        } catch (error) {
            console.error(`Failed to send account locked email: ${error.message}`);
            throw error;
        }
    }

    @Process('send-deletion-code')
    async handleDeletionCode(job: Job<{ email: string; code: string; expiresMinutes: number; locale: string }>) {
        try {
            const { email, code, expiresMinutes, locale } = job.data;
            const year = new Date().getFullYear();
            const subject = this.getSubject(locale, 'deletion');
            const html = this.mailService.getTemplate(locale, 'deletion', { code, expiresMinutes, year });
            await this.mailService.send(email, subject, html);
        } catch (error) {
            console.error(`Failed to send deletion code email: ${error.message}`);
            throw error;
        }
    }
}