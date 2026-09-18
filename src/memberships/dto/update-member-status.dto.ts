import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberStatusDto {
    @ApiProperty({
        enum: ['active', 'suspended', 'inactive'],
        example: 'suspended',
        description: 'Membership status',
    })
    @IsEnum(['active', 'suspended', 'inactive'])
    @IsNotEmpty()
    status: 'active' | 'suspended' | 'inactive';
}
