import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvailabilityDto {
    @ApiProperty({ example: false, description: 'Mark item in-stock (true) or 86ed/out-of-stock (false)' })
    @IsBoolean()
    @IsNotEmpty()
    isAvailable: boolean;
}
