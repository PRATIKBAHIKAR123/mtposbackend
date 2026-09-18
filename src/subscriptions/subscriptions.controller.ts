import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { TenantGuard } from '../common/guards/tenant.guard.js';
import { TenantId } from '../common/decorators/tenant-id.decorator.js';
import { PlansService } from '../plans/plans.service.js';

import { SubscriptionsService } from './subscriptions.service.js';
import { SelectPlanDto } from './dto/select-plan.dto.js';

@ApiTags('Subscriptions & Plans')
@ApiBearerAuth()
@ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant Business ID',
    required: false,
})
@Controller('subscriptions')
@UseGuards(AuthGuard, TenantGuard)
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly plansService: PlansService,
    ) { }

    @Get('active')
    @ApiOperation({ summary: 'Get active subscription and trial status for the current tenant' })
    @ApiResponse({ status: 200, description: 'Active subscription details' })
    async getActive(@TenantId() tenantId: string) {
        const subscription = await this.subscriptionsService.getActive(tenantId);
        let plan: any = null;
        if (subscription.planId) {
            try {
                plan = await this.plansService.getById(subscription.planId);
            } catch {
                // Ignore if plan not found
            }
        }
        return {
            ...subscription,
            plan,
        };
    }

    @Post('select-plan')
    @ApiOperation({ summary: 'Select a plan or upgrade existing subscription for the current tenant' })
    @ApiResponse({ status: 200, description: 'Subscription updated' })
    async selectPlan(
        @TenantId() tenantId: string,
        @Body() dto: SelectPlanDto,
    ) {
        const plan = await this.plansService.getById(dto.planId);
        return this.subscriptionsService.subscribeOrChangePlan(
            tenantId,
            plan,
            dto.billingCycle || 'monthly',
        );
    }
}
