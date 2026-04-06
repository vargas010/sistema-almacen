import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  warehouseNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  aisleSection: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  shelfNumber: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}