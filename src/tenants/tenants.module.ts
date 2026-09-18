import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
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