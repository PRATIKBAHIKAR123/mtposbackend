import { Global, Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Global()
@Module({
    imports: [
        FirebaseModule,
    ],
    controllers: [
        UsersController,
    ],
    providers: [
        UsersService,
    ],
    exports: [
        UsersService,
    ],
})
export class UsersModule { }