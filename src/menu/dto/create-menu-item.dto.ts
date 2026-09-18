import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuItemVariantDto {
    @ApiProperty({ example: 'Large' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 12.99 })
    @IsNumber()
    @Min(0)
    price: number;
}

export class MenuItemModifierDto {
    @ApiProperty({ example: 'Extra Cheese' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 1.5 })
    @IsNumber()
    @Min(0)
    price: number;
}

export class CreateMenuItemDto {
    @ApiProperty({ example: 'Classic Cheeseburger' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'cat_burgers_123' })
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiPropertyOptional({ example: 'Angus beef patty with cheddar cheese and special sauce' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 9.99 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 4.5 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    costPrice?: number;

    @ApiPropertyOptional({ example: 'https://example.com/burger.jpg' })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({ example: 'BURGER-001' })
    @IsString()
    @IsOptional()
    sku?: string;

    @ApiPropertyOptional({ example: '890123456789' })
    @IsString()
    @IsOptional()
    barcode?: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @ApiPropertyOptional({ type: [MenuItemVariantDto] })
    @IsArray()
    @IsOptional()
    variants?: MenuItemVariantDto[];

    @ApiPropertyOptional({ type: [MenuItemModifierDto] })
    @IsArray()
    @IsOptional()
    modifiers?: MenuItemModifierDto[];

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    sortOrder?: number;
}
