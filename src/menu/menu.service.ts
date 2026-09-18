import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';

export interface MenuItem {
    id: string;
    tenantId?: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    imageUrl?: string;
    sku?: string;
    barcode?: string;
    isAvailable: boolean;
    variants?: { name: string; price: number }[];
    modifiers?: { name: string; price: number }[];
    sortOrder: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class MenuService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('menu');
    }

    async getAll(
        tenantId: string,
        categoryId?: string,
        isAvailable?: boolean,
    ): Promise<MenuItem[]> {
        let query: FirebaseFirestore.Query = this.getCollection(tenantId)
            .where('isActive', '==', true);

        if (categoryId) {
            query = query.where('categoryId', '==', categoryId);
        }

        if (isAvailable !== undefined) {
            query = query.where('isAvailable', '==', isAvailable);
        }

        const snapshot = await query.get();

        const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as MenuItem[];

        return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    async getById(tenantId: string, itemId: string): Promise<MenuItem> {
        const doc = await this.getCollection(tenantId).doc(itemId).get();
        if (!doc.exists) {
            throw new NotFoundException('Menu item not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as MenuItem;
    }

    async create(tenantId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const item: MenuItem = {
            id: ref.id,
            tenantId,
            name: dto.name,
            categoryId: dto.categoryId,
            description: dto.description || '',
            price: dto.price,
            costPrice: dto.costPrice,
            imageUrl: dto.imageUrl || '',
            sku: dto.sku || '',
            barcode: dto.barcode || '',
            isAvailable: dto.isAvailable ?? true,
            variants: dto.variants || [],
            modifiers: dto.modifiers || [],
            sortOrder: dto.sortOrder ?? 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(item);
        return item;
    }

    async update(tenantId: string, itemId: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
        const ref = this.getCollection(tenantId).doc(itemId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Menu item not found');
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
        } as MenuItem;
    }

    async updateAvailability(tenantId: string, itemId: string, isAvailable: boolean): Promise<MenuItem> {
        const ref = this.getCollection(tenantId).doc(itemId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Menu item not found');
        }

        await ref.update({
            isAvailable,
            updatedAt: new Date(),
        });

        const updated = await ref.get();
        return {
            id: updated.id,
            tenantId,
            ...updated.data(),
        } as MenuItem;
    }

    async delete(tenantId: string, itemId: string): Promise<{ success: boolean; id: string }> {
        const ref = this.getCollection(tenantId).doc(itemId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Menu item not found');
        }

        // Soft delete
        await ref.update({
            isActive: false,
            updatedAt: new Date(),
        });

        return { success: true, id: itemId };
    }
}
