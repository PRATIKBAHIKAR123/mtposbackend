import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { MembershipsController } from './memberships.controller.js';
import { MembershipsService } from './memberships.service.js';

@Module({
    imports: [
        FirebaseModule,
    ],
    controllers: [
        MembershipsController,
    ],
    providers: [
        MembershipsService,
    ],
    exports: [
        MembershipsService,
    ],
})
export class MembershipsModule { }