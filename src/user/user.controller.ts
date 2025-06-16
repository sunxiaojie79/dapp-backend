import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get(':id/profile')
  async getUserProfile(
    @Param('id') id: string,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getUserProfileWithRelations(+id);
  }

  @Get('address/:address/profile')
  async getUserProfileByAddress(
    @Param('address') address: string,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getUserProfileByAddressWithRelations(address);
  }

  @Get(':id/profile/selective')
  async getUserProfileWithSelectedRelations(
    @Param('id') id: string,
    @Query('relations') relations?: string,
  ) {
    const relationArray = relations ? relations.split(',') : undefined;
    return this.userService.findOneWithSelectedRelations(+id, relationArray);
  }

  // 获取用户拥有的NFT
  @Get(':id/owned-value-ids')
  async getUserOwnedValueIDs(@Param('id') id: string) {
    return this.userService.findOneWithSelectedRelations(+id, [
      'ownedValueIDs',
    ]);
  }

  // 获取用户租赁的NFT
  @Get(':id/rented-value-ids')
  async getUserRentedValueIDs(@Param('id') id: string) {
    return this.userService.findOneWithSelectedRelations(+id, [
      'rentedValueIDs',
    ]);
  }

  // 获取用户的订单
  @Get(':id/orders')
  async getUserOrders(@Param('id') id: string) {
    return this.userService.findOneWithSelectedRelations(+id, [
      'buyOrders',
      'sellOrders',
      'rentalOrders',
    ]);
  }

  // 获取用户的收藏
  @Get(':id/favorites')
  async getUserFavorites(@Param('id') id: string) {
    return this.userService.findOneWithSelectedRelations(+id, [
      'favorites',
      'favorites.valueID',
    ]);
  }

  // 获取用户的交易记录
  @Get(':id/transactions')
  async getUserTransactions(@Param('id') id: string) {
    return this.userService.findOneWithSelectedRelations(+id, [
      'buyTransactions',
      'sellTransactions',
    ]);
  }

  // 获取用户的财务记录和钱包
  @Get(':id/finance')
  async getUserFinance(@Param('id') id: string) {
    return this.userService.findOneWithSelectedRelations(+id, [
      'financialRecords',
      'wallets',
    ]);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
