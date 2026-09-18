import { Global, Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';
import { UsersModule } from '../users/users.module.js';

import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Global()
@Module({
    imports: [
        FirebaseModule,
        UsersModule,
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        AuthService,
        AuthGuard,
    ],
    exports: [
        AuthService,
        AuthGuard,
    ],
})
export class AuthModule { }