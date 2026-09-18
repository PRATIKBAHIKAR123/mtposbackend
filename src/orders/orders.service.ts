import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { TablesService } from '../tables/tables.service.js';
import { DiscountsService } from '../discounts/discounts.service.js';
import { TaxRatesService } from '../tax-rates/tax-rates.service.js';
import { CustomersService } from '../customers/customers.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { AddOrderItemsDto } from './dto/add-order-items.dto.js';

export interface OrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    selectedVariant?: string;
    modifiers?: string[];
    notes?: string;
    subtotal: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    tenantId?: string;
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    tableId?: string | null;
    tableName?: string | null;
    customerId?: string | null;
    customerName?: string | null;
    status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
    items: OrderItem[];
    subtotal: number;
    taxTotal: number;
    taxRatePercentage: number;
    discountTotal: number;
    discountCode?: string;
    grandTotal: number;
    paidAmount: number;
    waiterUserId?: string;
    waiterName?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date | null;
}

@Injectable()
export class OrdersService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly tablesService: TablesService,
        private readonly discountsService: DiscountsService,
        private readonly taxRatesService: TaxRatesService,
        private readonly customersService: CustomersService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('orders');
    }

    async getAll(
        tenantId: string,
        filters?: {
            status?: string;
            orderType?: string;
            tableId?: string;
            paymentStatus?: string;
        },
    ): Promise<Order[]> {
        let query: FirebaseFirestore.Query = this.getCollection(tenantId);

        if (filters?.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters?.orderType) {
            query = query.where('orderType', '==', filters.orderType);
        }
        if (filters?.tableId) {
            query = query.where('tableId', '==', filters.tableId);
        }
        if (filters?.paymentStatus) {
            query = query.where('paymentStatus', '==', filters.paymentStatus);
        }

        const snapshot = await query.get();

        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as Order[];

        return orders.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
        });
    }

    async getById(tenantId: string, orderId: string): Promise<Order> {
        const doc = await this.getCollection(tenantId).doc(orderId).get();
        if (!doc.exists) {
            throw new NotFoundException('Order not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Order;
    }

    async create(
        tenantId: string,
        dto: CreateOrderDto,
        userId?: string,
        userName?: string,
    ): Promise<Order> {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Order must contain at least one item');
        }

        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        // 1. Calculate Items Subtotals
        const items: OrderItem[] = dto.items.map((item) => ({
            ...item,
            subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
        }));
        const subtotal = Math.round(items.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;

        // 2. Calculate Discounts
        let discountTotal = dto.discountAmount ?? 0;
        let discountCode = dto.discountCode;

        if (discountCode) {
            const discount = await this.discountsService.findByCode(tenantId, discountCode);
            if (discount && discount.isActive) {
                if (subtotal >= (discount.minOrderAmount ?? 0)) {
                    if (discount.type === 'percentage') {
                        discountTotal = Math.round(((subtotal * discount.value) / 100) * 100) / 100;
                    } else {
                        discountTotal = Math.min(subtotal, discount.value);
                    }
                }
            }
        }
        discountTotal = Math.min(subtotal, Math.round(discountTotal * 100) / 100);

        // 3. Calculate Taxes
        let taxRatePercentage = dto.taxRate ?? 0;
        if (taxRatePercentage === 0) {
            try {
                const taxes = await this.taxRatesService.getAll(tenantId);
                if (taxes.length > 0) {
                    taxRatePercentage = taxes[0].percentage;
                }
            } catch {
                // If tax rates fail to fetch, continue with 0%
                taxRatePercentage = 0;
            }
        }
        const taxableAmount = Math.max(0, subtotal - discountTotal);
        const taxTotal = Math.round(((taxableAmount * taxRatePercentage) / 100) * 100) / 100;
        const grandTotal = Math.round((taxableAmount + taxTotal) * 100) / 100;

        // 4. Resolve Table Details (if dine-in)
        let tableName: string | null = null;
        if (dto.orderType === 'dine-in' && dto.tableId) {
            try {
                const table = await this.tablesService.getById(tenantId, dto.tableId);
                tableName = table.name;
                // Automatically assign table and mark occupied
                await this.tablesService.updateStatus(tenantId, dto.tableId, 'occupied', ref.id);
            } catch {
                // Ignore if table not found
            }
        }

        // 5. Resolve Customer Details
        let customerName: string | null = null;
        if (dto.customerId) {
            try {
                const customer = await this.customersService.getById(tenantId, dto.customerId);
                customerName = customer.name;
            } catch {
                // Customer not found, leave as null
            }
        }

        const orderNumber = `#${Date.now().toString().slice(-5)}`;

        const order: Order = {
            id: ref.id,
            orderNumber,
            tenantId,
            orderType: dto.orderType,
            tableId: dto.tableId || null,
            tableName,
            customerId: dto.customerId || null,
            customerName,
            status: 'placed',
            paymentStatus: 'unpaid',
            items,
            subtotal,
            taxTotal,
            taxRatePercentage,
            discountTotal,
            discountCode: discountCode || undefined,
            grandTotal,
            paidAmount: 0,
            waiterUserId: userId,
            waiterName: userName,
            notes: dto.notes,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
        };

        await ref.set(order);
        return order;
    }

    async addItems(tenantId: string, orderId: string, dto: AddOrderItemsDto): Promise<Order> {
        const order = await this.getById(tenantId, orderId);

        if (order.status === 'completed' || order.status === 'cancelled') {
            throw new BadRequestException(`Cannot add items to a ${order.status} order`);
        }

        const newItems: OrderItem[] = dto.items.map((item) => ({
            ...item,
            subtotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
        }));

        const mergedItems = [...order.items, ...newItems];
        const subtotal = Math.round(mergedItems.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;

        const taxableAmount = Math.max(0, subtotal - order.discountTotal);
        const taxTotal = Math.round(((taxableAmount * order.taxRatePercentage) / 100) * 100) / 100;
        const grandTotal = Math.round((taxableAmount + taxTotal) * 100) / 100;

        const updateData = {
            items: mergedItems,
            subtotal,
            taxTotal,
            grandTotal,
            updatedAt: new Date(),
        };

        await this.getCollection(tenantId).doc(orderId).update(updateData);
        return {
            ...order,
            ...updateData,
        };
    }

    async updateStatus(
        tenantId: string,
        orderId: string,
        status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled',
    ): Promise<Order> {
        const order = await this.getById(tenantId, orderId);
        const now = new Date();

        const updateData: Record<string, any> = {
            status,
            updatedAt: now,
        };

        if (status === 'completed') {
            updateData.completedAt = now;
            // If dine-in, free the table
            if (order.tableId) {
                await this.tablesService.updateStatus(tenantId, order.tableId, 'vacant', null);
            }
        } else if (status === 'cancelled') {
            // Free the table if occupied
            if (order.tableId) {
                await this.tablesService.updateStatus(tenantId, order.tableId, 'vacant', null);
            }
        }

        await this.getCollection(tenantId).doc(orderId).update(updateData);

        return {
            ...order,
            ...updateData,
        };
    }

    async cancel(tenantId: string, orderId: string): Promise<Order> {
        return this.updateStatus(tenantId, orderId, 'cancelled');
    }

    async recordPaymentSuccess(tenantId: string, orderId: string, amount: number): Promise<Order> {
        const order = await this.getById(tenantId, orderId);
        const newPaidAmount = Math.round(((order.paidAmount ?? 0) + amount) * 100) / 100;
        const isFullyPaid = newPaidAmount >= order.grandTotal;
        const now = new Date();

        const updateData: Record<string, any> = {
            paidAmount: newPaidAmount,
            paymentStatus: isFullyPaid ? 'paid' : 'partially_paid',
            updatedAt: now,
        };

        if (isFullyPaid) {
            updateData.status = 'completed';
            updateData.completedAt = now;

            // 1. Free dining table
            if (order.tableId) {
                await this.tablesService.updateStatus(tenantId, order.tableId, 'vacant', null);
            }

            // 2. Record customer spend and loyalty
            if (order.customerId) {
                try {
                    await this.customersService.recordSpend(tenantId, order.customerId, order.grandTotal);
                } catch {
                    // Ignore customer update errors
                }
            }
        }

        await this.getCollection(tenantId).doc(orderId).update(updateData);

        return {
            ...order,
            ...updateData,
        };
    }
}
