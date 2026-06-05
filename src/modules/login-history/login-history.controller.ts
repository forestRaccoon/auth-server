import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('login-history')
@UseGuards(JwtAuthGuard)
export class LoginHistoryController {
    constructor(private historyService: LoginHistoryService) {}

    @Get('me')
    async getMyHistory(@CurrentUser() currentUser, @Query('limit') limit?: number) {
        return this.historyService.getUserHistory(currentUser.userId, limit);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    async getUserHistoryById(@CurrentUser() currentUser, @Query('userId') userId: string, @Query('limit') limit?: number) {
        return this.historyService.getUserHistory(userId, limit);
    }
}