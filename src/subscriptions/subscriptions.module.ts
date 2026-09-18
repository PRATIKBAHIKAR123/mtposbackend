import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { PlansModule } from '../plans/plans.module.js';

import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
        PlansModule,
    ],
    controllers: [
        SubscriptionsController,
    ],
    providers: [
        SubscriptionsService,
    ],
    exports: [
        SubscriptionsService,
    ],
})
export class SubscriptionsModule { }