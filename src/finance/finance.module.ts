import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Wallet } from './entities/wallet.entity';
import { FinancialRecord } from './entities/financial-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, FinancialRecord])],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService, TypeOrmModule],
})
export class FinanceModule {}
