import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto.js';

export class CreateOrderDto {
    @ApiProperty({
        enum: ['dine-in', 'takeaway', 'delivery'],
        example: 'dine-in',
    })
    @IsEnum(['dine-in', 'takeaway', 'delivery'])
    @IsNotEmpty()
    orderType: 'dine-in' | 'takeaway' | 'delivery';

    @ApiPropertyOptional({ example: 'table-uuid-123' })
    @IsOptional()
    @IsString()
    tableId?: string;

    @ApiPropertyOptional({ example: 'customer-uuid-456' })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiPropertyOptional({ example: 'WELCOME10' })
    @IsOptional()
    @IsString()
    discountCode?: string;

    @ApiPropertyOptional({ example: 50, minimum: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @ApiPropertyOptional({ example: 5, description: 'Tax percentage, e.g. 5 for 5%' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    taxRate?: number;

    @ApiPropertyOptional({ example: 'Table near window, customer requested prompt serving' })
    @IsOptional()
    @IsString()
    notes?: string;
}
