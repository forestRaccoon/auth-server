import {
    Controller,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Post,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UserDeletionService } from './user-deletion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../../common/dto/update-user.dto';
import { UserRole } from './schemas/user.schema';
import { MongoIdParamDto } from '../../common/dto/mongo-id.dto';
import { avatarStorage } from '../avatar/upload.config';
import { AvatarService } from '../avatar/avatar.service';
import { ConfigService } from '@nestjs/config';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(
        private userService: UserService,
        private deletionService: UserDeletionService,
        private avatarService: AvatarService,
        private config: ConfigService,
    ) {}

    // ========== Свой профиль ==========
    @Get('me')
    async getMyProfile(@CurrentUser() currentUser) {
        const user = await this.userService.findById(currentUser.userId);
        return this.sanitizeUser(user);
    }

    @Patch('me')
    async updateMyProfile(@CurrentUser() currentUser, @Body() dto: UpdateUserDto) {
        const user = await this.userService.updateUser(currentUser.userId, dto, currentUser);
        return this.sanitizeUser(user);
    }

    // ========== Удаление аккаунта ==========
    @Post('delete-request')
    @HttpCode(HttpStatus.OK)
    async requestAccountDeletion(@CurrentUser() currentUser) {
        const user = await this.userService.findById(currentUser.userId);
        if (!user) throw new Error('User not found');
        if (user.role === UserRole.SUPER_ADMIN) throw new Error('Superadmin cannot be deleted');
        const locale = user.locale;
        await this.deletionService.requestDeletion(currentUser.userId, user.email, locale);
        return { message: 'Deletion code sent to your email' };
    }

    @Post('delete-confirm')
    @HttpCode(HttpStatus.NO_CONTENT)
    async confirmAccountDeletion(@CurrentUser() currentUser, @Body('code') code: string) {
        await this.deletionService.confirmDeletion(currentUser.userId, code);
    }

    // ========== Аватар ==========
    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar', avatarStorage))
    async uploadAvatar(
        @CurrentUser() currentUser,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),   // 5 MB
                    new FileTypeValidator({ fileType: new RegExp('image/jpeg|image/png|image/gif|image/webp') }),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        const { originalUrl, thumbnailUrl } = await this.avatarService.processAndSave(file.path, currentUser.userId);
        await this.userService.updateUser(currentUser.userId, { avatar: originalUrl, avatarThumbnail: thumbnailUrl }, currentUser);
        return { originalUrl, thumbnailUrl };
    }

    // ========== Админ / Редактор / Суперадмин ==========
    @Get()
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.SUPER_ADMIN)
    async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20, @CurrentUser() currentUser) {
        const maxLimit = this.config.get<number>('pagination.maxLimit') ?? 100;
        const effectiveLimit = Math.min(limit, maxLimit);
        const { data, total } = await this.userService.findAll(currentUser.role, page, effectiveLimit);
        return {
            data: data.map(u => this.sanitizeUser(u)),
            total,
            page,
            limit: effectiveLimit,
        };
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.SUPER_ADMIN)
    async getUserById(@Param() params: MongoIdParamDto, @CurrentUser() currentUser) {
        const user = await this.userService.findById(params.id);
        if (!user) throw new Error('User not found');
        if (user.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Access denied');
        }
        return this.sanitizeUser(user);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.SUPER_ADMIN)
    async updateUserById(@Param() params: MongoIdParamDto, @Body() dto: UpdateUserDto, @CurrentUser() currentUser) {
        const user = await this.userService.updateUser(params.id, dto, currentUser);
        return this.sanitizeUser(user);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUserById(@Param() params: MongoIdParamDto, @CurrentUser() currentUser) {
        const user = await this.userService.findById(params.id);
        if (!user) throw new Error('User not found');
        if (user.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Cannot delete superadmin');
        }
        await this.userService.hardDeleteUser(params.id);
    }

    // ========== Helper ==========
    private sanitizeUser(user: any) {
        if (!user) return null;
        const { passwordHash, ...result } = user.toObject ? user.toObject() : user;
        return result;
    }
}