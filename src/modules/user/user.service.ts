import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SanitizeService } from '../../common/services/sanitize.service';
import { TokenService } from '../token/token.service';
import { UserSessionService } from '../user-session/user-session.service';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private config: ConfigService,
        private sanitize: SanitizeService,
        private tokenService: TokenService,
        private sessionService: UserSessionService,
    ) {}

    async create(email: string, password: string, firstName: string, lastName?: string, locale?: string): Promise<User> {
        const existing = await this.userModel.findOne({ email });
        if (existing) throw new BadRequestException('Email already exists');

        const saltRounds = this.config.get('bcryptSaltRounds');
        const passwordHash = await bcrypt.hash(password, saltRounds);
        let avatar = this.config.get('defaultAvatarUrl');
        if (avatar && avatar.includes('{{email_hash}}')) {
            const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
            avatar = avatar.replace('{{email_hash}}', hash);
        }
        const defaultRole = this.config.get('defaultUserRole') || UserRole.USER;
        const userLocale = locale || 'en';

        const user = new this.userModel({
            email,
            passwordHash,
            firstName: this.sanitize.sanitize(firstName),
            lastName: lastName ? this.sanitize.sanitize(lastName) : undefined,
            avatar,
            role: defaultRole,
            locale: userLocale,
        });
        return user.save();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email, deletedAt: null }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findOne({ _id: id, deletedAt: null }).exec();
    }

    async updateUser(userId: string, updateData: Partial<User>, currentUser?: { userId: string; role: UserRole }): Promise<User> {
        const targetUser = await this.findById(userId);
        if (!targetUser) throw new NotFoundException('User not found');

        // Защита суперадмина
        if (targetUser.role === UserRole.SUPER_ADMIN && currentUser?.userId !== userId) {
            throw new ForbiddenException('Cannot modify superadmin');
        }

        // Проверка роли
        if (updateData.role && updateData.role !== targetUser.role) {
            this.validateRoleChange(targetUser, updateData.role, currentUser);
        }

        // Уникальность email
        if (updateData.email && updateData.email !== targetUser.email) {
            const existing = await this.userModel.findOne({ email: updateData.email, _id: { $ne: userId } });
            if (existing) throw new BadRequestException('Email already registered');
        }

        // Санитизация
        if (updateData.firstName) updateData.firstName = this.sanitize.sanitize(updateData.firstName);
        if (updateData.lastName) updateData.lastName = this.sanitize.sanitize(updateData.lastName);

        Object.assign(targetUser, updateData);
        await targetUser.save();
        return targetUser;
    }

    private validateRoleChange(target: User, newRole: UserRole, currentUser?: { userId: string; role: UserRole }): void {
        if (!currentUser) throw new ForbiddenException('Not authorized');
        if (target.role === UserRole.SUPER_ADMIN) throw new ForbiddenException('Cannot change superadmin role');
        if (target.id === currentUser.userId) throw new ForbiddenException('Cannot change your own role');
        if (currentUser.role === UserRole.SUPER_ADMIN) return;
        if (currentUser.role === UserRole.ADMIN) return;
        throw new ForbiddenException('You do not have permission to change roles');
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        const saltRounds = this.config.get('bcryptSaltRounds');
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);
        await this.userModel.findByIdAndUpdate(userId, { passwordHash });
    }

    async incrementLoginAttempts(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { $inc: { loginAttempts: 1 } });
    }

    async resetLoginAttempts(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { loginAttempts: 0, lockedUntil: null });
    }

    async temporaryLock(userId: string): Promise<void> {
        const lockMinutes = this.config.get('accountLock.tempLockMinutes');
        const lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
        await this.userModel.findByIdAndUpdate(userId, { lockedUntil });
    }

    async permanentLock(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { isPermanentlyLocked: true });
    }

    async markEmailAsVerified(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { isEmailVerified: true });
    }

    async validatePassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.passwordHash);
    }

    async findAll(role?: UserRole, page: number = 1, limit: number = 20): Promise<{ data: User[]; total: number }> {
        const filter: any = { deletedAt: null };
        if (role !== UserRole.SUPER_ADMIN) filter.role = { $ne: UserRole.SUPER_ADMIN };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.userModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
            this.userModel.countDocuments(filter),
        ]);
        return { data, total };
    }
    async hardDeleteUser(userId: string): Promise<void> {
        const user = await this.userModel.findByIdAndDelete(userId);
        if (!user) throw new NotFoundException('User not found');
        await this.tokenService.deleteAllUserRefreshTokens(userId);
        await this.sessionService.deactivateAllSessions(userId);
        // Дополнительно: удалить токены сброса пароля, удаления и т.д.
        // (по желанию)
    }

    async softDeleteUser(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { deletedAt: new Date() });
        await this.sessionService.deactivateAllSessions(userId);
    }
}