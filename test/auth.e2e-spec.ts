import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

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
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/register (POST) - success', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'e2e@test.com',
                password: 'Password123',
                firstName: 'E2E',
                lastName: 'Tester',
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.accessToken).toBeDefined();
                expect(res.body.requiresEmailVerification).toBeDefined();
            });
    });

    it('/auth/register (POST) - duplicate email', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'e2e@test.com',
                password: 'Password123',
                firstName: 'E2E',
            })
            .expect(400);
    });

    it('/auth/login (POST) - success', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'e2e@test.com', password: 'Password123' })
            .expect(200)
            .expect((res) => {
                expect(res.body.accessToken).toBeDefined();
                expect(res.headers['set-cookie']).toBeDefined();
            });
    });

    it('/auth/login (POST) - invalid password', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'e2e@test.com', password: 'wrong' })
            .expect(401);
    });
});