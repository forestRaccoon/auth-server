import { Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const BullQueueProvider = BullModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
        redis: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
            password: configService.get('redis.password') || undefined,
        },
    }),
    inject: [ConfigService],
});