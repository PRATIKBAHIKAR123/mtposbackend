import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';

import { MembershipsService } from '../../memberships/memberships.service.js';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(
        private readonly membershipsService: MembershipsService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request =
            context.switchToHttp().getRequest();

        const user = request.user;

        if (!user?.uid) {
            throw new UnauthorizedException(
                'User authentication required',
            );
        }

        // Allow system admins global read/write access
        if (user.systemRole === 'admin') {
            const adminTenantId =
                request.headers['x-tenant-id'] ||
                request.params?.tenantId ||
                request.params?.id;

            request.tenant = {
                id: Array.isArray(adminTenantId) ? adminTenantId[0] : adminTenantId,
                membership: { roleId: 'admin', status: 'active' },
            };
            return true;
        }

        const headerTenantId =
            request.headers['x-tenant-id'];

        const tenantId =
            (Array.isArray(headerTenantId) ? headerTenantId[0] : headerTenantId) ||
            request.params?.tenantId ||
            request.params?.id;

        if (!tenantId) {
            throw new ForbiddenException(
                'Tenant ID is required',
            );
        }

        try {
            const membership =
                await this.membershipsService.get(
                    tenantId,
                    user.uid,
                );

            if (membership.status !== 'active') {
                throw new ForbiddenException(
                    'Your membership is not active',
                );
            }

            request.tenant = {
                id: tenantId,
                membership,
            };

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new ForbiddenException(
                'You do not have access to this tenant',
            );
        }
    }
}