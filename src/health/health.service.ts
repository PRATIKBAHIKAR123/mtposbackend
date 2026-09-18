import { Inject, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class HealthService {
    constructor(
        @Inject(FirebaseService)
        private readonly firebaseService: FirebaseService,
    ) { }

    async check() {
        const snapshot = await this.firebaseService.firestore
            .collection('_system')
            .doc('health')
            .get();

        return {
            status: 'ok',
            firebase: snapshot.exists ? 'connected' : 'connected',
            timestamp: new Date().toISOString(),
        };
    }
}