import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

export interface Subscription {
    id: string;
    planId: string;
    tenantId?: string;
    status: string;
    billingCycle?: string;
    startDate?: Date;
    trialEndsAt?: Date;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    externalSubscriptionId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(
        tenantId: string,
    ) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('subscriptions');
    }

    async getAll(status?: string): Promise<Subscription[]> {
        let query: FirebaseFirestore.Query =
            this.firebaseService.firestore.collectionGroup('subscriptions');

        if (status) {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc) => {
            const tenantId = doc.ref.parent.parent?.id;
            return {
                id: doc.id,
                tenantId,
                ...doc.data(),
            } as Subscription;
        });
    }

    async getById(
        subscriptionId: string,
    ): Promise<Subscription> {
        const snapshot = await this.firebaseService.firestore
            .collectionGroup('subscriptions')
            .where('id', '==', subscriptionId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new NotFoundException('Subscription not found');
        }

        const doc = snapshot.docs[0];
        const tenantId = doc.ref.parent.parent?.id;

        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Subscription;
    }

    async getActive(
        tenantId: string,
    ): Promise<Subscription> {
        const snapshot = await this.getCollection(
            tenantId,
        )
            .where('status', 'in', [
                'trialing',
                'active',
            ])
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new NotFoundException(
                'No active subscription found',
            );
        }

        const doc = snapshot.docs[0];

        return {
            id: doc.id,
            ...doc.data(),
        } as Subscription;
    }

    async createTrial(
        tenantId: string,
        plan: any,
        trialDays: number,
    ) {
        const ref = this.getCollection(
            tenantId,
        ).doc();

        const now = new Date();

        const trialEndsAt = new Date(
            now.getTime() +
            trialDays *
            24 *
            60 *
            60 *
            1000,
        );

        const subscription = {
            id: ref.id,

            planId: plan.id,

            status: 'trialing',

            billingCycle: 'monthly',

            startDate: now,

            trialEndsAt,

            currentPeriodStart: now,

            currentPeriodEnd: trialEndsAt,

            externalSubscriptionId: null,

            createdAt: now,

            updatedAt: now,
        };

        await ref.set(subscription);

        return subscription;
    }

    async updateStatus(
        subscriptionId: string,
        status: string,
    ) {
        const allowedStatuses = [
            'trialing',
            'active',
            'expired',
            'cancelled',
            'suspended',
        ];

        if (!allowedStatuses.includes(status)) {
            throw new BadRequestException('Invalid subscription status');
        }

        const snapshot = await this.firebaseService.firestore
            .collectionGroup('subscriptions')
            .where('id', '==', subscriptionId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new NotFoundException('Subscription not found');
        }

        const doc = snapshot.docs[0];
        await doc.ref.update({
            status,
            updatedAt: new Date(),
        });

        const updated = await doc.ref.get();
        const tenantId = doc.ref.parent.parent?.id;

        return {
            id: updated.id,
            tenantId,
            ...updated.data(),
        };
    }

    async subscribeOrChangePlan(
        tenantId: string,
        plan: any,
        billingCycle: 'monthly' | 'yearly' = 'monthly',
    ) {
        const now = new Date();
        const durationDays = billingCycle === 'yearly' ? 365 : 30;
        const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const snapshot = await this.getCollection(tenantId)
            .where('status', 'in', ['trialing', 'active'])
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const existingDoc = snapshot.docs[0];
            await existingDoc.ref.update({
                planId: plan.id,
                billingCycle,
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                updatedAt: now,
            });
            const updated = await existingDoc.ref.get();
            return {
                id: updated.id,
                tenantId,
                ...updated.data(),
            };
        }

        const ref = this.getCollection(tenantId).doc();
        const subscription = {
            id: ref.id,
            planId: plan.id,
            status: 'active',
            billingCycle,
            startDate: now,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            externalSubscriptionId: null,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(subscription);
        return {
            ...subscription,
            tenantId,
        };
    }
}