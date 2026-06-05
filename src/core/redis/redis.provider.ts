import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export type RedisClient = Redis;

export const RedisProvider: Provider = {
    provide: 'REDIS_CLIENT',
    useFactory: (configService: ConfigService): RedisClient => {
        return new Redis({
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
            password: configService.get('redis.password') || undefined,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
    },
    inject: [ConfigService],
};