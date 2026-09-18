import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreatePrinterDto {
    @ApiProperty({ example: 'Kitchen KOT Printer' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        enum: ['kot', 'receipt', 'bar'],
        example: 'kot',
    })
    @IsEnum(['kot', 'receipt', 'bar'])
    @IsNotEmpty()
    type: 'kot' | 'receipt' | 'bar';

    @ApiProperty({
        enum: ['network', 'bluetooth', 'usb'],
        example: 'network',
    })
    @IsEnum(['network', 'bluetooth', 'usb'])
    @IsNotEmpty()
    connectionType: 'network' | 'bluetooth' | 'usb';

    @ApiPropertyOptional({ example: '192.168.1.200' })
    @IsOptional()
    @IsString()
    ipAddress?: string;

    @ApiPropertyOptional({ example: 9100 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    port?: number;

    @ApiPropertyOptional({ example: 80, description: 'Paper width in mm (58 or 80)' })
    @IsOptional()
    @IsNumber()
    paperWidth?: number;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
