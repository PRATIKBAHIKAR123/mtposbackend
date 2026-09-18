import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('me')
    @UseGuards(AuthGuard)
    async getMe(
        @CurrentUser() user: any,
    ) {
        return this.usersService.getById(user.uid);
    }
}