import { Module } from '@nestjs/common';
import { DiscountsController } from './discounts.controller.js';
import { DiscountsService } from './discounts.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { RolesModule } from '../roles/roles.module.js';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        MembershipsModule,
        RolesModule,
    ],
    controllers: [DiscountsController],
    providers: [DiscountsService],
    exports: [DiscountsService],
})
export class DiscountsModule { }
