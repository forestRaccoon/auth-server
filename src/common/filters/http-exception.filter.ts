import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from '../services/i18n.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private i18n: I18nService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const locale = request.headers['accept-language']?.startsWith('ru') ? 'ru' : 'en';

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = this.i18n.t('errors.500', locale, {});

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (exception instanceof BadRequestException && typeof exceptionResponse === 'object' && Array.isArray(exceptionResponse['message'])) {
                const originalMessages = exceptionResponse['message'];
                message = originalMessages.map((msg: string) => {
                    const translated = this.i18n.t(msg, locale, {});
                    return translated !== msg ? translated : msg;
                });
            }
            else if (typeof exceptionResponse === 'string') {
                message = this.i18n.t(exceptionResponse, locale, {});
            } else if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
                const origMsg = exceptionResponse['message'];
                if (typeof origMsg === 'string') {
                    message = this.i18n.t(origMsg, locale, {});
                } else {
                    message = origMsg;
                }
            } else {
                const translatedKey = `errors.${status}`;
                message = this.i18n.t(translatedKey, locale, {});
            }
        } else {
            console.error('Unhandled error:', exception);
        }

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}