import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OnboardTenantDto {
    @ApiProperty({ example: 'Urban Bistro', description: 'Restaurant or business name' })
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiPropertyOptional({ example: 'restaurant', description: 'Type: restaurant, cafe, bar, qsr' })
    @IsOptional()
    @IsString()
    businessType?: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    ownerName?: string;

    @ApiPropertyOptional({ example: '+919876543210' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'INR', default: 'INR' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiProperty({ example: 'growth', description: 'Plan ID selected from /api/v1/plans' })
    @IsString()
    @IsNotEmpty()
    planId: string;

    @ApiPropertyOptional({ example: true, default: true, description: 'Request 14-day free trial on the selected plan' })
    @IsOptional()
    @IsBoolean()
    trialRequested?: boolean;
}
