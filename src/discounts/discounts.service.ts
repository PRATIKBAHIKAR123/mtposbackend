import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateDiscountDto } from './dto/create-discount.dto.js';
import { UpdateDiscountDto } from './dto/update-discount.dto.js';

export interface Discount {
    id: string;
    tenantId?: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    code?: string;
    minOrderAmount: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class DiscountsService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('discounts');
    }

    async getAll(tenantId: string): Promise<Discount[]> {
        const snapshot = await this.getCollection(tenantId)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as Discount[];
    }

    async getById(tenantId: string, discountId: string): Promise<Discount> {
        const doc = await this.getCollection(tenantId).doc(discountId).get();
        if (!doc.exists) {
            throw new NotFoundException('Discount not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Discount;
    }

    async findByCode(tenantId: string, code: string): Promise<Discount | null> {
        const snapshot = await this.getCollection(tenantId)
            .where('code', '==', code.toUpperCase())
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Discount;
    }

    async create(tenantId: string, dto: CreateDiscountDto): Promise<Discount> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const discount: Discount = {
            id: ref.id,
            tenantId,
            name: dto.name,
            type: dto.type,
            value: dto.value,
            code: dto.code ? dto.code.toUpperCase() : undefined,
            minOrderAmount: dto.minOrderAmount ?? 0,
            isActive: dto.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(discount);
        return discount;
    }

    async update(tenantId: string, discountId: string, dto: UpdateDiscountDto): Promise<Discount> {
        const ref = this.getCollection(tenantId).doc(discountId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Discount not found');
        }

        const updateData: Record<string, any> = {
            ...dto,
            updatedAt: new Date(),
        };

        if (dto.code) {
            updateData.code = dto.code.toUpperCase();
        }

        await ref.update(updateData);
        const updated = await ref.get();

        return {
            id: updated.id,
            tenantId,
            ...updated.data(),
        } as Discount;
    }

    async delete(tenantId: string, discountId: string): Promise<{ success: boolean; id: string }> {
        const ref = this.getCollection(tenantId).doc(discountId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Discount not found');
        }

        await ref.update({
            isActive: false,
            updatedAt: new Date(),
        });

        return { success: true, id: discountId };
    }
}
