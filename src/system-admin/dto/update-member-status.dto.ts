import {
    IsIn,
    IsString,
} from 'class-validator';

export class UpdateMemberStatusDto {
    @IsString()
    @IsIn([
        'active',
        'suspended',
        'inactive',
    ])
    status: string;
}
