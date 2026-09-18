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

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('POS - Categories')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID (optional if specified in path or query)',
    required: false,
})
@Controller('categories')
@UseGuards(AuthGuard, TenantGuard)
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all menu categories for the tenant business' })
    @ApiResponse({ status: 200, description: 'List of categories' })
    async getAll(@TenantId() tenantId: string) {
        return this.categoriesService.getAll(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category details by ID' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.categoriesService.getById(tenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new menu category' })
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(tenantId, dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing menu category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete (soft delete) a category' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.categoriesService.delete(tenantId, id);
    }
}
