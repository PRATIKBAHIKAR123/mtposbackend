import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

@Injectable()
export class RolesService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('roles');
    }

    async getById(
        tenantId: string,
        roleId: string,
    ) {
        const snapshot = await this.getCollection(tenantId)
            .doc(roleId)
            .get();

        if (!snapshot.exists) {
            throw new NotFoundException('Role not found');
        }

        return {
            id: snapshot.id,
            ...snapshot.data(),
        };
    }

    async create(
        tenantId: string,
        data: Record<string, any>,
    ) {
        const ref = this.getCollection(tenantId).doc();

        const now = new Date();

        const role = {
            id: ref.id,
            ...data,
            isSystem: false,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(role);

        return role;
    }
}