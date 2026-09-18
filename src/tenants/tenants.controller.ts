import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { TenantsService } from './tenants.service.js';
import { OnboardTenantDto } from './dto/onboard-tenant.dto.js';

@ApiTags('Tenants & Onboarding')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly tenantsService: TenantsService,
    ) { }

    @Get('my-tenants')
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'List all restaurant workspaces the authenticated user belongs to' })
    @ApiResponse({ status: 200, description: 'List of user businesses with their assigned role' })
    async getMyTenants(
        @CurrentUser() user: any,
    ) {
        return this.tenantsService.getUserTenants(user.uid);
    }

    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a new restaurant workspace with plan selection & trial provisioning' })
    @ApiResponse({ status: 201, description: 'Workspace, Owner Membership, and Trial Subscription created' })
    async createTenant(
        @CurrentUser() user: any,
        @Body() dto: OnboardTenantDto,
    ) {
        return this.tenantsService.onboard(user.uid, user.email || '', dto);
    }

    @Get(':id')
    @UseGuards(AuthGuard, TenantGuard)
    @ApiOperation({ summary: 'Get business details for authenticated member' })
    @ApiParam({ name: 'id', description: 'Tenant ID' })
    @ApiResponse({ status: 200, description: 'Tenant details' })
    @ApiResponse({ status: 403, description: 'Forbidden if not an active member' })
    async getTenant(
        @Param('id') tenantId: string,
    ) {
        return this.tenantsService.getById(tenantId);
    }
}