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
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { UsersService } from '../users/users.service.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { ApplicationsService } from '../applications/applications.service.js';
import { MembershipsService } from '../memberships/memberships.service.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import { PlansService } from '../plans/plans.service.js';
import { PermissionsService } from '../permissions/permissions.service.js';

import { SystemAdminGuard } from './system-admin.guard.js';
import { SystemAdminService } from './system-admin.service.js';

import { UpdateTenantStatusDto } from '../tenants/dto/update-tenant-status.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpdateSystemRoleDto } from './dto/update-system-role.dto.js';
import { ReviewApplicationDto } from '../applications/dto/review-application.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto.js';
import { UpdateSubscriptionStatusDto } from './dto/update-subscription-status.dto.js';
import { CreatePlanDto } from '../plans/dto/create-plan.dto.js';
import { UpdatePlanDto } from '../plans/dto/update-plan.dto.js';

@ApiTags('System Admin')
@ApiBearerAuth()
@Controller('system-admin')
@UseGuards(
    AuthGuard,
    SystemAdminGuard,
)
export class SystemAdminController {
    constructor(
        private readonly systemAdminService: SystemAdminService,
        private readonly usersService: UsersService,
        private readonly tenantsService: TenantsService,
        private readonly applicationsService: ApplicationsService,
        private readonly membershipsService: MembershipsService,
        private readonly subscriptionsService: SubscriptionsService,
        private readonly plansService: PlansService,
        private readonly permissionsService: PermissionsService,
    ) { }

    // =========================================================
    // Dashboard
    // =========================================================

    @Get('dashboard')
    @ApiOperation({ summary: 'Get SaaS platform aggregate metrics' })
    @ApiResponse({ status: 200, description: 'Aggregate metrics returned successfully' })
    async getDashboard() {
        return this.systemAdminService.getDashboard();
    }

    // =========================================================
    // Applications
    // =========================================================

    @Get('applications')
    @ApiOperation({ summary: 'List all tenant onboarding applications' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status: pending, approved, rejected' })
    async getApplications(
        @Query('status') status?: string,
    ) {
        return this.applicationsService.getAll(status);
    }

    @Get('applications/:id')
    @ApiOperation({ summary: 'Get application details by ID' })
    @ApiParam({ name: 'id', description: 'Application ID' })
    async getApplicationById(
        @Param('id') id: string,
    ) {
        return this.applicationsService.getById(id);
    }

    @Post('applications/:id/approve')
    @ApiOperation({ summary: 'Approve application and provision tenant with trial subscription' })
    @ApiParam({ name: 'id', description: 'Application ID' })
    async approveApplication(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        return this.applicationsService.approve(id, user.uid);
    }

    @Post('applications/:id/reject')
    @ApiOperation({ summary: 'Reject application with optional reason' })
    @ApiParam({ name: 'id', description: 'Application ID' })
    async rejectApplication(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Body() body: ReviewApplicationDto,
    ) {
        return this.applicationsService.reject(id, user.uid, body.reason);
    }

    // =========================================================
    // Users
    // =========================================================

    @Get('users')
    @ApiOperation({ summary: 'List all registered platform users' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status: active, suspended, inactive' })
    @ApiQuery({ name: 'systemRole', required: false, description: 'Filter by systemRole: admin, user' })
    async getUsers(
        @Query('status') status?: string,
        @Query('systemRole') systemRole?: string,
    ) {
        return this.usersService.getAll(
            status,
            systemRole,
        );
    }

    @Get('users/:id')
    @ApiOperation({ summary: 'Get user details by ID' })
    @ApiParam({ name: 'id', description: 'User ID / Firebase UID' })
    async getUserById(
        @Param('id') id: string,
    ) {
        return this.usersService.getById(id);
    }

    @Patch('users/:id/status')
    @ApiOperation({ summary: 'Update user status (active, suspended, inactive)' })
    @ApiParam({ name: 'id', description: 'User ID' })
    async updateUserStatus(
        @Param('id') id: string,
        @Body() body: UpdateUserStatusDto,
    ) {
        return this.usersService.updateStatus(
            id,
            body.status,
        );
    }

    @Patch('users/:id/system-role')
    @ApiOperation({ summary: 'Update user system role (admin or user)' })
    @ApiParam({ name: 'id', description: 'User ID' })
    async updateUserSystemRole(
        @Param('id') id: string,
        @Body() body: UpdateSystemRoleDto,
    ) {
        return this.usersService.updateSystemRole(
            id,
            body.systemRole,
        );
    }

    // =========================================================
    // Businesses (Tenants)
    // =========================================================

    @Get('businesses')
    @ApiOperation({ summary: 'List all businesses / tenants' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status: active, suspended' })
    async getBusinesses(
        @Query('status') status?: string,
    ) {
        return this.tenantsService.getAll(status);
    }

    @Get('businesses/:id')
    @ApiOperation({ summary: 'Get business details by ID' })
    @ApiParam({ name: 'id', description: 'Tenant / Business ID' })
    async getBusinessById(
        @Param('id') id: string,
    ) {
        return this.tenantsService.getById(id);
    }

    @Patch('businesses/:id/status')
    @ApiOperation({ summary: 'Update business status (active, suspended)' })
    @ApiParam({ name: 'id', description: 'Tenant / Business ID' })
    async updateBusinessStatus(
        @Param('id') id: string,
        @Body() body: UpdateTenantStatusDto,
    ) {
        return this.tenantsService.updateStatus(
            id,
            body.status,
        );
    }

    @Get('businesses/:tenantId/subscription')
    @ApiOperation({ summary: 'Get active subscription for a business' })
    @ApiParam({ name: 'tenantId', description: 'Tenant / Business ID' })
    async getBusinessSubscription(
        @Param('tenantId') tenantId: string,
    ) {
        return this.subscriptionsService.getActive(tenantId);
    }

    // =========================================================
    // Business Memberships
    // =========================================================

    @Get('businesses/:tenantId/members')
    @ApiOperation({ summary: 'List all members of a business' })
    @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by membership status: active, suspended, inactive' })
    async getBusinessMembers(
        @Param('tenantId') tenantId: string,
        @Query('status') status?: string,
    ) {
        return this.membershipsService.getAll(tenantId, status);
    }

    @Get('businesses/:tenantId/members/:userId')
    @ApiOperation({ summary: 'Get a specific business member details' })
    @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async getBusinessMember(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
    ) {
        return this.membershipsService.get(tenantId, userId);
    }

    @Patch('businesses/:tenantId/members/:userId/role')
    @ApiOperation({ summary: 'Update member role in a business' })
    @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async updateBusinessMemberRole(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
        @Body() body: UpdateMemberRoleDto,
    ) {
        return this.membershipsService.updateRole(
            tenantId,
            userId,
            body.roleId,
        );
    }

    @Patch('businesses/:tenantId/members/:userId/status')
    @ApiOperation({ summary: 'Update member status in a business' })
    @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    async updateBusinessMemberStatus(
        @Param('tenantId') tenantId: string,
        @Param('userId') userId: string,
        @Body() body: UpdateMemberStatusDto,
    ) {
        return this.membershipsService.updateStatus(
            tenantId,
            userId,
            body.status,
        );
    }

    // =========================================================
    // Subscriptions
    // =========================================================

    @Get('subscriptions')
    @ApiOperation({ summary: 'List all platform subscriptions across businesses' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status: trialing, active, expired, cancelled, suspended' })
    async getSubscriptions(
        @Query('status') status?: string,
    ) {
        return this.subscriptionsService.getAll(status);
    }

    @Get('subscriptions/:id')
    @ApiOperation({ summary: 'Get subscription details by ID' })
    @ApiParam({ name: 'id', description: 'Subscription ID' })
    async getSubscriptionById(
        @Param('id') id: string,
    ) {
        return this.subscriptionsService.getById(id);
    }

    @Patch('subscriptions/:id/status')
    @ApiOperation({ summary: 'Update subscription status' })
    @ApiParam({ name: 'id', description: 'Subscription ID' })
    async updateSubscriptionStatus(
        @Param('id') id: string,
        @Body() body: UpdateSubscriptionStatusDto,
    ) {
        return this.subscriptionsService.updateStatus(
            id,
            body.status,
        );
    }

    // =========================================================
    // Plans
    // =========================================================

    @Get('plans')
    @ApiOperation({ summary: 'List SaaS subscription plans' })
    @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive plans (defaults to true for admin)' })
    async getPlans(
        @Query('includeInactive') includeInactive?: string,
    ) {
        const showInactive = includeInactive !== undefined
            ? includeInactive === 'true'
            : true;
        return this.plansService.getAll(showInactive);
    }

    @Get('plans/:id')
    @ApiOperation({ summary: 'Get subscription plan details by ID' })
    @ApiParam({ name: 'id', description: 'Plan ID' })
    async getPlanById(
        @Param('id') id: string,
    ) {
        return this.plansService.getById(id);
    }

    @Post('plans')
    @ApiOperation({ summary: 'Create a new subscription plan' })
    async createPlan(
        @Body() body: CreatePlanDto,
    ) {
        return this.plansService.create(body);
    }

    @Patch('plans/:id')
    @ApiOperation({ summary: 'Update a subscription plan' })
    @ApiParam({ name: 'id', description: 'Plan ID' })
    async updatePlan(
        @Param('id') id: string,
        @Body() body: UpdatePlanDto,
    ) {
        return this.plansService.update(id, body);
    }

    // =========================================================
    // Features Catalog
    // =========================================================

    @Get('features')
    @ApiOperation({ summary: 'Catalog of SaaS platform feature definitions' })
    async getFeatures() {
        return this.permissionsService.getAllFeatures();
    }
}
