import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  createTime: Date;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @ManyToOne(() => User, (user) => user.rentalOrders)
  renter: User;

  @ManyToOne(() => User, (user) => user.saleOrders)
  seller: User;
}
