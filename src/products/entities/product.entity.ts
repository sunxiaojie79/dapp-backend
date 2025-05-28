import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  image: string;

  @Column()
  indexNumber: string;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @ManyToOne(() => User, (user) => user.ownedProducts)
  owner: User;

  @ManyToOne(() => User, (user) => user.rentedProducts)
  renter: User;

  @Column()
  paymentAddress: string;

  @Column()
  paymentCurrency: string;

  @Column({
    type: 'enum',
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  })
  rarity: string;

  @Column()
  isForSale: boolean;

  @Column()
  isForRent: boolean;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  rentalPrice: number;

  @Column({ nullable: true })
  rentalPeriod: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
