import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { Public } from '../../common/decorators/public.decorator';
import { VerifyEmailDto } from '../../common/dto/verify-email.dto';
import { Request } from 'express';

@Controller('auth')
export class EmailVerificationController {
    constructor(private emailVerificationService: EmailVerificationService) {}

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        await this.emailVerificationService.verify(dto.code);
        return { message: 'Email verified successfully' };
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    async resendVerification(@Body('email') email: string, @Req() req: Request) {
        const locale = req.headers['accept-language']?.startsWith('ru') ? 'ru' : 'en';
        await this.emailVerificationService.resendVerification(email, locale);
        return { message: 'Verification code resent' };
    }
}