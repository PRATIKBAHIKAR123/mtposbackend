import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';

export interface DiningTable {
    id: string;
    tenantId?: string;
    name: string;
    section: string;
    capacity: number;
    status: 'vacant' | 'occupied' | 'reserved' | 'billed';
    currentOrderId?: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class TablesService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('tables');
    }

    async getAll(
        tenantId: string,
        section?: string,
        status?: string,
    ): Promise<DiningTable[]> {
        let query: FirebaseFirestore.Query = this.getCollection(tenantId)
            .where('isActive', '==', true);

        if (section) {
            query = query.where('section', '==', section);
        }

        if (status) {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();

        const tables = snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as DiningTable[];

        return tables.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }

    async getById(tenantId: string, tableId: string): Promise<DiningTable> {
        const doc = await this.getCollection(tenantId).doc(tableId).get();
        if (!doc.exists) {
            throw new NotFoundException('Table not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as DiningTable;
    }

    async create(tenantId: string, dto: CreateTableDto): Promise<DiningTable> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const table: DiningTable = {
            id: ref.id,
            tenantId,
            name: dto.name,
            section: dto.section || 'Main',
            capacity: dto.capacity ?? 4,
            status: (dto.status as any) || 'vacant',
            currentOrderId: null,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(table);
        return table;
    }

    async update(tenantId: string, tableId: string, dto: UpdateTableDto): Promise<DiningTable> {
        const ref = this.getCollection(tenantId).doc(tableId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Table not found');
        }

        const updateData = {
            ...dto,
            updatedAt: new Date(),
        };

        await ref.update(updateData);
        const updated = await ref.get();

        return {
            id: updated.id,
            tenantId,
            ...updated.data(),
        } as DiningTable;
    }

    async updateStatus(
        tenantId: string,
        tableId: string,
        status: string,
        currentOrderId: string | null = null,
    ): Promise<DiningTable> {
        const ref = this.getCollection(tenantId).doc(tableId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Table not found');
        }

        const updatePayload: Record<string, any> = {
            status,
            updatedAt: new Date(),
        };

        if (currentOrderId !== undefined) {
            updatePayload.currentOrderId = currentOrderId;
        }

        await ref.update(updatePayload);
        const updated = await ref.get();

        return {
            id: updated.id,
            tenantId,
            ...updated.data(),
        } as DiningTable;
    }

    async delete(tenantId: string, tableId: string): Promise<{ success: boolean; id: string }> {
        const ref = this.getCollection(tenantId).doc(tableId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Table not found');
        }

        // Soft delete
        await ref.update({
            isActive: false,
            updatedAt: new Date(),
        });

        return { success: true, id: tableId };
    }
}
