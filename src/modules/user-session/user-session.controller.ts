import { Controller, Get, Delete, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class UserSessionController {
    constructor(private sessionService: UserSessionService) {}

    @Get()
    @ApiOperation({ summary: 'List active sessions for current user' })
    @ApiResponse({ status: 200, description: 'List of active sessions (devices).' })
    async getMySessions(@CurrentUser() currentUser) {
        return this.sessionService.getActiveSessions(currentUser.userId);
    }

    @Delete(':jti')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Revoke a specific session by its JTI' })
    @ApiParam({ name: 'jti', description: 'Unique token identifier (JTI) of the session' })
    @ApiResponse({ status: 204, description: 'Session revoked.' })
    async revokeSession(@Param('jti') jti: string, @CurrentUser() currentUser) {
        await this.sessionService.revokeSessionByJti(jti);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Revoke all other sessions (except current)' })
    @ApiResponse({ status: 204, description: 'All other sessions revoked.' })
    async revokeAllOtherSessions(@CurrentUser() currentUser) {
        await this.sessionService.revokeAllSessions(currentUser.userId, currentUser.jti);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get active sessions of any user (admin/superadmin only)' })
    @ApiParam({ name: 'userId', description: 'MongoDB ObjectId' })
    @ApiResponse({ status: 200, description: 'List of sessions.' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions (requires admin/superadmin).' })
    async getUserSessions(@Param('userId') userId: string) {
        return this.sessionService.getActiveSessions(userId);
    }
}