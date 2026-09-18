import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { TenantsModule } from '../tenants/tenants.module.js';
import { ApplicationsModule } from '../applications/applications.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { PlansModule } from '../plans/plans.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';

import { SystemAdminGuard } from './system-admin.guard.js';
import { SystemAdminController } from './system-admin.controller.js';
import { SystemAdminService } from './system-admin.service.js';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        FirebaseModule,
        TenantsModule,
        ApplicationsModule,
        MembershipsModule,
        SubscriptionsModule,
        PlansModule,
        PermissionsModule,
    ],
    controllers: [
        SystemAdminController,
    ],
    providers: [
        SystemAdminGuard,
        SystemAdminService,
    ],
    exports: [
        SystemAdminGuard,
    ],
})
export class SystemAdminModule { }