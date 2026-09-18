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
    ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
    constructor(
        private readonly applicationsService: ApplicationsService,
    ) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(
        @CurrentUser() user: any,
        @Body() dto: CreateApplicationDto,
    ) {
        return this.applicationsService.create(
            user.uid,
            dto,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getById(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        return this.applicationsService.getById(
            id,
            user.uid,
        );
    }
}