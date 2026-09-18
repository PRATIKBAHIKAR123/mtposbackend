import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class TenantsService {
    private readonly collection = 'tenants';

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    /**
     * Get a single business by ID.
     */
    async getById(tenantId: string) {
        const snapshot =
            await this.firebaseService.firestore
                .collection(this.collection)
                .doc(tenantId)
                .get();

        if (!snapshot.exists) {
            throw new NotFoundException(
                'Business not found',
            );
        }

        return {
            id: snapshot.id,
            ...snapshot.data(),
        };
    }

    /**
     * Get all businesses.
     *
     * Optional status filter:
     * active
     * suspended
     */
    async getAll(status?: string) {
        const firestore =
            this.firebaseService.firestore;

        let query: FirebaseFirestore.Query =
            firestore.collection(this.collection);

        if (status) {
            query = query.where(
                'status',
                '==',
                status,
            );
        }

        const snapshot =
            await query.get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }

    /**
     * Create a new business.
     */
    async create(data: Record<string, any>) {
        const tenantRef =
            this.firebaseService.firestore
                .collection(this.collection)
                .doc();

        const now = new Date();

        const tenant = {
            id: tenantRef.id,
            ...data,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        };

        await tenantRef.set(tenant);

        return tenant;
    }

    /**
     * Update business status.
     */
    async updateStatus(
        tenantId: string,
        status: string,
    ) {
        const tenantRef =
            this.firebaseService.firestore
                .collection(this.collection)
                .doc(tenantId);

        const existing =
            await tenantRef.get();

        if (!existing.exists) {
            throw new NotFoundException(
                'Business not found',
            );
        }

        await tenantRef.update({
            status,
            updatedAt: new Date(),
        });

        const updated =
            await tenantRef.get();

        return {
            id: updated.id,
            ...updated.data(),
        };
    }
}