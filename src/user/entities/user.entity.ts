// src/users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @Column()
  username: string;

  @Column()
  avatar: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Product, (product) => product.owner)
  ownedProducts: Product[];

  @OneToMany(() => Product, (product) => product.renter)
  rentedProducts: Product[];

  @OneToMany(() => Order, (order) => order.renter)
  rentalOrders: Order[];

  @OneToMany(() => Order, (order) => order.seller)
  saleOrders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
