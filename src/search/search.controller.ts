import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('value-ids')
  searchValueIDs(@Query() searchDto: SearchDto) {
    return this.searchService.search(searchDto);
  }

  @Get('recommendations')
  getRecommendations(@Query('limit') limit?: number) {
    return this.searchService.getRecommendations(limit);
  }

  @Get('latest')
  getLatest(@Query('limit') limit?: number) {
    return this.searchService.getLatest(limit);
  }

  @Get('trending')
  getTrending(@Query('limit') limit?: number) {
    return this.searchService.getTrending(limit);
  }
} 