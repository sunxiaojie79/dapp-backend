import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ValueID } from '../../value-ids/entities/value-id.entity';
import { Order } from '../../orders/entities/order.entity';

export enum TransactionType {
  PURCHASE = 'purchase', // 购买交易
  SALE = 'sale', // 销售交易
  RENTAL = 'rental', // 租赁交易
  RENTAL_PAYMENT = 'rental_payment', // 租赁费用支付
}

export enum TransactionStatus {
  PENDING = 'pending', // 待处理
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
  REFUNDED = 'refunded', // 已退款
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionHash: string; // 交易哈希（区块链交易ID或内部交易ID）

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number; // 交易金额

  @Column('decimal', { precision: 20, scale: 8 })
  fee: number; // 平台手续费

  @Column('decimal', { precision: 20, scale: 8 })
  netAmount: number; // 净金额（扣除手续费后）

  @Column()
  currency: string; // 支付币种

  @Column()
  fromAddress: string; // 付款地址

  @Column()
  toAddress: string; // 收款地址

  @Column({ nullable: true })
  blockNumber: number; // 区块号（如果是区块链交易）

  @Column({ nullable: true })
  gasUsed: number; // Gas消耗（区块链交易）

  @Column('text', { nullable: true })
  memo: string; // 交易备注

  // 关联订单
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  orderId: number;

  // 关联NFT
  @ManyToOne(() => ValueID)
  @JoinColumn({ name: 'valueIdId' })
  valueID: ValueID;

  @Column()
  valueIdId: number;

  // 买家
  @ManyToOne(() => User, (user) => user.buyTransactions)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  buyerId: number;

  // 卖家
  @ManyToOne(() => User, (user) => user.sellTransactions)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
