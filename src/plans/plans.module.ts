import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { PlansController } from './plans.controller.js';
import { PlansService } from './plans.service.js';

@Module({
    imports: [
        FirebaseModule,
    ],
    controllers: [
        PlansController,
    ],
    providers: [
        PlansService,
    ],
    exports: [
        PlansService,
    ],
})
export class PlansModule { }