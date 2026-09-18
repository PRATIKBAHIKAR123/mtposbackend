import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
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

import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { AddOrderItemsDto } from './dto/add-order-items.dto.js';

@ApiTags('POS - Orders')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('orders')
@UseGuards(AuthGuard, TenantGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List orders for the tenant with optional filters' })
    @ApiQuery({ name: 'status', required: false, enum: ['placed', 'preparing', 'ready', 'completed', 'cancelled'] })
    @ApiQuery({ name: 'orderType', required: false, enum: ['dine-in', 'takeaway', 'delivery'] })
    @ApiQuery({ name: 'tableId', required: false, type: String })
    @ApiQuery({ name: 'paymentStatus', required: false, enum: ['unpaid', 'partially_paid', 'paid', 'refunded'] })
    @ApiResponse({ status: 200, description: 'List of orders' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('status') status?: string,
        @Query('orderType') orderType?: string,
        @Query('tableId') tableId?: string,
        @Query('paymentStatus') paymentStatus?: string,
    ) {
        return this.ordersService.getAll(tenantId, {
            status,
            orderType,
            tableId,
            paymentStatus,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order details by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.ordersService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create and place a new order' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateOrderDto,
        @Request() req: any,
    ) {
        const userId = req.user?.uid || req.user?.id;
        const userName = req.user?.email || req.user?.name;
        return this.ordersService.create(tenantId, dto, userId, userName);
    }

    @Patch(':id/items')
    @ApiOperation({ summary: 'Add additional items to an active order (KOT round)' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    async addItems(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: AddOrderItemsDto,
    ) {
        return this.ordersService.addItems(tenantId, id, dto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Advance or update order workflow status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    async updateStatus(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(tenantId, id, dto.status);
    }

    @Post(':id/cancel')
    @ApiOperation({ summary: 'Cancel an order and free any associated table' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    async cancel(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.ordersService.cancel(tenantId, id);
    }
}
