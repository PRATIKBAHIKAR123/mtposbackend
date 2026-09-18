import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OrderItemDto {
    @ApiProperty({ example: 'menu-item-123' })
    @IsString()
    @IsNotEmpty()
    menuItemId: string;

    @ApiProperty({ example: 'Paneer Butter Masala' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 2, minimum: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 280, minimum: 0 })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ example: 'Half' })
    @IsOptional()
    @IsString()
    selectedVariant?: string;

    @ApiPropertyOptional({ example: ['Extra Butter', 'Spicy'], type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    modifiers?: string[];

    @ApiPropertyOptional({ example: 'Make it spicy with less oil' })
    @IsOptional()
    @IsString()
    notes?: string;
}
