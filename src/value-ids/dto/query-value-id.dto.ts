import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RarityType } from '../entities/value-id.entity';

export class QueryValueIDsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RarityType)
  rarity?: RarityType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isForSale?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isForRent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'createdAt' | 'viewCount' | 'favoriteCount';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
