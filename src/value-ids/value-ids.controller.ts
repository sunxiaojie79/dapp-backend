import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ValueIDsService } from './value-ids.service';
import { CreateValueIDDto, UpdateValueIDDto, ListForSaleDto, ListForRentDto } from './dto/create-value-id.dto';
import { QueryValueIDsDto } from './dto/query-value-id.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('value-ids')
export class ValueIDsController {
  constructor(private readonly valueIDsService: ValueIDsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createValueIDDto: CreateValueIDDto, @CurrentUser() user: any) {
    return this.valueIDsService.create(createValueIDDto, user.userId);
  }

  @Get()
  findAll(@Query() query: QueryValueIDsDto) {
    return this.valueIDsService.findAll(query);
  }

  @Get('recommendations')
  getRecommendations(@Query('limit') limit?: number) {
    return this.valueIDsService.getRecommendations(limit);
  }

  @Get('latest')
  getLatest(@Query('limit') limit?: number) {
    return this.valueIDsService.getLatest(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.valueIDsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateValueIDDto: UpdateValueIDDto,
    @CurrentUser() user: any,
  ) {
    return this.valueIDsService.update(+id, updateValueIDDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.valueIDsService.remove(+id, user.userId);
  }

  @Post(':id/list-for-sale')
  @UseGuards(JwtAuthGuard)
  listForSale(
    @Param('id') id: string,
    @Body() listForSaleDto: ListForSaleDto,
    @CurrentUser() user: any,
  ) {
    return this.valueIDsService.listForSale(+id, listForSaleDto, user.userId);
  }

  @Post(':id/list-for-rent')
  @UseGuards(JwtAuthGuard)
  listForRent(
    @Param('id') id: string,
    @Body() listForRentDto: ListForRentDto,
    @CurrentUser() user: any,
  ) {
    return this.valueIDsService.listForRent(+id, listForRentDto, user.userId);
  }

  @Post(':id/cancel-sale')
  @UseGuards(JwtAuthGuard)
  cancelSale(@Param('id') id: string, @CurrentUser() user: any) {
    return this.valueIDsService.cancelSale(+id, user.userId);
  }

  @Post(':id/cancel-rent')
  @UseGuards(JwtAuthGuard)
  cancelRent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.valueIDsService.cancelRent(+id, user.userId);
  }

  @Post(':id/favorites')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  addToFavorites(@Param('id') id: string, @CurrentUser() user: any) {
    return this.valueIDsService.addToFavorites(+id, user.userId);
  }

  @Delete(':id/favorites')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromFavorites(@Param('id') id: string, @CurrentUser() user: any) {
    return this.valueIDsService.removeFromFavorites(+id, user.userId);
  }
}