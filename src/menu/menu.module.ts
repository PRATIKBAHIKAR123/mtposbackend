import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

import { MenuController } from './menu.controller.js';
import { MenuService } from './menu.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
    ],
    controllers: [
        MenuController,
    ],
    providers: [
        MenuService,
    ],
    exports: [
        MenuService,
    ],
})
export class MenuModule { }
