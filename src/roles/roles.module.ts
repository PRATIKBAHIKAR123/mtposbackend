import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { RolesService } from './roles.service.js';

@Module({
    imports: [
        FirebaseModule,
    ],
    providers: [
        RolesService,
    ],
    exports: [
        RolesService,
    ],
})
export class RolesModule { }