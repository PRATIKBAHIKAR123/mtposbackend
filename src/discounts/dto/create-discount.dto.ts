import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiscountDto {
    @ApiProperty({ example: '10% Weekend Special' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'percentage', enum: ['percentage', 'fixed'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['percentage', 'fixed'])
    type: 'percentage' | 'fixed';

    @ApiProperty({ example: 10, description: 'Percentage (e.g. 10 for 10%) or fixed currency amount (e.g. 5 for $5 off)' })
    @IsNumber()
    @Min(0)
    value: number;

    @ApiPropertyOptional({ example: 'WEEKEND10', description: 'Coupon code for cashier or customer' })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({ example: 25, default: 0, description: 'Minimum order subtotal to qualify' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    minOrderAmount?: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    isActive?: boolean;
}
