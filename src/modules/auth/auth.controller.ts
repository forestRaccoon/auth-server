import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from '../../common/dto/register.dto';
import { LoginDto } from '../../common/dto/login.dto';
import { ForgotPasswordDto } from '../../common/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../common/dto/reset-password.dto';
import { VerifyEmailDto } from '../../common/dto/verify-email.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Throttle({ default: { limit: 3, ttl: 3600 } })
    @Post('register')
    async register(@Res({ passthrough: true }) res: Response, @Body() dto: RegisterDto, @Req() req: Request) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const { accessToken, refreshToken, requiresEmailVerification } = await this.authService.register(dto, ip, userAgent);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken, requiresEmailVerification };
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 900 } })
    @Post('login')
    async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginDto, @Req() req: Request) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const { accessToken, refreshToken } = await this.authService.login(dto, ip, userAgent);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }

    @Public()
    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const oldRefreshToken = req.cookies['refreshToken'];
        if (!oldRefreshToken) throw new Error('Refresh token missing');
        const { accessToken, refreshToken } = await this.authService.refresh(oldRefreshToken);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        if (refreshToken) await this.authService.logout(refreshToken);
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
        const locale = req.headers['accept-language']?.startsWith('ru') ? 'ru' : 'en';
        await this.authService.forgotPassword(dto.email, locale);
        return { message: 'If user exists, reset code sent to email' };
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
        return { message: 'Password updated successfully' };
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
        await this.authService.verifyEmail(dto.code);
        return { message: 'Email verified successfully' };
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    async resendVerification(@Body('email') email: string, @Req() req: Request) {
        const locale = req.headers['accept-language']?.startsWith('ru') ? 'ru' : 'en';
        await this.authService.resendVerificationEmail(email, locale);
        return { message: 'Verification code resent' };
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge,
        });
    }
}