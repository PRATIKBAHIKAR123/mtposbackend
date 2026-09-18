import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';
import { MembershipsService } from '../memberships/memberships.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { PlansService } from '../plans/plans.service.js';
import { OnboardTenantDto } from './dto/onboard-tenant.dto.js';

@Injectable()
export class TenantsService {
    private readonly collection = 'tenants';

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly membershipsService: MembershipsService,
        private readonly subscriptionsService: SubscriptionsService,
        private readonly plansService: PlansService,
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
     * Get all businesses that the authenticated user belongs to.
     */
    async getUserTenants(userId: string) {
        const firestore = this.firebaseService.firestore;

        const membershipsSnapshot = await firestore
            .collectionGroup('memberships')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .get();

        if (membershipsSnapshot.empty) {
            return [];
        }

        const tenants: any[] = [];
        for (const doc of membershipsSnapshot.docs) {
            const tenantId = doc.ref.parent.parent?.id;
            if (!tenantId) continue;

            const tenantDoc = await firestore.collection(this.collection).doc(tenantId).get();
            if (tenantDoc.exists) {
                const membershipData = doc.data();
                tenants.push({
                    id: tenantDoc.id,
                    ...tenantDoc.data(),
                    roleId: membershipData.roleId,
                    joinedAt: membershipData.joinedAt,
                });
            }
        }

        return tenants;
    }

    /**
     * Get all businesses (System Admin).
     */
    async getAll(status?: string) {
        const firestore = this.firebaseService.firestore;

        let query: FirebaseFirestore.Query =
            firestore.collection(this.collection);

        if (status) {
            query = query.where(
                'status',
                '==',
                status,
            );
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }

    /**
     * Create a new business raw.
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
     * Full self-serve workspace onboarding for restaurant owners.
     * Creates tenant, owner membership, default roles, and trial subscription.
     */
    async onboard(userId: string, userEmail: string, dto: OnboardTenantDto) {
        const plan = await this.plansService.getById(dto.planId);
        if (!plan) {
            throw new BadRequestException('Selected plan does not exist');
        }

        // 1. Create Tenant
        const tenant = await this.create({
            businessName: dto.businessName,
            businessType: dto.businessType || 'restaurant',
            ownerName: dto.ownerName || userEmail,
            ownerUserId: userId,
            phone: dto.phone || '',
            currency: dto.currency || 'INR',
            planId: dto.planId,
        });

        // 2. Create Owner Membership
        const membership = await this.membershipsService.create(
            tenant.id,
            userId,
            'owner',
        );

        // 3. Seed Default Tenant Roles
        await this.createDefaultRoles(tenant.id);

        // 4. Provision Trial Subscription
        let subscription: any = null;
        const trialDays = plan.trial?.days || 14;
        const isTrialRequested = dto.trialRequested ?? true;

        if (isTrialRequested) {
            subscription = await this.subscriptionsService.createTrial(
                tenant.id,
                plan,
                trialDays,
            );
        }

        return {
            tenant,
            membership,
            subscription,
        };
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

        const existing = await tenantRef.get();

        if (!existing.exists) {
            throw new NotFoundException(
                'Business not found',
            );
        }

        await tenantRef.update({
            status,
            updatedAt: new Date(),
        });

        const updated = await tenantRef.get();

        return {
            id: updated.id,
            ...updated.data(),
        };
    }

    private async createDefaultRoles(tenantId: string) {
        const firestore = this.firebaseService.firestore;

        const defaultRolesSnapshot = await firestore
            .collection('systemSettings')
            .doc('defaultRoles')
            .get();

        const defaultRoles = defaultRolesSnapshot.exists
            ? defaultRolesSnapshot.data()?.roles ?? []
            : [
                {
                    id: 'owner',
                    name: 'Owner',
                    description: 'Full administrative access to the restaurant',
                    isSystem: true,
                },
                {
                    id: 'manager',
                    name: 'Manager',
                    description: 'Manage staff, inventory, orders, and reports',
                    isSystem: true,
                },
                {
                    id: 'cashier',
                    name: 'Cashier',
                    description: 'Take orders, process payments, and print bills',
                    isSystem: true,
                },
                {
                    id: 'waiter',
                    name: 'Waiter',
                    description: 'Create dine-in orders and send KOT to kitchen',
                    isSystem: true,
                },
            ];

        for (const role of defaultRoles) {
            const roleRef = firestore
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