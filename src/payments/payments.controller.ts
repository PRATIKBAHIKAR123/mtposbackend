import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';
import { TenantId } from '../common/decorators/tenant-id.decorator.js';

import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@ApiTags('POS - Payments')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('payments')
@UseGuards(AuthGuard, TenantGuard)
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all payments for tenant, optionally filtered by orderId' })
    @ApiQuery({ name: 'orderId', required: false, type: String })
    @ApiResponse({ status: 200, description: 'List of payments' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('orderId') orderId?: string,
    ) {
        return this.paymentsService.getAll(tenantId, orderId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment record by ID' })
    @ApiParam({ name: 'id', description: 'Payment ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.paymentsService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Process a payment for an order' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreatePaymentDto,
        @Request() req: any,
    ) {
        const userId = req.user?.uid || req.user?.id;
        const userName = req.user?.email || req.user?.name;
        return this.paymentsService.create(tenantId, dto, userId, userName);
    }
}
