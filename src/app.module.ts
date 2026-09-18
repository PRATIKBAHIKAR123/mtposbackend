import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseModule } from './firebase/firebase.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';

import { UsersModule } from './users/users.module.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { MembershipsModule } from './memberships/memberships.module.js';
import { RolesModule } from './roles/roles.module.js';
import { PlansModule } from './plans/plans.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { SystemAdminModule } from './system-admin/system-admin.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { MenuModule } from './menu/menu.module.js';
import { TablesModule } from './tables/tables.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { TaxRatesModule } from './tax-rates/tax-rates.module.js';
import { DiscountsModule } from './discounts/discounts.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { PrintersModule } from './printers/printers.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    FirebaseModule,

    HealthModule,

    AuthModule,

    UsersModule,

    TenantsModule,

    MembershipsModule,

    RolesModule,

    PlansModule,

    PermissionsModule,

    ApplicationsModule,

    SubscriptionsModule,

    SystemAdminModule,

    CategoriesModule,

    MenuModule,

    TablesModule,

    CustomersModule,

    TaxRatesModule,

    DiscountsModule,

    OrdersModule,

    PaymentsModule,

    PrintersModule,
  ],
})
export class AppModule { }