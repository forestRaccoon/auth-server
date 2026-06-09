import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import csurf from 'csurf';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { I18nService } from './common/services/i18n.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const i18n = app.get(I18nService);
    app.setGlobalPrefix('api');

    // --- Лимиты запросов ---
    const jsonLimit = configService.get('REQUEST_JSON_LIMIT_MB', 1);
    app.use(express.json({ limit: `${jsonLimit}mb` }));
    app.use(express.urlencoded({ extended: true, limit: `${jsonLimit}mb` }));

    // --- Helmet (безопасность) ---
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: process.env.MODE === 'production' ? true : null,
            },
        },
    }));

    app.use(compression());
    app.use(cookieParser());

    // --- CORS ---
    app.enableCors({
        origin: configService.get('FRONTEND_URL', 'http://localhost:3001'),
        credentials: true,
    });

    // --- CSRF (только если секрет задан) ---
    const csrfSecret = configService.get('CSRF_SECRET');
    if (csrfSecret) {
        app.use(session({
            secret: csrfSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { secure: process.env.NODE_ENV === 'production' },
        }));

        // Список публичных эндпоинтов, которые не требуют CSRF-защиты
        const publicPaths = [
            '/api/auth/register',
            '/api/auth/login',
            '/api/auth/refresh',
            '/api/auth/forgot-password',
            '/api/auth/reset-password',
            '/api/auth/verify-email',
            '/api/auth/resend-verification',
            '/api/users/avatar',   // загрузка аватарки (multipart)
        ];

        app.use((req, res, next) => {
            // Проверяем, принадлежит ли путь к публичным
            if (publicPaths.some(path => req.path === path || req.path.startsWith(path + '/'))) {
                return next();
            }
            // Исключаем документацию Swagger
            if (req.path.startsWith('/api/docs') || req.path === '/api/docs-json') {
                return next();
            }
            // Для всех остальных маршрутов применяем csurf
            return csurf({ cookie: true })(req, res, next);
        });

        // Передаём CSRF-токен в куку (для клиента)
        app.use((req, res, next) => {
            if (req.csrfToken && !req.path.startsWith('/api/docs')) {
                res.cookie('XSRF-TOKEN', req.csrfToken());
            }
            next();
        });
    }

    // --- Глобальный ValidationPipe (без i18n, перевод будет в фильтре) ---
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors) => {
            const messages = errors.flatMap(e => Object.values(e.constraints || {}));
            const translated = messages.map(m => i18n.t(m, 'en', { default: m }));
            return new BadRequestException(translated);
        },
    }));

    // --- Глобальный фильтр ошибок (уже переводит сообщения через i18n) ---
    app.useGlobalFilters(new HttpExceptionFilter(i18n));
    app.useGlobalInterceptors(new LoggingInterceptor());

    // --- Swagger ---
    if (process.env.NODE_ENV !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Auth API')
            .setDescription('Full featured authentication server')
            .setVersion('1.0')
            .addBearerAuth()
            .addCookieAuth('refreshToken')
            .build();
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api/docs', app, document);
    }

    // --- Статика для аватарок ---
    app.use('/avatars', express.static(configService.get('AVATAR_FINAL_DIR', './uploads/avatars')));

    // --- Запуск ---
    const port = configService.get('PORT', 3000);
    const server = await app.listen(port);

    // --- Graceful shutdown ---
    const shutdownTimeout = configService.get('GRACEFUL_SHUTDOWN_TIMEOUT_MS', 10000);
    const gracefulShutdown = async (signal: string) => {
        console.log(`${signal} received, closing...`);
        server.close(async (err) => {
            if (err) console.error(err);
            await app.close();
            process.exit(0);
        });
        setTimeout(() => {
            console.error('Forced shutdown');
            process.exit(1);
        }, shutdownTimeout);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    console.log(`Server listening on port ${port}`);
}
bootstrap();