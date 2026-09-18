import { Injectable } from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class PermissionsService {
    private readonly collection = 'featureDefinitions';

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async getAllFeatures() {
        const snapshot = await this.firebaseService.firestore
            .collection(this.collection)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
}