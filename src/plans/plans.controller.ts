import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';

import {
    ApiTags,
} from '@nestjs/swagger';

import { PlansService } from './plans.service.js';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
    constructor(
        private readonly plansService: PlansService,
    ) { }

    @Get()
    async getAll() {
        return this.plansService.getAll();
    }

    @Get(':id')
    async getById(
        @Param('id') planId: string,
    ) {
        return this.plansService.getById(planId);
    }
}