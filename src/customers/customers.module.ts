import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
    ],
    controllers: [
        CustomersController,
    ],
    providers: [
        CustomersService,
    ],
    exports: [
        CustomersService,
    ],
})
export class CustomersModule { }
