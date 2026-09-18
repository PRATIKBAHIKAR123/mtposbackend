import {
    IsIn,
    IsString,
} from 'class-validator';

export class UpdateUserStatusDto {
    @IsString()
    @IsIn([
        'active',
        'suspended',
        'inactive',
    ])
    status: string;
}
