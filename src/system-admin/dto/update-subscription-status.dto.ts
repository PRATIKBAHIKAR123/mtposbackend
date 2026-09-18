import {
    IsIn,
    IsString,
} from 'class-validator';

export class UpdateSubscriptionStatusDto {
    @IsString()
    @IsIn([
        'trialing',
        'active',
        'expired',
        'cancelled',
        'suspended',
    ])
    status: string;
}
