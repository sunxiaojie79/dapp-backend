import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  IsArray,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RarityType } from '../entities/value-id.entity';

export class NFTAttributeDto {
  @IsString()
  @IsNotEmpty()
  traitType: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rarity?: number;
}

export class CreateValueIDDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  tokenId: string;

  @IsString()
  @IsNotEmpty()
  indexNumber: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  paymentAddress: string;

  @IsString()
  @IsNotEmpty()
  paymentCurrency: string;

  @IsEnum(RarityType)
  @IsOptional()
  rarity?: RarityType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rentalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rentalPeriod?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NFTAttributeDto)
  attributes?: NFTAttributeDto[];
}

export class UpdateValueIDDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  image?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentAddress?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentCurrency?: string;

  @IsOptional()
  @IsEnum(RarityType)
  rarity?: RarityType;

  @IsOptional()
  @IsBoolean()
  isForSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isForRent?: boolean;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rentalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rentalPeriod?: number;
}

export class ListForSaleDto {
  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  paymentAddress: string;

  @IsString()
  @IsNotEmpty()
  paymentCurrency: string;
}

export class ListForRentDto {
  @IsNumber()
  @IsPositive()
  rentalPrice: number;

  @IsNumber()
  @Min(1)
  rentalPeriod: number;

  @IsString()
  @IsNotEmpty()
  paymentAddress: string;

  @IsString()
  @IsNotEmpty()
  paymentCurrency: string;
}
