import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { avatarStorage } from '../avatar/upload.config';

@Module({
    imports: [
        MulterModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                storage: avatarStorage.storage,
                limits: avatarStorage.limits,
                fileFilter: avatarStorage.fileFilter,
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [MulterModule],
})
export class UploadModule {}