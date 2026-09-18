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

import { MenuService } from './menu.service.js';
import { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';
import { UpdateAvailabilityDto } from './dto/update-availability.dto.js';

@ApiTags('POS - Menu')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID (optional if specified in path or query)',
    required: false,
})
@Controller('menu')
@UseGuards(AuthGuard, TenantGuard)
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all menu items for the tenant business' })
    @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
    @ApiQuery({ name: 'isAvailable', required: false, description: 'Filter by availability (true/false)' })
    @ApiResponse({ status: 200, description: 'List of menu items' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('categoryId') categoryId?: string,
        @Query('isAvailable') isAvailable?: string,
    ) {
        const availableFilter =
            isAvailable !== undefined ? isAvailable === 'true' : undefined;
        return this.menuService.getAll(tenantId, categoryId, availableFilter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get menu item details by ID' })
    @ApiParam({ name: 'id', description: 'Menu Item ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.menuService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new menu item' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateMenuItemDto,
    ) {
        return this.menuService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing menu item' })
    @ApiParam({ name: 'id', description: 'Menu Item ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateMenuItemDto,
    ) {
        return this.menuService.update(tenantId, id, dto);
    }

    @Patch(':id/availability')
    @ApiOperation({ summary: 'Quick toggle item availability / out-of-stock (86ed)' })
    @ApiParam({ name: 'id', description: 'Menu Item ID' })
    async updateAvailability(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateAvailabilityDto,
    ) {
        return this.menuService.updateAvailability(tenantId, id, dto.isAvailable);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete (soft delete) a menu item' })
    @ApiParam({ name: 'id', description: 'Menu Item ID' })
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.menuService.delete(tenantId, id);
    }
}
