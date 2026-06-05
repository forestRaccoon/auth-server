import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizeService {
    sanitize(text: string): string {
        return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
    }
}