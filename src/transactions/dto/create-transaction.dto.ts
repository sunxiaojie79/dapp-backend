import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @Min(0)
  fee: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @IsString()
  @IsNotEmpty()
  toAddress: string;

  @IsNumber()
  @IsPositive()
  valueIdId: number;

  @IsNumber()
  @IsPositive()
  buyerId: number;

  @IsNumber()
  @IsPositive()
  sellerId: number;

  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  blockNumber?: number;

  @IsOptional()
  @IsNumber()
  gasUsed?: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsNumber()
  blockNumber?: number;

  @IsOptional()
  @IsNumber()
  gasUsed?: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

export class QueryTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsNumber()
  userId?: number; // 查询特定用户的交易

  @IsOptional()
  @IsNumber()
  valueIdId?: number; // 查询特定NFT的交易

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'amount';

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
  limit?: number = 10;
}
