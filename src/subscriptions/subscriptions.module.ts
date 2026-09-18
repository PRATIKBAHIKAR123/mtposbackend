import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { SubscriptionsService } from './subscriptions.service.js';

@Module({
    imports: [
        FirebaseModule,
    ],
    providers: [
        SubscriptionsService,
    ],
    exports: [
        SubscriptionsService,
    ],
})
export class SubscriptionsModule { }