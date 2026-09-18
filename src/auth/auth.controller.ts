import {
    Controller,
    Get,
    Req,
    UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from './auth.guard.js';
import { UsersService } from '../users/users.service.js';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('me')
    @UseGuards(AuthGuard)
    async getCurrentUser(
        @Req() request: any,
    ) {
        const firebaseUser = request.user;

        const user = await this.usersService.create(
            firebaseUser.uid,
            {
                email: firebaseUser.email ?? null,
                displayName:
                    firebaseUser.name ?? null,
                photoUrl:
                    firebaseUser.picture ?? null,
                emailVerified:
                    firebaseUser.email_verified ?? false,
                status: 'active',
            },
        );

        return {
            success: true,
            user,
        };
    }
}