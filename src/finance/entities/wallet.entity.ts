import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'wallet_connect',
  COINBASE = 'coinbase',
  INTERNAL = 'internal', // 平台内部钱包
}

export enum WalletStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FROZEN = 'frozen',
}

@Entity('wallets')
@Unique(['address', 'currency'])
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string; // 钱包地址

  @Column()
  currency: string; // 币种

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  balance: number; // 余额

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  frozenBalance: number; // 冻结余额

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.INTERNAL,
  })
  type: WalletType;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @Column({ default: true })
  isDefault: boolean; // 是否为默认钱包

  @Column({ nullable: true })
  label: string; // 钱包标签/备注

  // 关联用户
  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
