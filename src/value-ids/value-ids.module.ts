import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValueIDsService } from './value-ids.service';
import { ValueIDsController } from './value-ids.controller';
import { ValueID } from './entities/value-id.entity';
import { NFTAttribute } from './entities/nft-attribute.entity';
import { UserFavorite } from '../modules/common/entities/user-favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValueID, NFTAttribute, UserFavorite])],
  controllers: [ValueIDsController],
  providers: [ValueIDsService],
  exports: [ValueIDsService],
})
export class ValueIDsModule {} 