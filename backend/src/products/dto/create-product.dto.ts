import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  salePrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  purchasePrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minStock: number;

  @IsUUID()
  @IsOptional()
  locationId: string;

  @IsUUID()
  @IsOptional()
  supplierId: string;
}