import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
    let service: OrdersService;
    let mockFirebaseService: any;
    let mockTablesService: any;
    let mockDiscountsService: any;
    let mockTaxRatesService: any;
    let mockCustomersService: any;
    let mockDocRef: any;
    let mockCollection: any;

    beforeEach(() => {
        mockDocRef = {
            id: 'mock-order-123',
            set: vi.fn().mockResolvedValue(true),
            get: vi.fn(),
            update: vi.fn().mockResolvedValue(true),
        };

        mockCollection = {
            doc: vi.fn().mockReturnValue(mockDocRef),
            where: vi.fn().mockReturnThis(),
            get: vi.fn().mockResolvedValue({ docs: [] }),
        };

        mockFirebaseService = {
            firestore: {
                collection: vi.fn().mockReturnValue({
                    doc: vi.fn().mockReturnValue({
                        collection: vi.fn().mockReturnValue(mockCollection),
                    }),
                }),
            },
        };

        mockTablesService = {
            getById: vi.fn().mockResolvedValue({ id: 'table-1', name: 'Table 1' }),
            updateStatus: vi.fn().mockResolvedValue(true),
        };

        mockDiscountsService = {
            findByCode: vi.fn().mockResolvedValue(null),
        };

        mockTaxRatesService = {
            getAll: vi.fn().mockResolvedValue([{ percentage: 5 }]),
        };

        mockCustomersService = {
            getById: vi.fn().mockResolvedValue({ id: 'cust-1', name: 'John Doe' }),
            recordSpend: vi.fn().mockResolvedValue(true),
        };

        service = new OrdersService(
            mockFirebaseService,
            mockTablesService,
            mockDiscountsService,
            mockTaxRatesService,
            mockCustomersService,
        );
    });

    it('should throw BadRequestException if order has no items', async () => {
        await expect(
            service.create('tenant-1', {
                orderType: 'dine-in',
                items: [],
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should correctly calculate subtotal, taxes and occupy table for dine-in order', async () => {
        const order = await service.create(
            'tenant-1',
            {
                orderType: 'dine-in',
                tableId: 'table-1',
                items: [
                    { menuItemId: 'item-1', name: 'Burger', quantity: 2, unitPrice: 100 },
                    { menuItemId: 'item-2', name: 'Fries', quantity: 1, unitPrice: 50 },
                ],
                taxRate: 10,
            },
            'waiter-1',
            'Waiter Sam',
        );

        // Subtotal = 2*100 + 1*50 = 250
        expect(order.subtotal).toBe(250);
        // Tax 10% of 250 = 25
        expect(order.taxTotal).toBe(25);
        // GrandTotal = 275
        expect(order.grandTotal).toBe(275);
        expect(order.status).toBe('placed');
        expect(order.paymentStatus).toBe('unpaid');
        expect(order.tableName).toBe('Table 1');

        // Table should be occupied with order ID
        expect(mockTablesService.updateStatus).toHaveBeenCalledWith(
            'tenant-1',
            'table-1',
            'occupied',
            'mock-order-123',
        );
        expect(mockDocRef.set).toHaveBeenCalled();
    });

    it('should apply percentage discount coupon correctly', async () => {
        mockDiscountsService.findByCode.mockResolvedValue({
            id: 'disc-1',
            code: 'FLAT20',
            type: 'percentage',
            value: 20,
            minOrderAmount: 100,
            isActive: true,
        });

        const order = await service.create('tenant-1', {
            orderType: 'takeaway',
            discountCode: 'FLAT20',
            items: [{ menuItemId: 'item-1', name: 'Pizza', quantity: 1, unitPrice: 500 }],
            taxRate: 5,
        });

        // Subtotal = 500
        expect(order.subtotal).toBe(500);
        // Discount 20% of 500 = 100
        expect(order.discountTotal).toBe(100);
        // Taxable = 400. Tax 5% = 20
        expect(order.taxTotal).toBe(20);
        // Grand total = 420
        expect(order.grandTotal).toBe(420);
    });

    it('should add extra items and recalculate totals', async () => {
        const existingOrder = {
            id: 'mock-order-123',
            status: 'placed',
            discountTotal: 0,
            taxRatePercentage: 10,
            items: [{ menuItemId: 'item-1', name: 'Pizza', quantity: 1, unitPrice: 200, subtotal: 200 }],
            subtotal: 200,
            taxTotal: 20,
            grandTotal: 220,
        };

        mockDocRef.get.mockResolvedValue({
            exists: true,
            id: 'mock-order-123',
            data: () => existingOrder,
        });

        const updated = await service.addItems('tenant-1', 'mock-order-123', {
            items: [{ menuItemId: 'item-2', name: 'Coke', quantity: 2, unitPrice: 50 }],
        });

        // 200 + 100 = 300
        expect(updated.subtotal).toBe(300);
        // Tax 10% of 300 = 30
        expect(updated.taxTotal).toBe(30);
        // Grand Total = 330
        expect(updated.grandTotal).toBe(330);
        expect(updated.items).toHaveLength(2);
        expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('should free dining table when order is cancelled', async () => {
        mockDocRef.get.mockResolvedValue({
            exists: true,
            id: 'mock-order-123',
            data: () => ({
                id: 'mock-order-123',
                tableId: 'table-1',
                status: 'placed',
            }),
        });

        await service.cancel('tenant-1', 'mock-order-123');

        expect(mockTablesService.updateStatus).toHaveBeenCalledWith(
            'tenant-1',
            'table-1',
            'vacant',
            null,
        );
        expect(mockDocRef.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'cancelled' }),
        );
    });

    it('should mark order paid, completed, release table, and record customer spend on full payment', async () => {
        mockDocRef.get.mockResolvedValue({
            exists: true,
            id: 'mock-order-123',
            data: () => ({
                id: 'mock-order-123',
                tableId: 'table-1',
                customerId: 'cust-1',
                grandTotal: 300,
                paidAmount: 0,
                paymentStatus: 'unpaid',
                status: 'placed',
            }),
        });

        const result = await service.recordPaymentSuccess('tenant-1', 'mock-order-123', 300);

        expect(result.paymentStatus).toBe('paid');
        expect(result.status).toBe('completed');
        expect(result.paidAmount).toBe(300);

        // Free table
        expect(mockTablesService.updateStatus).toHaveBeenCalledWith(
            'tenant-1',
            'table-1',
            'vacant',
            null,
        );
        // Record customer CRM spend
        expect(mockCustomersService.recordSpend).toHaveBeenCalledWith('tenant-1', 'cust-1', 300);
    });
});
