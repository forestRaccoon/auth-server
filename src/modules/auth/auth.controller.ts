import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from '../../common/dto/register.dto';
import { LoginDto } from '../../common/dto/login.dto';
import { ForgotPasswordDto } from '../../common/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../common/dto/reset-password.dto';
import { VerifyEmailDto } from '../../common/dto/verify-email.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiCookieAuth,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Throttle({ default: { limit: 3, ttl: 3600 } })
    @Post('register')
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account. If email verification is enabled, sends a verification code. Returns access token in body and sets refresh token in httpOnly cookie.',
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiBadRequestResponse({ description: 'Email already exists or validation failed.' })
    async register(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: RegisterDto,
        @Req() req: Request,
    ) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const { accessToken, refreshToken, requiresEmailVerification } =
            await this.authService.register(dto, ip, userAgent);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken, requiresEmailVerification };
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 900 } })
    @Post('login')
    @ApiOperation({
        summary: 'User login',
        description: 'Authenticates user. Returns access token (body) and sets refresh token (httpOnly cookie). Triggers new device notification and account lock logic.',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login successful.' })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials or account locked.' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    async login(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: LoginDto,
        @Req() req: Request,
    ) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const { accessToken, refreshToken } = await this.authService.login(dto, ip, userAgent);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }

    @Public()
    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Uses the refresh token stored in httpOnly cookie to issue a new pair of tokens (access + refresh).',
    })
    @ApiCookieAuth('refreshToken')
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
    @ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token.' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const oldRefreshToken = req.cookies['refreshToken'];
        if (!oldRefreshToken) throw new Error('Refresh token missing');
        const { accessToken, refreshToken } = await this.authService.refresh(oldRefreshToken);
        this.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Logout',
        description: 'Revokes the current refresh token and clears the httpOnly cookie.',
    })
    @ApiCookieAuth('refreshToken')
    @ApiResponse({ status: 204, description: 'Logged out successfully.' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        if (refreshToken) await this.authService.logout(refreshToken);
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Request password reset code',
        description: 'Sends a 6‑digit alphanumeric code to the user’s email (if the email exists).',
    })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, description: 'If user exists, reset code sent.' })
    @ApiBadRequestResponse({ description: 'Validation failed.' })
    async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
        const locale = req.headers['accept-language']?.startsWith('ru') ? 'ru' : 'en';
        await this.authService.forgotPassword(dto.email, locale);
        return { message: 'If user exists, reset code sent to email' };
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Reset password using code',
        description: 'Verifies the code and updates the password.',
    })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password updated successfully.' })
    @ApiBadRequestResponse({ description: 'Invalid or expired code.' })
    @ApiNotFoundResponse({ description: 'User not found.' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
        return { message: 'Password updated successfully' };
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify email address',
        description: 'Activates the user account using the code sent during registration.',
    })
    @ApiBody({ type: VerifyEmailDto })
    @ApiResponse({ status: 200, description: 'Email verified successfully.' })
    @ApiBadRequestResponse({ description: 'Invalid or expired code.' })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        await this.authService.verifyEmail(dto.code);
        return { message: 'Email verified successfully' };
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Resend email verification code',
        description: 'Resends the 6‑digit code to the user’s email.',
    })
    @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Verification code resent.' })
    @ApiBadRequestResponse({ description: 'Email not found or already verified.' })
    async resendVerification(@Body('email') email: string, @Req() req: Request) {
        const locale = req.headers['accept-language']?.startsWith('ru') ? 'ru' : 'en';
        await this.authService.resendVerificationEmail(email, locale);
        return { message: 'Verification code resent' };
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge,
        });
    }
}