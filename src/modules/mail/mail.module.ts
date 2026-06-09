import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailService } from './mail.service';
import { MailQueueService } from './mail-queue.service';
import { MailProcessor } from './mail.processor';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        BullModule.registerQueueAsync({
            name: 'mail',
            useFactory: (config: ConfigService) => ({
                redis: {
                    host: config.get('redis.host'),
                    port: config.get('redis.port'),
                    password: config.get('redis.password'),
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService, MailQueueService, MailProcessor],
    exports: [MailQueueService],
})
export class MailModule {}