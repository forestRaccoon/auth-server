import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = req;
        const userAgent = headers['user-agent'] || 'unknown';
        const start = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - start;
                    this.logger.log(`${method} ${url} ${duration}ms - ${ip} - ${userAgent}`);
                },
                error: (err) => {
                    const duration = Date.now() - start;
                    this.logger.error(`${method} ${url} ${duration}ms - ${ip} - ${userAgent} - Error: ${err.message}`);
                },
            }),
        );
    }
}