import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service.js';

@Injectable()
export class SystemAdminGuard implements CanActivate {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request =
            context.switchToHttp().getRequest();

        const firebaseUser = request.user;

        if (!firebaseUser?.uid) {
            throw new UnauthorizedException(
                'User authentication required',
            );
        }

        const user =
            await this.usersService.getById(
                firebaseUser.uid,
            );

        if (user.systemRole !== 'admin') {
            throw new ForbiddenException(
                'System administrator access required',
            );
        }

        return true;
    }
}