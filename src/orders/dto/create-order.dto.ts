import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { OrderType } from '../entities/order.entity';

export class CreateOrderDto {
  @IsEnum(OrderType)
  type: OrderType;

  @IsNumber()
  @IsPositive()
  valueIdId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rentalPeriod?: number; // 租赁期限（仅租赁订单需要）
}

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rentalPeriod?: number;
}

export class QueryOrdersDto {
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsNumber()
  valueIdId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number; // 筛选特定用户的订单

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'amount';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
