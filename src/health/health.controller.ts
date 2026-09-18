import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
    constructor(
        private readonly healthService: HealthService,
    ) { }

    @Get()
    async check() {
        try {
            return await this.healthService.check();
        } catch (e: any) {
            return { error: e.message, stack: e.stack };
        }
    }
}