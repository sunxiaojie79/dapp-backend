import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ValueID } from '../../value-ids/entities/value-id.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell',
  RENT = 'rent',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  rentalPeriod: number; // 租赁期限（仅租赁订单）

  @Column({ nullable: true })
  rentalStartTime: Date; // 租赁开始时间

  @Column({ nullable: true })
  rentalEndTime: Date; // 租赁结束时间

  // 关系
  @ManyToOne(() => ValueID, (valueID) => valueID.orders)
  @JoinColumn({ name: 'valueIdId' })
  valueID: ValueID;

  @Column()
  valueIdId: number;

  @ManyToOne(() => User, (user) => user.buyOrders, { nullable: true })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column({ nullable: true })
  buyerId: number;

  @ManyToOne(() => User, (user) => user.sellOrders, { nullable: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({ nullable: true })
  sellerId: number;

  @ManyToOne(() => User, (user) => user.rentalOrders, { nullable: true })
  @JoinColumn({ name: 'renterId' })
  renter: User;

  @Column({ nullable: true })
  renterId: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @UpdateDateColumn()
  updatedAt: Date;
}
