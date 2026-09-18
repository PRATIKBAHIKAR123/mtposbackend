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

import { MembershipsService } from './memberships.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';

@ApiTags('Tenant Members & Staff')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('memberships')
@UseGuards(AuthGuard, TenantGuard)
export class MembershipsController {
    constructor(
        private readonly membershipsService: MembershipsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all staff members for the current tenant' })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'suspended', 'inactive'] })
    @ApiResponse({ status: 200, description: 'List of tenant memberships' })
    async getAll(
        @TenantId() tenantId: string,
        @Query('status') status?: string,
    ) {
        return this.membershipsService.getAll(tenantId, status);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Get staff member details by user ID' })
    @ApiParam({ name: 'userId', description: 'User ID of staff member' })
    async get(
        @TenantId() tenantId: string,
        @Param('userId') userId: string,
    ) {
        return this.membershipsService.get(tenantId, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Add a new staff member to the current tenant' })
    async addMember(
        @TenantId() tenantId: string,
        @Body() dto: AddMemberDto,
    ) {
        return this.membershipsService.create(tenantId, dto.userId, dto.roleId);
    }

    @Patch(':userId/role')
    @ApiOperation({ summary: 'Update staff member role' })
    @ApiParam({ name: 'userId', description: 'User ID of staff member' })
    async updateRole(
        @TenantId() tenantId: string,
        @Param('userId') userId: string,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.membershipsService.updateRole(tenantId, userId, dto.roleId);
    }

    @Patch(':userId/status')
    @ApiOperation({ summary: 'Update staff member status (active/suspended/inactive)' })
    @ApiParam({ name: 'userId', description: 'User ID of staff member' })
    async updateStatus(
        @TenantId() tenantId: string,
        @Param('userId') userId: string,
        @Body() dto: UpdateMemberStatusDto,
    ) {
        return this.membershipsService.updateStatus(tenantId, userId, dto.status);
    }

    @Delete(':userId')
    @ApiOperation({ summary: 'Remove a staff member from the current tenant' })
    @ApiParam({ name: 'userId', description: 'User ID of staff member' })
    async delete(
        @TenantId() tenantId: string,
        @Param('userId') userId: string,
    ) {
        return this.membershipsService.delete(tenantId, userId);
    }
}
