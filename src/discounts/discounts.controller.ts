import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';
import { TenantId } from '../common/decorators/tenant-id.decorator.js';

import { DiscountsService } from './discounts.service.js';
import { CreateDiscountDto } from './dto/create-discount.dto.js';
import { UpdateDiscountDto } from './dto/update-discount.dto.js';

@ApiTags('POS - Discounts')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('discounts')
@UseGuards(AuthGuard, TenantGuard)
export class DiscountsController {
    constructor(
        private readonly discountsService: DiscountsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all active discounts for the tenant business' })
    @ApiResponse({ status: 200, description: 'List of discounts' })
    async getAll(@TenantId() tenantId: string) {
        return this.discountsService.getAll(tenantId);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Find discount coupon by coupon code' })
    @ApiParam({ name: 'code', description: 'Discount Code' })
    async findByCode(
        @TenantId() tenantId: string,
        @Param('code') code: string,
    ) {
        return this.discountsService.findByCode(tenantId, code);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get discount details by ID' })
    @ApiParam({ name: 'id', description: 'Discount ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.discountsService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new discount' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateDiscountDto,
    ) {
        return this.discountsService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing discount' })
    @ApiParam({ name: 'id', description: 'Discount ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateDiscountDto,
    ) {
        return this.discountsService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete (soft delete) a discount' })
    @ApiParam({ name: 'id', description: 'Discount ID' })
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.discountsService.delete(tenantId, id);
    }
}
