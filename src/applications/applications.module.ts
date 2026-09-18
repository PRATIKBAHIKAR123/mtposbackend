import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { PlansModule } from '../plans/plans.module.js';
import { TenantsModule } from '../tenants/tenants.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { ApplicationsController } from './applications.controller.js';
import { ApplicationsService } from './applications.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        PlansModule,
        TenantsModule,
        MembershipsModule,
        SubscriptionsModule,
    ],
    controllers: [
        ApplicationsController,
    ],
    providers: [
        ApplicationsService,
    ],
    exports: [
        ApplicationsService,
    ],
})
export class ApplicationsModule { }