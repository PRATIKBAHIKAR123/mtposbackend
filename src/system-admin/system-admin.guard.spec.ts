import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SystemAdminGuard } from './system-admin.guard.js';
import { UsersService } from '../users/users.service.js';

describe('SystemAdminGuard', () => {
    let guard: SystemAdminGuard;
    let mockUsersService: Partial<UsersService>;

    beforeEach(() => {
        mockUsersService = {
            getById: vi.fn(),
        };
        guard = new SystemAdminGuard(mockUsersService as UsersService);
    });

    function createMockContext(user?: any): ExecutionContext {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        } as unknown as ExecutionContext;
    }

    it('should throw UnauthorizedException if request.user is missing or has no uid', async () => {
        const context = createMockContext(undefined);
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

        const contextNoUid = createMockContext({});
        await expect(guard.canActivate(contextNoUid)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if user.systemRole is not admin', async () => {
        (mockUsersService.getById as any).mockResolvedValue({
            id: 'u1',
            systemRole: 'user',
        });

        const context = createMockContext({ uid: 'u1' });
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should return true if user.systemRole is admin', async () => {
        (mockUsersService.getById as any).mockResolvedValue({
            id: 'u1',
            systemRole: 'admin',
        });

        const context = createMockContext({ uid: 'u1' });
        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });
});
