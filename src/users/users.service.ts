import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { FirebaseService } from '../firebase/firebase.service.js';

export interface User {
    id: string;

    email?: string | null;

    displayName?: string | null;

    photoUrl?: string | null;

    emailVerified?: boolean;

    status?: string;

    systemRole?: string;

    createdAt?: Date;

    updatedAt?: Date;
}

@Injectable()
export class UsersService {
    private readonly collection = 'users';

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async getAll(
        status?: string,
        systemRole?: string,
    ): Promise<User[]> {
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

        if (systemRole) {
            query = query.where(
                'systemRole',
                '==',
                systemRole,
            );
        }

        const snapshot =
            await query.get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as User[];
    }

    async getById(
        userId: string,
    ): Promise<User> {
        const snapshot =
            await this.firebaseService.firestore
                .collection(this.collection)
                .doc(userId)
                .get();

        if (!snapshot.exists) {
            throw new NotFoundException(
                'User not found',
            );
        }

        const data =
            snapshot.data() as Omit<User, 'id'>;

        return {
            id: snapshot.id,
            ...data,
        };
    }

    async create(
        userId: string,
        data: Record<string, any>,
    ): Promise<User> {
        const userRef =
            this.firebaseService.firestore
                .collection(this.collection)
                .doc(userId);

        const existing =
            await userRef.get();

        if (existing.exists) {
            const existingData =
                existing.data() as Omit<User, 'id'>;

            return {
                id: existing.id,
                ...existingData,
            };
        }

        const now = new Date();

        const userData = {
            id: userId,
            status: 'active',
            systemRole: 'user',
            ...data,
            createdAt: now,
            updatedAt: now,
        } as User;

        await userRef.set(userData);

        return userData;
    }

    async update(
        userId: string,
        data: Record<string, any>,
    ): Promise<User> {
        const userRef =
            this.firebaseService.firestore
                .collection(this.collection)
                .doc(userId);

        const existing =
            await userRef.get();

        if (!existing.exists) {
            throw new NotFoundException(
                'User not found',
            );
        }

        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        await userRef.update(updateData);

        const updated =
            await userRef.get();

        const updatedData =
            updated.data() as Omit<User, 'id'>;

        return {
            id: updated.id,
            ...updatedData,
        };
    }

    async updateStatus(
        userId: string,
        status: string,
    ): Promise<User> {
        const allowedStatuses = [
            'active',
            'suspended',
            'inactive',
        ];

        if (!allowedStatuses.includes(status)) {
            throw new BadRequestException(
                'Invalid user status',
            );
        }

        return this.update(userId, { status });
    }

    async updateSystemRole(
        userId: string,
        systemRole: string,
    ): Promise<User> {
        const allowedRoles = [
            'admin',
            'user',
        ];

        if (!allowedRoles.includes(systemRole)) {
            throw new BadRequestException(
                'Invalid system role',
            );
        }

        return this.update(userId, { systemRole });
    }
}