import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

import { TablesController } from './tables.controller.js';
import { TablesService } from './tables.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
    ],
    controllers: [
        TablesController,
    ],
    providers: [
        TablesService,
    ],
    exports: [
        TablesService,
    ],
})
export class TablesModule { }
