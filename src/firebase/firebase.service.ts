import { Inject, Injectable } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { FIREBASE_ADMIN } from './firebase.constants.js';

@Injectable()
export class FirebaseService {
    constructor(
        @Inject(FIREBASE_ADMIN)
        private readonly firebaseAdmin: any,
    ) { }

    get auth() {
        return getAuth(this.firebaseAdmin);
    }

    get firestore() {
        return getFirestore(this.firebaseAdmin);
    }
}