import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { LoginHistoryService } from '../login-history/login-history.service';
import { MailQueueService } from '../mail/mail-queue.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { RegisterDto } from '../../common/dto/register.dto';
import { LoginDto } from '../../common/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private loginHistoryService: LoginHistoryService,
        private mailQueue: MailQueueService,
        private emailVerificationService: EmailVerificationService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) {}

    async register(dto: RegisterDto, ip: string, userAgent: string) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) throw new BadRequestException('Email already exists');

        const user = await this.userService.create(
            dto.email,
            dto.password,
            dto.firstName,
            dto.lastName,
            dto.locale,
        );
        const accessToken = this.tokenService.generateAccessToken(user.id);
        const { token: refreshToken, jti } = this.tokenService.generateRefreshToken(user.id);
        await this.tokenService.saveRefreshToken(user.id, refreshToken, jti, ip, userAgent);

        let requiresEmailVerification = false;
        if (this.config.get('emailVerification.required')) {
            await this.emailVerificationService.createAndSend(user.id, user.email, user.locale || 'en');
            requiresEmailVerification = true;
        }

        return { accessToken, refreshToken, requiresEmailVerification };
    }

    async login(dto: LoginDto, ip: string, userAgent: string) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // Блокировка
        if (user.isPermanentlyLocked) {
            throw new UnauthorizedException('Account permanently locked. Contact support.');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new UnauthorizedException(`Account locked. Try in ${remaining} minutes.`);
        }

        const valid = await this.userService.validatePassword(user, dto.password);
        if (!valid) {
            await this.userService.incrementLoginAttempts(user.id);
            const attempts = user.loginAttempts + 1;
            const tempMax = this.config.get('accountLock.tempAttempts');
            const permMax = this.config.get('accountLock.permAttempts');
            if (attempts >= permMax) {
                await this.userService.permanentLock(user.id);
                await this.mailQueue.sendAccountLockedNotification(user.email, true, user.locale);
                throw new UnauthorizedException('Account permanently locked.');
            } else if (attempts >= tempMax) {
                await this.userService.temporaryLock(user.id);
                await this.mailQueue.sendAccountLockedNotification(user.email, false, user.locale);
                const lockMinutes = this.config.get('accountLock.tempLockMinutes');
                throw new UnauthorizedException(`Too many attempts. Try after ${lockMinutes} minutes.`);
            }
            throw new UnauthorizedException('Invalid credentials');
        }

        // Сброс попыток при успехе
        await this.userService.resetLoginAttempts(user.id);

        // Проверка email верификации
        if (this.config.get('emailVerification.required') && !user.isEmailVerified) {
            throw new UnauthorizedException('Please verify your email first');
        }

        // Логирование и уведомление о новом устройстве
        const isNewDevice = await this.loginHistoryService.isNewDevice(user.id, ip, userAgent);
        if (isNewDevice && this.config.get('loginHistory.notifyNewDevice')) {
            await this.mailQueue.sendNewDeviceNotification(user.email, ip, userAgent, user.locale);
        }
        await this.loginHistoryService.logLogin(user.id, ip, userAgent, true);

        const accessToken = this.tokenService.generateAccessToken(user.id);
        const { token: refreshToken, jti } = this.tokenService.generateRefreshToken(user.id);
        await this.tokenService.saveRefreshToken(user.id, refreshToken, jti, ip, userAgent);

        return { accessToken, refreshToken };
    }

    async refresh(oldRefreshToken: string) {
        let payload: any;
        try {
            payload = this.jwtService.verify(oldRefreshToken, { secret: this.config.get('jwt.refreshSecret') });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const userId = payload.sub;
        const jti = payload.jti;
        const isValid = await this.tokenService.validateRefreshToken(userId, oldRefreshToken);
        if (!isValid) throw new UnauthorizedException('Refresh token not found or expired');

        await this.tokenService.revokeRefreshTokenByJti(jti);
        const accessToken = this.tokenService.generateAccessToken(userId);
        const { token: newRefreshToken, jti: newJti } = this.tokenService.generateRefreshToken(userId);
        await this.tokenService.saveRefreshToken(userId, newRefreshToken, newJti, null, null);
        return { accessToken, refreshToken: newRefreshToken };
    }

    async logout(refreshToken: string) {
        await this.tokenService.deleteRefreshToken(refreshToken);
    }

    async forgotPassword(email: string, locale: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) return; // silent
        const code = await this.tokenService.generateResetCode(user.id);
        await this.mailQueue.sendPasswordResetEmail(email, code, this.config.get('resetCodeExpiresMinutes'), locale);
    }

    async resetPassword(email: string, code: string, newPassword: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');
        await this.tokenService.verifyResetCode(user.id, code);
        await this.userService.updatePassword(user.id, newPassword);
        await this.tokenService.deleteAllUserRefreshTokens(user.id);
    }

    async verifyEmail(code: string) {
        await this.emailVerificationService.verify(code);
    }

    async resendVerificationEmail(email: string, locale: string) {
        const user = await this.userService.findByEmail(email);
        if (!user || user.isEmailVerified) return;
        await this.emailVerificationService.createAndSend(user.id, user.email, locale);
    }
}