import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    businessName: string;

    @IsString()
    @IsNotEmpty()
    businessType: string;

    @IsString()
    @IsNotEmpty()
    ownerName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    requestedPlanId: string;

    @IsBoolean()
    @IsOptional()
    trialRequested?: boolean;
}