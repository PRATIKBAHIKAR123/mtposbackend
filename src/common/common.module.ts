import { Module } from '@nestjs/common';

import { MembershipsModule } from '../memberships/memberships.module.js';

import { TenantGuard } from './guards/tenant.guard.js';

@Module({
    imports: [
        MembershipsModule,
    ],
    providers: [
        TenantGuard,
    ],
    exports: [
        TenantGuard,
    ],
})
export class CommonModule { }