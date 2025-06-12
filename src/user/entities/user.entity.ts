// src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ValueID } from '../../value-ids/entities/value-id.entity';
import { UserFavorite } from '../../common/entities/user-favorite.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { FinancialRecord } from '../../finance/entities/financial-record.entity';
import { Wallet } from '../../finance/entities/wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @Column()
  username: string;

  @Column({ default: '' })
  avatar: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  balance: number;

  @Column({ select: false })
  password: string;

  @OneToMany(() => ValueID, (valueID) => valueID.owner)
  ownedValueIDs: ValueID[];

  @OneToMany(() => ValueID, (valueID) => valueID.renter)
  rentedValueIDs: ValueID[];

  @OneToMany(() => Order, (order) => order.buyer)
  buyOrders: Order[];

  @OneToMany(() => Order, (order) => order.seller)
  sellOrders: Order[];

  @OneToMany(() => Order, (order) => order.renter)
  rentalOrders: Order[];

  @OneToMany(() => UserFavorite, (favorite) => favorite.user)
  favorites: UserFavorite[];

  @OneToMany(() => Transaction, (transaction) => transaction.buyer)
  buyTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.seller)
  sellTransactions: Transaction[];

  @OneToMany(() => FinancialRecord, (record) => record.user)
  financialRecords: FinancialRecord[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
