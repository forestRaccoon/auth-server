import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidationConfigService {
    constructor(private config: ConfigService) {}

    // Password
    getPasswordMinLength(): number {
        return this.config.get('PASSWORD_MIN_LENGTH', 8);
    }
    getPasswordMaxLength(): number {
        return this.config.get('PASSWORD_MAX_LENGTH', 50);
    }
    isPasswordRequireLetter(): boolean {
        return this.config.get('PASSWORD_REQUIRE_LETTER', true);
    }
    isPasswordRequireNumber(): boolean {
        return this.config.get('PASSWORD_REQUIRE_NUMBER', true);
    }
    isPasswordRequireSpecial(): boolean {
        return this.config.get('PASSWORD_REQUIRE_SPECIAL', false);
    }
    getPasswordSpecialChars(): string {
        return this.config.get('PASSWORD_SPECIAL_CHARS', '!@#$%^&*');
    }

    // Reset code
    getResetCodeLength(): number {
        return this.config.get('RESET_CODE_LENGTH', 6);
    }
    getResetCodeCharset(): string {
        return this.config.get('RESET_CODE_CHARSET', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    }
    getResetCodeExpiresMinutes(): number {
        return this.config.get('RESET_CODE_EXPIRES_MINUTES', 15);
    }

    // Email
    getEmailMinLength(): number {
        return this.config.get('EMAIL_MIN_LENGTH', 5);
    }
    getEmailMaxLength(): number {
        return this.config.get('EMAIL_MAX_LENGTH', 100);
    }
    getEmailRegex(): RegExp | null {
        const regexStr = this.config.get('EMAIL_REGEX');
        return regexStr ? new RegExp(regexStr) : null;
    }
    isEmailRequireTld(): boolean {
        return this.config.get('EMAIL_REQUIRE_TLD', true);
    }

    // Full name
    getFullNameMinLength(): number {
        return this.config.get('FULLNAME_MIN_LENGTH', 2);
    }
    getFullNameMaxLength(): number {
        return this.config.get('FULLNAME_MAX_LENGTH', 50);
    }
    isFullNameRequired(): boolean {
        return this.config.get('FULLNAME_REQUIRED', true);
    }
}