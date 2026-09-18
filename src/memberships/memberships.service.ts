import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

export interface Membership {
    id: string;
    userId: string;
    roleId: string;
    status: string;
    joinedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class MembershipsService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('memberships');
    }

    async getAll(
        tenantId: string,
        status?: string,
    ): Promise<Membership[]> {
        let query: FirebaseFirestore.Query =
            this.getCollection(tenantId);

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
        })) as Membership[];
    }

    async get(
        tenantId: string,
        userId: string,
    ): Promise<Membership> {
        const snapshot = await this.getCollection(
            tenantId,
        )
            .doc(userId)
            .get();

        if (!snapshot.exists) {
            throw new NotFoundException(
                'Membership not found',
            );
        }

        const data =
            snapshot.data() as Omit<Membership, 'id'>;

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async create(
        tenantId: string,
        userId: string,
        roleId: string,
    ): Promise<Membership> {
        const ref = this.getCollection(tenantId)
            .doc(userId);

        const now = new Date();

        const membership: Omit<
            Membership,
            'id'
        > = {
            userId,
            roleId,
            status: 'active',
            joinedAt: now,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(membership);

        return {
            id: ref.id,
            ...membership,
        };
    }

    async updateRole(
        tenantId: string,
        userId: string,
        roleId: string,
    ): Promise<Membership> {
        const ref = this.getCollection(tenantId).doc(userId);
        const snapshot = await ref.get();

        if (!snapshot.exists) {
            throw new NotFoundException('Membership not found');
        }

        await ref.update({
            roleId,
            updatedAt: new Date(),
        });

        const updated = await ref.get();
        return {
            id: updated.id,
            ...updated.data(),
        } as Membership;
    }

    async updateStatus(
        tenantId: string,
        userId: string,
        status: string,
    ): Promise<Membership> {
        const allowedStatuses = ['active', 'suspended', 'inactive'];
        if (!allowedStatuses.includes(status)) {
            throw new BadRequestException('Invalid membership status');
        }

        const ref = this.getCollection(tenantId).doc(userId);
        const snapshot = await ref.get();

        if (!snapshot.exists) {
            throw new NotFoundException('Membership not found');
        }

        await ref.update({
            status,
            updatedAt: new Date(),
        });

        const updated = await ref.get();
        return {
            id: updated.id,
            ...updated.data(),
        } as Membership;
    }
}