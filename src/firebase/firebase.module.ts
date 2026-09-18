import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';

import { FIREBASE_ADMIN } from './firebase.constants.js';
import { FirebaseService } from './firebase.service.js';

@Global()
@Module({
    providers: [
        {
            provide: FIREBASE_ADMIN,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const existingApps = getApps();

                if (existingApps.length > 0) {
                    return existingApps[0];
                }

                const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
                const clientEmail = configService.get<string>(
                    'FIREBASE_CLIENT_EMAIL',
                );

                const privateKey = configService
                    .get<string>('FIREBASE_PRIVATE_KEY')
                    ?.replace(/\\n/g, '\n');

                if (!projectId || !clientEmail || !privateKey) {
                    throw new Error(
                        'Firebase environment variables are missing',
                    );
                }

                return initializeApp({
                    credential: cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            },
        },

        FirebaseService,
    ],

    exports: [FIREBASE_ADMIN, FirebaseService],
})
export class FirebaseModule { }