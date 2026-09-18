import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
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

import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@ApiTags('POS - Customers CRM')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('customers')
@UseGuards(AuthGuard, TenantGuard)
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List and search customers by phone, name, or email' })
    @ApiQuery({ name: 'search', required: false, description: 'Search term for name, phone, or email' })
    @ApiResponse({ status: 200, description: 'List of customers' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('search') search?: string,
    ) {
        return this.customersService.getAll(tenantId, search);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get customer profile and CRM history by ID' })
    @ApiParam({ name: 'id', description: 'Customer ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.customersService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Register a new customer' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateCustomerDto,
    ) {
        return this.customersService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update customer profile' })
    @ApiParam({ name: 'id', description: 'Customer ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCustomerDto,
    ) {
        return this.customersService.update(tenantId, id, dto);
    }
}
