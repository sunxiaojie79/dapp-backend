import { Injectable } from '@nestjs/common';
import { ValueIDsService } from '../../value-ids/value-ids.service';
import { SearchDto } from './dto/search.dto';
import { ValueID } from '../../value-ids/entities/value-id.entity';

@Injectable()
export class SearchService {
  constructor(private readonly valueIDsService: ValueIDsService) {}

  async search(searchDto: SearchDto): Promise<{ data: ValueID[]; total: number; page: number; limit: number }> {
    const { q, ...filters } = searchDto;
    
    // 将搜索关键词映射到name过滤器
    const queryFilters = {
      ...filters,
      ...(q && { name: q }),
    };

    return this.valueIDsService.findAll(queryFilters);
  }

  async getRecommendations(limit: number = 10): Promise<ValueID[]> {
    return this.valueIDsService.getRecommendations(limit);
  }

  async getLatest(limit: number = 10): Promise<ValueID[]> {
    return this.valueIDsService.getLatest(limit);
  }

  async getTrending(limit: number = 10): Promise<ValueID[]> {
    // 获取热门的NFT（基于浏览量和收藏量）
    return this.valueIDsService.getRecommendations(limit);
  }
} 