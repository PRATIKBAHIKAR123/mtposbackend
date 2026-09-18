import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';
import { PlansModule } from '../plans/plans.module.js';

import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
        SubscriptionsModule,
        PlansModule,
    ],
    controllers: [
        TenantsController,
    ],
    providers: [
        TenantsService,
    ],
    exports: [
        TenantsService,
    ],
})
export class TenantsModule { }