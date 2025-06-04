import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ValueIDsModule } from '../../value-ids/value-ids.module';

@Module({
  imports: [ValueIDsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {} 