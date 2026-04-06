import { IsNumber, IsNotEmpty, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  operation: 'add' | 'subtract';
}