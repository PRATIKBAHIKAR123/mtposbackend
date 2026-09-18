import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreatePrinterDto } from './dto/create-printer.dto.js';
import { UpdatePrinterDto } from './dto/update-printer.dto.js';

export interface Printer {
    id: string;
    tenantId?: string;
    name: string;
    type: 'kot' | 'receipt' | 'bar';
    connectionType: 'network' | 'bluetooth' | 'usb';
    ipAddress?: string;
    port?: number;
    paperWidth: number;
    isDefault: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class PrintersService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('printers');
    }

    async getAll(tenantId: string, type?: string): Promise<Printer[]> {
        let query: FirebaseFirestore.Query = this.getCollection(tenantId)
            .where('isActive', '==', true);

        if (type) {
            query = query.where('type', '==', type);
        }

        const snapshot = await query.get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as Printer[];
    }

    async getById(tenantId: string, printerId: string): Promise<Printer> {
        const doc = await this.getCollection(tenantId).doc(printerId).get();
        if (!doc.exists) {
            throw new NotFoundException('Printer not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Printer;
    }

    async create(tenantId: string, dto: CreatePrinterDto): Promise<Printer> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const printer: Printer = {
            id: ref.id,
            tenantId,
            name: dto.name,
            type: dto.type,
            connectionType: dto.connectionType,
            ipAddress: dto.ipAddress || undefined,
            port: dto.port ?? 9100,
            paperWidth: dto.paperWidth ?? 80,
            isDefault: dto.isDefault ?? false,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(printer);
        return printer;
    }

    async update(tenantId: string, printerId: string, dto: UpdatePrinterDto): Promise<Printer> {
        const ref = this.getCollection(tenantId).doc(printerId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Printer not found');
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
        } as Printer;
    }

    async delete(tenantId: string, printerId: string): Promise<{ success: boolean; id: string }> {
        const ref = this.getCollection(tenantId).doc(printerId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Printer not found');
        }

        await ref.update({
            isActive: false,
            updatedAt: new Date(),
        });

        return { success: true, id: printerId };
    }
}
