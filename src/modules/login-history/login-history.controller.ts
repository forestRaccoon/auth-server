import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
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
    ApiQuery,
    ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Login History')
@ApiBearerAuth()
@Controller('login-history')
@UseGuards(JwtAuthGuard)
export class LoginHistoryController {
    constructor(private historyService: LoginHistoryService) {}

    @Get('me')
    @ApiOperation({ summary: 'Get login history of current user' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max records to return (default from .env)' })
    @ApiResponse({ status: 200, description: 'List of recent logins.' })
    async getMyHistory(@CurrentUser() currentUser, @Query('limit') limit?: number) {
        return this.historyService.getUserHistory(currentUser.userId, limit);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get login history of any user (admin/superadmin only)' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'List of logins.' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions (requires admin/superadmin).' })
    async getUserHistoryById(@Query('userId') userId: string, @Query('limit') limit?: number) {
        return this.historyService.getUserHistory(userId, limit);
    }
}