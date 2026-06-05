import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
    private transporter;
    private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor(private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: config.get('smtp.host'),
            port: config.get('smtp.port'),
            secure: config.get('smtp.secure'),
            auth: { user: config.get('smtp.user'), pass: config.get('smtp.pass') },
        });
        this.loadTemplates();
    }

    private loadTemplates() {
        const locales = ['ru', 'en'];
        const types = ['verify', 'reset', 'new-device', 'locked', 'deletion'];
        for (const locale of locales) {
            for (const type of types) {
                const filePath = path.join(__dirname, 'templates', locale, `${type}.hbs`);
                if (fs.existsSync(filePath)) {
                    const source = fs.readFileSync(filePath, 'utf-8');
                    this.templates.set(`${locale}_${type}`, Handlebars.compile(source));
                }
            }
        }
    }

    async send(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: this.config.get('smtp.from'),
            to,
            subject,
            html,
        });
    }

    getTemplate(locale: string, type: string, data: any): string {
        const template = this.templates.get(`${locale}_${type}`);
        if (!template) throw new Error(`Template not found: ${locale}_${type}`);
        return template(data);
    }
}