import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMemberRoleDto {
    @ApiProperty({ example: 'manager', description: 'New role ID: manager, cashier, waiter, owner' })
    @IsString()
    @IsNotEmpty()
    roleId: string;
}
