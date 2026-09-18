import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
    @ApiProperty({ example: 'user-uid-123', description: 'Firebase User UID of staff member' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ example: 'cashier', description: 'Role ID: manager, cashier, waiter' })
    @IsString()
    @IsNotEmpty()
    roleId: string;
}
