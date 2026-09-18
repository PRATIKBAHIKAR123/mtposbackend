import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

import { TaxRatesController } from './tax-rates.controller.js';
import { TaxRatesService } from './tax-rates.service.js';

@Module({
    imports: [
        FirebaseModule,
        AuthModule,
        MembershipsModule,
    ],
    controllers: [
        TaxRatesController,
    ],
    providers: [
        TaxRatesService,
    ],
    exports: [
        TaxRatesService,
    ],
})
export class TaxRatesModule { }
