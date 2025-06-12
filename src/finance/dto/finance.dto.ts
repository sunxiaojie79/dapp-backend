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
  FinancialRecordType,
  FinancialCategory,
} from '../entities/financial-record.entity';
import { WalletType, WalletStatus } from '../entities/wallet.entity';

export class CreateFinancialRecordDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsEnum(FinancialRecordType)
  type: FinancialRecordType;

  @IsEnum(FinancialCategory)
  category: FinancialCategory;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  transactionId?: number;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @Type(() => Boolean)
  isDefault?: boolean;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @Type(() => Boolean)
  isDefault?: boolean;
}

export class TransferDto {
  @IsNumber()
  @IsPositive()
  fromUserId: number;

  @IsNumber()
  @IsPositive()
  toUserId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  toAddress: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DepositDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class QueryFinancialRecordsDto {
  @IsOptional()
  @IsEnum(FinancialRecordType)
  type?: FinancialRecordType;

  @IsOptional()
  @IsEnum(FinancialCategory)
  category?: FinancialCategory;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

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
