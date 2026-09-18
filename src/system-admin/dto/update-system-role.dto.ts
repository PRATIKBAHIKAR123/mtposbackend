import {
    IsIn,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class UpdateSystemRoleDto {
    @IsString()
    @IsNotEmpty()
    @IsIn([
        'admin',
        'user',
    ])
    systemRole: string;
}
