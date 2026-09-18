import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { PermissionsService } from './permissions.service.js';

@Module({
    imports: [
        FirebaseModule,
    ],
    providers: [
        PermissionsService,
    ],
    exports: [
        PermissionsService,
    ],
})
export class PermissionsModule { }