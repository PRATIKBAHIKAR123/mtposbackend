import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto.js';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto.js';

export interface TaxRate {
    id: string;
    tenantId?: string;
    name: string;
    percentage: number;
    isInclusive: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class TaxRatesService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('taxRates');
    }

    async getAll(tenantId: string): Promise<TaxRate[]> {
        const snapshot = await this.getCollection(tenantId)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as TaxRate[];
    }

    async getById(tenantId: string, taxRateId: string): Promise<TaxRate> {
        const doc = await this.getCollection(tenantId).doc(taxRateId).get();
        if (!doc.exists) {
            throw new NotFoundException('Tax rate not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as TaxRate;
    }

    async create(tenantId: string, dto: CreateTaxRateDto): Promise<TaxRate> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const taxRate: TaxRate = {
            id: ref.id,
            tenantId,
            name: dto.name,
            percentage: dto.percentage,
            isInclusive: dto.isInclusive ?? false,
            isActive: dto.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(taxRate);
        return taxRate;
    }

    async update(tenantId: string, taxRateId: string, dto: UpdateTaxRateDto): Promise<TaxRate> {
        const ref = this.getCollection(tenantId).doc(taxRateId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Tax rate not found');
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
        } as TaxRate;
    }

    async delete(tenantId: string, taxRateId: string): Promise<{ success: boolean; id: string }> {
        const ref = this.getCollection(tenantId).doc(taxRateId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Tax rate not found');
        }

        await ref.update({
            isActive: false,
            updatedAt: new Date(),
        });

        return { success: true, id: taxRateId };
    }
}
