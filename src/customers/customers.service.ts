import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

export interface Customer {
    id: string;
    tenantId?: string;
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    loyaltyPoints: number;
    totalSpent: number;
    visitCount: number;
    lastVisitAt?: Date | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable()
export class CustomersService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('customers');
    }

    async getAll(tenantId: string, search?: string): Promise<Customer[]> {
        const snapshot = await this.getCollection(tenantId)
            .where('isActive', '==', true)
            .get();

        let customers = snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as Customer[];

        if (search) {
            const q = search.toLowerCase();
            customers = customers.filter(
                (c) =>
                    c.name?.toLowerCase().includes(q) ||
                    c.phone?.toLowerCase().includes(q) ||
                    c.email?.toLowerCase().includes(q),
            );
        }

        return customers.sort((a, b) => (b.visitCount ?? 0) - (a.visitCount ?? 0));
    }

    async getById(tenantId: string, customerId: string): Promise<Customer> {
        const doc = await this.getCollection(tenantId).doc(customerId).get();
        if (!doc.exists) {
            throw new NotFoundException('Customer not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Customer;
    }

    async findByPhone(tenantId: string, phone: string): Promise<Customer | null> {
        const snapshot = await this.getCollection(tenantId)
            .where('phone', '==', phone)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Customer;
    }

    async create(tenantId: string, dto: CreateCustomerDto): Promise<Customer> {
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const customer: Customer = {
            id: ref.id,
            tenantId,
            name: dto.name,
            phone: dto.phone,
            email: dto.email || '',
            notes: dto.notes || '',
            loyaltyPoints: dto.loyaltyPoints ?? 0,
            totalSpent: 0,
            visitCount: 0,
            lastVisitAt: null,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        await ref.set(customer);
        return customer;
    }

    async update(tenantId: string, customerId: string, dto: UpdateCustomerDto): Promise<Customer> {
        const ref = this.getCollection(tenantId).doc(customerId);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new NotFoundException('Customer not found');
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
        } as Customer;
    }

    async recordSpend(tenantId: string, customerId: string, amount: number): Promise<void> {
        const ref = this.getCollection(tenantId).doc(customerId);
        const existing = await ref.get();
        if (!existing.exists) return;

        const data = existing.data() as Customer;
        const now = new Date();

        // 1 point for every $10 spent
        const pointsEarned = Math.floor(amount / 10);

        await ref.update({
            totalSpent: (data.totalSpent ?? 0) + amount,
            visitCount: (data.visitCount ?? 0) + 1,
            loyaltyPoints: (data.loyaltyPoints ?? 0) + pointsEarned,
            lastVisitAt: now,
            updatedAt: now,
        });
    }
}
