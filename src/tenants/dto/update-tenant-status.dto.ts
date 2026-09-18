import { IsIn, IsString } from 'class-validator';

export class UpdateTenantStatusDto {
    @IsString()
    @IsIn(['active', 'suspended'])
    status: string;
}