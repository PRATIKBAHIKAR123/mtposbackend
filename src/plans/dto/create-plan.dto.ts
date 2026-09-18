import {
    IsBoolean,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreatePlanDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    @IsOptional()
    price?: {
        monthly: number;
        yearly: number;
        currency: string;
    };

    @IsObject()
    @IsOptional()
    trial?: {
        enabled: boolean;
        days: number;
    };

    @IsObject()
    @IsOptional()
    limits?: {
        users: number;
        menuItems: number;
        categories: number;
        tables: number;
        printers: number;
        branches: number;
    };

    @IsObject()
    @IsOptional()
    features?: Record<string, boolean>;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
