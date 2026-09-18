import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authorization =
            request.headers.authorization;

        if (!authorization) {
            throw new UnauthorizedException(
                'Authorization header is required',
            );
        }

        if (!authorization.startsWith('Bearer ')) {
            throw new UnauthorizedException(
                'Invalid authorization format',
            );
        }

        const token = authorization.substring(7);

        if (!token) {
            throw new UnauthorizedException(
                'Firebase token is required',
            );
        }

        const user =
            await this.authService.verifyToken(token);

        request.user = user;

        return true;
    }
}