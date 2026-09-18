import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SelectPlanDto {
    @ApiProperty({ example: 'growth', description: 'Plan ID to upgrade or subscribe to' })
    @IsString()
    @IsNotEmpty()
    planId: string;

    @ApiPropertyOptional({ enum: ['monthly', 'yearly'], example: 'monthly', default: 'monthly' })
    @IsOptional()
    @IsEnum(['monthly', 'yearly'])
    billingCycle?: 'monthly' | 'yearly';
}
