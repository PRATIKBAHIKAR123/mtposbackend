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

import { TablesService } from './tables.service.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { UpdateTableStatusDto } from './dto/update-table-status.dto.js';

@ApiTags('POS - Dining Tables')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID (optional if specified in path or query)',
    required: false,
})
@Controller('tables')
@UseGuards(AuthGuard, TenantGuard)
export class TablesController {
    constructor(
        private readonly tablesService: TablesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List dining tables for the tenant business' })
    @ApiQuery({ name: 'section', required: false, description: 'Filter by floor section (e.g. Main, Patio)' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status: vacant, occupied, reserved, billed' })
    @ApiResponse({ status: 200, description: 'List of tables' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('section') section?: string,
        @Query('status') status?: string,
    ) {
        return this.tablesService.getAll(tenantId, section, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get table details by ID' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.tablesService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new dining table' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateTableDto,
    ) {
        return this.tablesService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update table details (name, capacity, section)' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateTableDto,
    ) {
        return this.tablesService.update(tenantId, id, dto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Fast update table status (vacant, occupied, reserved, billed)' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    async updateStatus(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateTableStatusDto,
    ) {
        return this.tablesService.updateStatus(
            tenantId,
            id,
            dto.status,
            dto.currentOrderId,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete (soft delete) a dining table' })
    @ApiParam({ name: 'id', description: 'Table ID' })
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.tablesService.delete(tenantId, id);
    }
}
