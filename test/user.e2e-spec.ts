import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            exceptionFactory: (errors) => {
                const messages = errors.flatMap(e => Object.values(e.constraints || {}));
                return new BadRequestException(messages);
            },
        }));
        await app.init();

        // Регистрируем тестового пользователя и получаем accessToken
        const registerRes = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'user_e2e@test.com',
                password: 'Password123',
                firstName: 'User',
                lastName: 'E2E',
            });
        accessToken = registerRes.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /users/me - should return own profile', () => {
        return request(app.getHttpServer())
            .get('/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe('user_e2e@test.com');
                expect(res.body.firstName).toBe('User');
                expect(res.body.passwordHash).toBeUndefined();
            });
    });

    it('PATCH /users/me - should update own profile', () => {
        return request(app.getHttpServer())
            .patch('/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ firstName: 'UpdatedName' })
            .expect(200)
            .expect((res) => {
                expect(res.body.firstName).toBe('UpdatedName');
            });
    });

    it('GET /users - should return 403 for regular user', () => {
        return request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(403);
    });
});