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

import { TaxRatesService } from './tax-rates.service.js';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto.js';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto.js';

@ApiTags('POS - Tax Rates')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('tax-rates')
@UseGuards(AuthGuard, TenantGuard)
export class TaxRatesController {
    constructor(
        private readonly taxRatesService: TaxRatesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all active tax rates for the tenant business' })
    @ApiResponse({ status: 200, description: 'List of tax rates' })
    async getAll(@TenantId() tenantId: string) {
        return this.taxRatesService.getAll(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get tax rate details by ID' })
    @ApiParam({ name: 'id', description: 'Tax Rate ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.taxRatesService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new tax rate' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateTaxRateDto,
    ) {
        return this.taxRatesService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing tax rate' })
    @ApiParam({ name: 'id', description: 'Tax Rate ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateTaxRateDto,
    ) {
        return this.taxRatesService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete (soft delete) a tax rate' })
    @ApiParam({ name: 'id', description: 'Tax Rate ID' })
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.taxRatesService.delete(tenantId, id);
    }
}
