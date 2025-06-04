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
import { User } from '../../../user/entities/user.entity';
import { Order } from '../../../orders/entities/order.entity';
import { UserFavorite } from '../../common/entities/user-favorite.entity';
import { NFTAttribute } from './nft-attribute.entity';

export enum RarityType {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Entity('value_ids')
export class ValueID {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  image: string;

  @Column({ unique: true })
  tokenId: string;

  @Column()
  indexNumber: string;

  @Column('decimal', { precision: 20, scale: 8 })
  price: number;

  @Column()
  paymentAddress: string;

  @Column()
  paymentCurrency: string;

  @Column({
    type: 'enum',
    enum: RarityType,
    default: RarityType.COMMON,
  })
  rarity: RarityType;

  @Column({ default: false })
  isForSale: boolean;

  @Column({ default: false })
  isForRent: boolean;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  rentalPrice: number;

  @Column({ nullable: true })
  rentalPeriod: number; // 租赁期限（天）

  @Column({ nullable: true })
  rentalEndTime: Date; // 租赁结束时间

  @Column({ default: 0 })
  viewCount: number; // 浏览次数

  @Column({ default: 0 })
  favoriteCount: number; // 收藏次数

  // 关系
  @ManyToOne(() => User, (user) => user.ownedValueIDs)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.rentedValueIDs, { nullable: true })
  @JoinColumn({ name: 'renterId' })
  renter: User;

  @Column({ nullable: true })
  renterId: number;

  @OneToMany(() => Order, (order) => order.valueID)
  orders: Order[];

  @OneToMany(() => UserFavorite, (favorite) => favorite.valueID)
  favorites: UserFavorite[];

  @OneToMany(() => NFTAttribute, (attribute) => attribute.valueID)
  attributes: NFTAttribute[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}