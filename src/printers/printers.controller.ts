import {
    Body,
    Controller,
    Delete,
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

import { PrintersService } from './printers.service.js';
import { CreatePrinterDto } from './dto/create-printer.dto.js';
import { UpdatePrinterDto } from './dto/update-printer.dto.js';

@ApiTags('POS - Printers')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('printers')
@UseGuards(AuthGuard, TenantGuard)
export class PrintersController {
    constructor(
        private readonly printersService: PrintersService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List configured printers for the tenant business' })
    @ApiQuery({ name: 'type', required: false, enum: ['kot', 'receipt', 'bar'] })
    @ApiResponse({ status: 200, description: 'List of printers' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('type') type?: string,
    ) {
        return this.printersService.getAll(tenantId, type);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get printer configuration by ID' })
    @ApiParam({ name: 'id', description: 'Printer ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.printersService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Configure a new printer (KOT/receipt)' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreatePrinterDto,
    ) {
        return this.printersService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update printer configuration' })
    @ApiParam({ name: 'id', description: 'Printer ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdatePrinterDto,
    ) {
        return this.printersService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove a printer configuration' })
    @ApiParam({ name: 'id', description: 'Printer ID' })
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.printersService.delete(tenantId, id);
    }
}
