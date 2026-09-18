import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Main Course' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Signature entrees and savory dishes' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'utensils' })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    sortOrder?: number;

    @ApiPropertyOptional({ example: true, default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
