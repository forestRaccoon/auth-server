import { Injectable, BadRequestException } from '@nestjs/common';
import sharp, { FitEnum } from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AvatarService {
    constructor(private config: ConfigService) {}

    async processAndSave(tempPath: string, userId: string): Promise<{ originalUrl: string; thumbnailUrl: string }> {
        const finalDir = this.config.get('avatar.finalDir');
        const userDir = path.join(finalDir, userId);
        await fs.mkdir(userDir, { recursive: true });

        const originalFilename = `original_${Date.now()}.webp`;
        const thumbFilename = `thumb_${Date.now()}.webp`;
        const originalPath = path.join(userDir, originalFilename);
        const thumbPath = path.join(userDir, thumbFilename);

        const image = sharp(tempPath);
        const metadata = await image.metadata();
        const maxDimension = this.config.get('avatar.maxDimension');
        const thumbDimension = this.config.get('avatar.thumbDimension');

        let resizeOptions: sharp.ResizeOptions | undefined = { width: maxDimension, height: maxDimension, fit: 'inside' };
        if (metadata.width <= maxDimension && metadata.height <= maxDimension) {
            resizeOptions = undefined;
        }

        // Изменяем размер, если нужно
        let pipeline = image;
        if (resizeOptions) {
            pipeline = pipeline.resize(resizeOptions);
        }
        await pipeline.webp({ quality: 80 }).toFile(originalPath);

        // Миниатюра с обрезкой
        await sharp(tempPath)
            .resize(thumbDimension, thumbDimension, { fit: 'cover' })
            .webp({ quality: 70 })
            .toFile(thumbPath);

        await fs.unlink(tempPath);

        const originalUrl = `/avatars/${userId}/${originalFilename}`;
        const thumbnailUrl = `/avatars/${userId}/${thumbFilename}`;
        return { originalUrl, thumbnailUrl };
    }
}