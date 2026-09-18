import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { RolesModule } from '../roles/roles.module.js';

import { PrintersController } from './printers.controller.js';
import { PrintersService } from './printers.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        UsersModule,
        MembershipsModule,
        RolesModule,
    ],
    controllers: [
        PrintersController,
    ],
    providers: [
        PrintersService,
    ],
    exports: [
        PrintersService,
    ],
})
export class PrintersModule { }
