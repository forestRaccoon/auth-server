import { Injectable } from '@nestjs/common';
import * as ru from '../locales/ru.json';
import * as en from '../locales/en.json';

@Injectable()
export class I18nService {
    private messages = { ru, en };

    t(key: string, locale: string, params?: Record<string, any>): string {
        const lang = locale === 'ru' ? 'ru' : 'en';
        let text = this.getNestedValue(this.messages[lang], key);
        if (!text) return key; // fallback
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{{${k}}}`, v);
            });
        }
        return text;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}