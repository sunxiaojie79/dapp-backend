import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ValueID } from '../../value-ids/entities/value-id.entity';

@Entity('user_favorites')
@Unique(['userId', 'valueIdId'])
export class UserFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => ValueID, (valueID) => valueID.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'valueIdId' })
  valueID: ValueID;

  @Column()
  valueIdId: number;

  @CreateDateColumn()
  createdAt: Date;
}
