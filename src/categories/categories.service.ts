import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

export interface Category {
    id: string;
    tenantId?: string;
    name: string;
    description?: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class CategoriesService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('categories');
    }

    async getAll(tenantId: string): Promise<Category[]> {
        const snapshot = await this.getCollection(tenantId)
            .where('isActive', '==', true)
            .get();

        const categories = snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as Category[];

        return categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    async getById(tenantId: string, categoryId: string): Promise<Category> {
        const doc = await this.getCollection(tenantId).doc(categoryId).get();
        if (!doc.exists) {
            throw new NotFoundException('Category not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Category;
    }

    async create(tenantId: string, dto: CreateCategoryDto): Promise<Category> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const category: Category = {
            id: ref.id,
            tenantId,
            name: dto.name,
            description: dto.description || '',
            icon: dto.icon || '',
            sortOrder: dto.sortOrder ?? 0,
            isActive: dto.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(category);
        return category;
    }

    async update(tenantId: string, categoryId: string, dto: UpdateCategoryDto): Promise<Category> {
        const ref = this.getCollection(tenantId).doc(categoryId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Category not found');
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
        } as Category;
    }

    async delete(tenantId: string, categoryId: string): Promise<{ success: boolean; id: string }> {
        const ref = this.getCollection(tenantId).doc(categoryId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Category not found');
        }

        // Soft delete
        await ref.update({
            isActive: false,
            updatedAt: new Date(),
        });

        return { success: true, id: categoryId };
    }
}
