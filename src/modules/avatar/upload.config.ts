import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const avatarStorage = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = configService.get('avatar.tempDir') || './uploads/temp';
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const ext = extname(file.originalname);
            const filename = `${uuidv4()}${ext}`;
            cb(null, filename);
        },
    }),
    limits: {
        fileSize: (parseInt(configService.get('avatar.maxSizeMb') || '5', 10)) * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = configService.get('avatar.allowedMimes') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Unsupported file type'), false);
        }
    },
};