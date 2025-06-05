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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
