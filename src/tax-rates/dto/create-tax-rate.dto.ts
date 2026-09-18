import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaxRateDto {
    @ApiProperty({ example: 'VAT 5%' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 5, description: 'Tax percentage (e.g. 5 for 5%)' })
    @IsNumber()
    @Min(0)
    percentage: number;

    @ApiPropertyOptional({ example: false, default: false, description: 'True if price already includes this tax' })
    @IsBoolean()
    @IsOptional()
    isInclusive?: boolean;

    @ApiPropertyOptional({ example: true, default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
