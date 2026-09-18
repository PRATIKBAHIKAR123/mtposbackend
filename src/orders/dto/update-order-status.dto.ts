import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
    @ApiProperty({
        enum: ['placed', 'preparing', 'ready', 'completed', 'cancelled'],
        example: 'preparing',
    })
    @IsEnum(['placed', 'preparing', 'ready', 'completed', 'cancelled'])
    @IsNotEmpty()
    status: 'placed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}
