import {
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';

export const TenantId = createParamDecorator(
    (_data: unknown, context: ExecutionContext): string => {
        const request = context.switchToHttp().getRequest();
        return (
            request.tenant?.id ||
            request.headers['x-tenant-id'] ||
            request.params?.tenantId ||
            request.params?.id
        );
    },
);
