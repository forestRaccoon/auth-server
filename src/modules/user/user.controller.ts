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
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(
        private userService: UserService,
        private deletionService: UserDeletionService,
        private avatarService: AvatarService,
        private config: ConfigService,
    ) {}

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile returned.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    async getMyProfile(@CurrentUser() currentUser) {
        const user = await this.userService.findById(currentUser.userId);
        return this.sanitizeUser(user);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'Profile updated.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    async updateMyProfile(@CurrentUser() currentUser, @Body() dto: UpdateUserDto) {
        const user = await this.userService.updateUser(currentUser.userId, dto, currentUser);
        return this.sanitizeUser(user);
    }

    @Post('delete-request')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request account deletion code' })
    @ApiResponse({ status: 200, description: 'Deletion code sent to email.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Superadmin cannot be deleted.' })
    async requestAccountDeletion(@CurrentUser() currentUser) {
        const user = await this.userService.findById(currentUser.userId);
        if (!user) throw new Error('User not found');
        if (user.role === UserRole.SUPER_ADMIN) throw new Error('Superadmin cannot be deleted');
        await this.deletionService.requestDeletion(currentUser.userId, user.email, user.locale);
        return { message: 'Deletion code sent to your email' };
    }

    @Post('delete-confirm')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Confirm account deletion with code' })
    @ApiBody({ schema: { type: 'object', properties: { code: { type: 'string' } } } })
    @ApiResponse({ status: 204, description: 'Account deleted.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiBadRequestResponse({ description: 'Invalid or expired code.' })
    async confirmAccountDeletion(@CurrentUser() currentUser, @Body('code') code: string) {
        await this.deletionService.confirmDeletion(currentUser.userId, code);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar', avatarStorage))
    @ApiOperation({ summary: 'Upload avatar (multipart/form-data)' })
    @ApiBody({ schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } } })
    @ApiResponse({ status: 200, description: 'Avatar uploaded and processed.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiBadRequestResponse({ description: 'Invalid file type or size.' })
    async uploadAvatar(
        @CurrentUser() currentUser,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: new RegExp('image/jpeg|image/png|image/gif|image/webp') }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        const { originalUrl, thumbnailUrl } = await this.avatarService.processAndSave(
            file.path,
            currentUser.userId,
        );
        await this.userService.updateUser(
            currentUser.userId,
            { avatar: originalUrl, avatarThumbnail: thumbnailUrl },
            currentUser,
        );
        return { originalUrl, thumbnailUrl };
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List all users (admin/editor/superadmin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, description: 'List of users (paginated).' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions (requires admin/editor/superadmin role).' })
    async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20, @CurrentUser() currentUser) {
        const maxLimit = this.config.get<number>('pagination.maxLimit') ?? 100;
        const effectiveLimit = Math.min(limit, maxLimit);
        const { data, total } = await this.userService.findAll(currentUser.role, page, effectiveLimit);
        return {
            data: data.map((u) => this.sanitizeUser(u)),
            total,
            page,
            limit: effectiveLimit,
        };
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get user by ID (admin/editor/superadmin only)' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiResponse({ status: 200, description: 'User data.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Access denied (insufficient role or attempt to view superadmin).' })
    @ApiNotFoundResponse({ description: 'User not found.' })
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
    @ApiOperation({ summary: 'Update any user (admin/editor/superadmin only)' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: 'User updated.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Cannot modify superadmin.' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    async updateUserById(
        @Param() params: MongoIdParamDto,
        @Body() dto: UpdateUserDto,
        @CurrentUser() currentUser,
    ) {
        const user = await this.userService.updateUser(params.id, dto, currentUser);
        return this.sanitizeUser(user);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete any user (admin/superadmin only)' })
    @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
    @ApiResponse({ status: 204, description: 'User deleted.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    @ApiForbiddenResponse({ description: 'Cannot delete superadmin.' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    async deleteUserById(@Param() params: MongoIdParamDto, @CurrentUser() currentUser) {
        const user = await this.userService.findById(params.id);
        if (!user) throw new Error('User not found');
        if (user.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Cannot delete superadmin');
        }
        await this.userService.hardDeleteUser(params.id);
    }

    private sanitizeUser(user: any) {
        if (!user) return null;
        const { passwordHash, ...result } = user.toObject ? user.toObject() : user;
        return result;
    }
}