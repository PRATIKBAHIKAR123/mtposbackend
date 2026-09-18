import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { OrdersService } from '../orders/orders.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

export interface Payment {
    id: string;
    tenantId?: string;
    orderId: string;
    amount: number;
    method: 'cash' | 'card' | 'upi' | 'split';
    transactionRef?: string;
    notes?: string;
    status: 'success' | 'refunded';
    cashierUserId?: string;
    cashierName?: string;
    createdAt: Date;
}

@Injectable()
export class PaymentsService {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly ordersService: OrdersService,
    ) { }

    private getCollection(tenantId: string) {
        return this.firebaseService.firestore
            .collection('tenants')
            .doc(tenantId)
            .collection('payments');
    }

    async getAll(tenantId: string, orderId?: string): Promise<Payment[]> {
        let query: FirebaseFirestore.Query = this.getCollection(tenantId);

        if (orderId) {
            query = query.where('orderId', '==', orderId);
        }

        const snapshot = await query.get();

        const payments = snapshot.docs.map((doc) => ({
            id: doc.id,
            tenantId,
            ...doc.data(),
        })) as Payment[];

        return payments.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
        });
    }

    async getById(tenantId: string, paymentId: string): Promise<Payment> {
        const doc = await this.getCollection(tenantId).doc(paymentId).get();
        if (!doc.exists) {
            throw new NotFoundException('Payment not found');
        }
        return {
            id: doc.id,
            tenantId,
            ...doc.data(),
        } as Payment;
    }

    async create(
        tenantId: string,
        dto: CreatePaymentDto,
        cashierUserId?: string,
        cashierName?: string,
    ): Promise<{ payment: Payment; order: any }> {
        // 1. Verify order
        const order = await this.ordersService.getById(tenantId, dto.orderId);

        if (order.status === 'cancelled') {
            throw new BadRequestException('Cannot accept payment for a cancelled order');
        }
        if (order.paymentStatus === 'paid') {
            throw new BadRequestException('This order is already fully paid');
        }

        if (dto.amount <= 0) {
            throw new BadRequestException('Payment amount must be greater than zero');
        }

        // 2. Create payment record
        const ref = this.getCollection(tenantId).doc();
        const now = new Date();

        const payment: Payment = {
            id: ref.id,
            tenantId,
            orderId: dto.orderId,
            amount: dto.amount,
            method: dto.method,
            transactionRef: dto.transactionRef,
            notes: dto.notes,
            status: 'success',
            cashierUserId,
            cashierName,
            createdAt: now,
        };

        await ref.set(payment);

        // 3. Update order payment status and check if fully settled (which frees table and records CRM spend)
        const updatedOrder = await this.ordersService.recordPaymentSuccess(
            tenantId,
            dto.orderId,
            dto.amount,
        );

        return {
            payment,
            order: updatedOrder,
        };
    }
}
