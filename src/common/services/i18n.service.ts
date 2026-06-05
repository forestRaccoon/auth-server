import { Injectable } from '@nestjs/common';
import * as ru from '../locales/ru.json';
import * as en from '../locales/en.json';

@Injectable()
export class I18nService {
    private messages = { ru, en };

    t(key: string, locale: string, params?: Record<string, any>): string {
        const lang = locale === 'ru' ? 'ru' : 'en';
        let text = this.messages[lang]?.[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(new RegExp(`{{${k}}}`, 'g'), v);
            });
        }
        return text;
    }
}