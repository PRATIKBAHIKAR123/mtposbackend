import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

export interface Plan {
    id: string;
    name: string;
    description?: string;

    price?: {
        monthly: number;
        yearly: number;
        currency: string;
    };

    trial?: {
        enabled: boolean;
        days: number;
    };

    limits?: {
        users: number;
        menuItems: number;
        categories: number;
        tables: number;
        printers: number;
        branches: number;
    };

    features?: Record<string, boolean>;

    isActive: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class PlansService {
    private readonly collection = 'plans';

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async getAll(includeInactive = false): Promise<Plan[]> {
        let query: FirebaseFirestore.Query =
            this.firebaseService.firestore.collection(this.collection);

        if (!includeInactive) {
            query = query.where('isActive', '==', true);
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc) => {
            const data =
                doc.data() as Omit<Plan, 'id'>;

            return {
                id: doc.id,
                ...data,
            };
        });
    }

    async getById(
        planId: string,
    ): Promise<Plan> {
        const snapshot =
            await this.firebaseService.firestore
                .collection(this.collection)
                .doc(planId)
                .get();

        if (!snapshot.exists) {
            throw new NotFoundException(
                'Plan not found',
            );
        }

        const data =
            snapshot.data() as Omit<Plan, 'id'>;

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async create(
        data: Record<string, any>,
    ): Promise<Plan> {
        const ref =
            this.firebaseService.firestore
                .collection(this.collection)
                .doc();

        const now = new Date();

        const plan = {
            id: ref.id,
            ...data,
            isActive: data.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        } as Plan;

        await ref.set(plan);

        return plan;
    }

    async update(
        planId: string,
        data: Record<string, any>,
    ): Promise<Plan> {
        const ref =
            this.firebaseService.firestore
                .collection(this.collection)
                .doc(planId);

        const snapshot = await ref.get();

        if (!snapshot.exists) {
            throw new NotFoundException('Plan not found');
        }

        await ref.update({
            ...data,
            updatedAt: new Date(),
        });

        const updated = await ref.get();
        return {
            id: updated.id,
            ...updated.data(),
        } as Plan;
    }
}