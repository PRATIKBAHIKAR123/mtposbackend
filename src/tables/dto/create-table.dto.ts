import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
    @ApiProperty({ example: 'Table 1' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Main Hall', default: 'Main' })
    @IsString()
    @IsOptional()
    section?: string;

    @ApiPropertyOptional({ example: 4, default: 4 })
    @IsNumber()
    @IsOptional()
    @Min(1)
    capacity?: number;

    @ApiPropertyOptional({ example: 'vacant', enum: ['vacant', 'occupied', 'reserved', 'billed'], default: 'vacant' })
    @IsString()
    @IsOptional()
    @IsIn(['vacant', 'occupied', 'reserved', 'billed'])
    status?: string;
}
