import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0) price: number;
  @IsNumber() @Min(0) salePrice: number;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) sizes?: string[];
  @IsInt() @Min(0) stock: number;
  @IsOptional() @IsString() season?: string | null;
  @IsOptional() @IsString() version?: string;
  @IsOptional() @IsBoolean() isCustomizable?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() categoryId?: number | null;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
