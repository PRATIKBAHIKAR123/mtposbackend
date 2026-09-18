import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';
import { PlansService } from '../plans/plans.service.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { MembershipsService } from '../memberships/memberships.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';

@Injectable()
export class ApplicationsService {
    private readonly collection = 'applications';

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly plansService: PlansService,
        private readonly tenantsService: TenantsService,
        private readonly membershipsService: MembershipsService,
        private readonly subscriptionsService: SubscriptionsService,
    ) { }

    async create(
        userId: string,
        data: Record<string, any>,
    ) {
        const plan = await this.plansService.getById(
            data.requestedPlanId,
        );

        if (!plan) {
            throw new BadRequestException(
                'Invalid plan',
            );
        }

        const ref = this.firebaseService.firestore
            .collection(this.collection)
            .doc();

        const now = new Date();

        const application = {
            id: ref.id,

            businessName: data.businessName,
            businessType: data.businessType,

            ownerName: data.ownerName,
            email: data.email,
            phone: data.phone,

            requestedPlanId: data.requestedPlanId,

            trialRequested:
                data.trialRequested ?? true,

            status: 'pending',

            userId,

            tenantId: null,

            createdAt: now,
            updatedAt: now,

            review: {
                reviewedBy: null,
                reviewedAt: null,
                reason: null,
            },
        };

        await ref.set(application);

        return application;
    }

    async getById(
        applicationId: string,
        userId?: string,
    ) {
        const snapshot =
            await this.firebaseService.firestore
                .collection(this.collection)
                .doc(applicationId)
                .get();

        if (!snapshot.exists) {
            throw new NotFoundException(
                'Application not found',
            );
        }

        const data = snapshot.data();

        if (!data) {
            throw new NotFoundException(
                'Application data not found',
            );
        }

        if (userId && data.userId !== userId) {
            throw new ForbiddenException(
                'You do not have access to this application',
            );
        }

        return {
            id: snapshot.id,
            ...data,
        };
    }

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

    async getPending() {
        const snapshot =
            await this.firebaseService.firestore
                .collection(this.collection)
                .where('status', '==', 'pending')
                .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }

    async approve(
        applicationId: string,
        adminUserId: string,
    ) {
        const firestore =
            this.firebaseService.firestore;

        const applicationRef =
            firestore
                .collection('applications')
                .doc(applicationId);

        const applicationSnapshot =
            await applicationRef.get();

        if (!applicationSnapshot.exists) {
            throw new BadRequestException(
                'Application not found',
            );
        }

        const application =
            applicationSnapshot.data();

        if (!application) {
            throw new BadRequestException(
                'Application data not found',
            );
        }

        if (application.status !== 'pending') {
            throw new BadRequestException(
                'Only pending applications can be approved',
            );
        }

        const plan =
            await this.plansService.getById(
                application.requestedPlanId,
            );

        /*
         * Create tenant
         */
        const tenant =
            await this.tenantsService.create({
                businessName:
                    application.businessName,

                businessType:
                    application.businessType,

                ownerName:
                    application.ownerName,

                ownerUserId:
                    application.userId,

                planId:
                    application.requestedPlanId,
            });

        /*
         * Create owner membership
         */
        await this.membershipsService.create(
            tenant.id,
            application.userId,
            'owner',
        );

        /*
         * Create default roles
         */
        await this.createDefaultRoles(
            tenant.id,
        );

        /*
         * Create trial subscription
         */
        if (
            application.trialRequested &&
            plan.trial?.enabled
        ) {
            await this.subscriptionsService.createTrial(
                tenant.id,
                plan,
                plan.trial.days,
            );
        }

        /*
         * Update application
         */
        await applicationRef.update({
            status: 'approved',
            tenantId: tenant.id,
            review: {
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                reason: null,
            },
            updatedAt: new Date(),
        });

        return {
            success: true,
            applicationId,
            tenantId: tenant.id,
            status: 'approved',
        };
    }

    async reject(
        applicationId: string,
        adminUserId: string,
        reason?: string,
    ) {
        const firestore = this.firebaseService.firestore;

        const applicationRef = firestore
            .collection('applications')
            .doc(applicationId);

        const applicationSnapshot =
            await applicationRef.get();

        if (!applicationSnapshot.exists) {
            throw new BadRequestException(
                'Application not found',
            );
        }

        const application =
            applicationSnapshot.data();

        if (!application) {
            throw new BadRequestException(
                'Application data not found',
            );
        }

        if (application.status !== 'pending') {
            throw new BadRequestException(
                'Only pending applications can be rejected',
            );
        }

        await applicationRef.update({
            status: 'rejected',
            review: {
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                reason: reason ?? null,
            },
            updatedAt: new Date(),
        });

        return {
            success: true,
            applicationId,
            status: 'rejected',
        };
    }

    private async createDefaultRoles(
        tenantId: string,
    ) {
        const firestore =
            this.firebaseService.firestore;

        const defaultRolesSnapshot =
            await firestore
                .collection('systemSettings')
                .doc('defaultRoles')
                .get();

        if (!defaultRolesSnapshot.exists) {
            throw new BadRequestException(
                'Default roles have not been seeded',
            );
        }

        const defaultRoles =
            defaultRolesSnapshot.data()?.roles ?? [];

        for (const role of defaultRoles) {
            const roleRef =
                firestore
                    .collection('tenants')
                    .doc(tenantId)
                    .collection('roles')
                    .doc(role.id);

            await roleRef.set({
                ...role,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }
}