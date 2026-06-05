import { Controller, Get, Delete, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class UserSessionController {
    constructor(private sessionService: UserSessionService) {}

    @Get()
    async getMySessions(@CurrentUser() currentUser) {
        return this.sessionService.getActiveSessions(currentUser.userId);
    }

    @Delete(':jti')
    @HttpCode(HttpStatus.NO_CONTENT)
    async revokeSession(@Param('jti') jti: string, @CurrentUser() currentUser) {
        await this.sessionService.revokeSessionByJti(jti);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async revokeAllOtherSessions(@CurrentUser() currentUser) {
        await this.sessionService.revokeAllSessions(currentUser.userId, currentUser.jti);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    async getUserSessions(@Param('userId') userId: string) {
        return this.sessionService.getActiveSessions(userId);
    }
}