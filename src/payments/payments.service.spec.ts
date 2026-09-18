import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let mockFirebaseService: any;
    let mockOrdersService: any;
    let mockDocRef: any;
    let mockCollection: any;

    beforeEach(() => {
        mockDocRef = {
            id: 'mock-pay-123',
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

        mockOrdersService = {
            getById: vi.fn(),
            recordPaymentSuccess: vi.fn(),
        };

        service = new PaymentsService(
            mockFirebaseService,
            mockOrdersService,
        );
    });

    it('should throw BadRequestException if order is cancelled', async () => {
        mockOrdersService.getById.mockResolvedValue({
            id: 'order-1',
            status: 'cancelled',
            paymentStatus: 'unpaid',
            grandTotal: 100,
        });

        await expect(
            service.create('tenant-1', {
                orderId: 'order-1',
                amount: 100,
                method: 'cash',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order is already paid', async () => {
        mockOrdersService.getById.mockResolvedValue({
            id: 'order-1',
            status: 'completed',
            paymentStatus: 'paid',
            grandTotal: 100,
        });

        await expect(
            service.create('tenant-1', {
                orderId: 'order-1',
                amount: 100,
                method: 'card',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should successfully record payment and update order status', async () => {
        mockOrdersService.getById.mockResolvedValue({
            id: 'order-1',
            status: 'placed',
            paymentStatus: 'unpaid',
            grandTotal: 250,
            paidAmount: 0,
        });

        const updatedOrderMock = {
            id: 'order-1',
            status: 'completed',
            paymentStatus: 'paid',
            paidAmount: 250,
        };

        mockOrdersService.recordPaymentSuccess.mockResolvedValue(updatedOrderMock);

        const result = await service.create(
            'tenant-1',
            {
                orderId: 'order-1',
                amount: 250,
                method: 'upi',
                transactionRef: 'UPI-12345',
            },
            'cashier-1',
            'Alex Cashier',
        );

        expect(result.payment.id).toBe('mock-pay-123');
        expect(result.payment.amount).toBe(250);
        expect(result.payment.method).toBe('upi');
        expect(result.payment.cashierUserId).toBe('cashier-1');
        expect(result.order).toEqual(updatedOrderMock);

        expect(mockDocRef.set).toHaveBeenCalled();
        expect(mockOrdersService.recordPaymentSuccess).toHaveBeenCalledWith(
            'tenant-1',
            'order-1',
            250,
        );
    });
});
