import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { TablesModule } from '../tables/tables.module.js';
import { DiscountsModule } from '../discounts/discounts.module.js';
import { TaxRatesModule } from '../tax-rates/tax-rates.module.js';
import { CustomersModule } from '../customers/customers.module.js';

import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        UsersModule,
        MembershipsModule,
        RolesModule,
        TablesModule,
        DiscountsModule,
        TaxRatesModule,
        CustomersModule,
    ],
    controllers: [
        OrdersController,
    ],
    providers: [
        OrdersService,
    ],
    exports: [
        OrdersService,
    ],
})
export class OrdersModule { }
