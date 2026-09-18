import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({ example: 'john@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'Prefers booth seating, allergic to peanuts' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiPropertyOptional({ example: 0, default: 0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    loyaltyPoints?: number;
}
