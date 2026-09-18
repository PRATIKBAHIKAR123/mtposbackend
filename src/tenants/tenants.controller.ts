import {
    Controller,
    Get,
    Param,
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

import { TenantsService } from './tenants.service.js';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
    constructor(
        private readonly tenantsService: TenantsService,
    ) { }

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