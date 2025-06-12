import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum FinancialRecordType {
  INCOME = 'income', // 收入
  EXPENSE = 'expense', // 支出
  FEE = 'fee', // 手续费
  COMMISSION = 'commission', // 佣金
  REFUND = 'refund', // 退款
  WITHDRAWAL = 'withdrawal', // 提现
  DEPOSIT = 'deposit', // 充值
}

export enum FinancialCategory {
  TRADING = 'trading', // 交易
  RENTAL = 'rental', // 租赁
  PLATFORM_FEE = 'platform_fee', // 平台手续费
  GAS_FEE = 'gas_fee', // Gas费
  ROYALTY = 'royalty', // 版税
  REWARD = 'reward', // 奖励
  PENALTY = 'penalty', // 罚金
}

@Entity('financial_records')
export class FinancialRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: FinancialRecordType,
  })
  type: FinancialRecordType;

  @Column({
    type: 'enum',
    enum: FinancialCategory,
  })
  category: FinancialCategory;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number; // 金额

  @Column()
  currency: string; // 币种

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  balanceBefore: number; // 变更前余额

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  balanceAfter: number; // 变更后余额

  @Column('text', { nullable: true })
  description: string; // 描述

  @Column('text', { nullable: true })
  metadata: string; // 额外元数据（JSON格式）

  // 关联用户
  @ManyToOne(() => User, (user) => user.financialRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // 关联交易（可选）
  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ nullable: true })
  transactionId: number;

  @CreateDateColumn()
  createdAt: Date;
}
