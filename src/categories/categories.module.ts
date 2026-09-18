import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
    ],
    controllers: [
        CategoriesController,
    ],
    providers: [
        CategoriesService,
    ],
    exports: [
        CategoriesService,
    ],
})
export class CategoriesModule { }
