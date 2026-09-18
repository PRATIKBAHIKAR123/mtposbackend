import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard.js';
import { MembershipsService } from '../../memberships/memberships.service.js';

describe('TenantGuard', () => {
    let guard: TenantGuard;
    let mockMembershipsService: Partial<MembershipsService>;

    beforeEach(() => {
        mockMembershipsService = {
            get: vi.fn(),
        };
        guard = new TenantGuard(mockMembershipsService as MembershipsService);
    });

    function createMockContext(user?: any, headers: Record<string, any> = {}, params: Record<string, any> = {}): ExecutionContext {
        const req: any = {
            user,
            headers,
            params,
        };
        return {
            switchToHttp: () => ({
                getRequest: () => req,
            }),
        } as unknown as ExecutionContext;
    }

    it('should throw UnauthorizedException if user is not authenticated', async () => {
        const context = createMockContext(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should allow system admins without requiring active membership check', async () => {
        const context = createMockContext({ uid: 'admin-1', systemRole: 'admin' }, {}, { id: 'tenant-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
        expect(mockMembershipsService.get).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if no tenantId provided in headers or params', async () => {
        const context = createMockContext({ uid: 'user-1', systemRole: 'user' }, {}, {});
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not a member of the tenant', async () => {
        (mockMembershipsService.get as any).mockRejectedValue(new Error('Not found'));
        const context = createMockContext({ uid: 'user-1', systemRole: 'user' }, { 'x-tenant-id': 'tenant-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if membership is suspended or inactive', async () => {
        (mockMembershipsService.get as any).mockResolvedValue({
            id: 'm1',
            userId: 'user-1',
            status: 'suspended',
        });
        const context = createMockContext({ uid: 'user-1', systemRole: 'user' }, { 'x-tenant-id': 'tenant-1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should allow access if user has active membership in tenant', async () => {
        (mockMembershipsService.get as any).mockResolvedValue({
            id: 'm1',
            userId: 'user-1',
            status: 'active',
        });
        const context = createMockContext({ uid: 'user-1', systemRole: 'user' }, {}, { tenantId: 'tenant-1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });
});
