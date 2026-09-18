import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { MembershipsService } from './memberships.service.js';

@Module({
    imports: [
        FirebaseModule,
    ],
    providers: [
        MembershipsService,
    ],
    exports: [
        MembershipsService,
    ],
})
export class MembershipsModule { }