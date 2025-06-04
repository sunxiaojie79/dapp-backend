import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ValueID } from './value-id.entity';

@Entity('nft_attributes')
export class NFTAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  traitType: string; // 属性类型，如 "背景", "眼睛", "帽子"

  @Column()
  value: string; // 属性值，如 "蓝色", "激光眼", "牛仔帽"

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  rarity: number; // 稀有度百分比

  @ManyToOne(() => ValueID, (valueID) => valueID.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'valueIdId' })
  valueID: ValueID;

  @Column()
  valueIdId: number;
}