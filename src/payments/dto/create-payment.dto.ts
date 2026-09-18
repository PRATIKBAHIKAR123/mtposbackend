import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty({ example: 'order-uuid-123' })
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @ApiProperty({ example: 450, minimum: 0.01 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({
        enum: ['cash', 'card', 'upi', 'split'],
        example: 'upi',
    })
    @IsEnum(['cash', 'card', 'upi', 'split'])
    @IsNotEmpty()
    method: 'cash' | 'card' | 'upi' | 'split';

    @ApiPropertyOptional({ example: 'UPI-REF-2026091801' })
    @IsOptional()
    @IsString()
    transactionRef?: string;

    @ApiPropertyOptional({ example: 'Settled by customer at Counter 1' })
    @IsOptional()
    @IsString()
    notes?: string;
}
