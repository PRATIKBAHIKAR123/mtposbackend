import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTableStatusDto {
    @ApiProperty({ example: 'occupied', enum: ['vacant', 'occupied', 'reserved', 'billed'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['vacant', 'occupied', 'reserved', 'billed'])
    status: string;

    @ApiPropertyOptional({ example: 'order_123', description: 'Associated order ID if occupied' })
    @IsString()
    @IsOptional()
    currentOrderId?: string | null;
}
