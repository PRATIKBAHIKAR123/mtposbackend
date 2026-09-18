import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { OrdersModule } from '../orders/orders.module.js';

import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        UsersModule,
        MembershipsModule,
        RolesModule,
        OrdersModule,
    ],
    controllers: [
        PaymentsController,
    ],
    providers: [
        PaymentsService,
    ],
    exports: [
        PaymentsService,
    ],
})
export class PaymentsModule { }
