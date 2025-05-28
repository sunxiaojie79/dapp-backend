import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsBoolean()
  isForSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isForRent?: boolean;
}
