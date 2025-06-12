import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  QueryTransactionsDto,
} from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: QueryTransactionsDto, @CurrentUser() user: any) {
    // 默认只返回当前用户相关的交易
    return this.transactionsService.findAll({ ...query, userId: user.userId });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getUserStats(@CurrentUser() user: any) {
    return this.transactionsService.getUserTransactionStats(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  confirm(@Param('id') id: string) {
    return this.transactionsService.confirmTransaction(+id);
  }

  @Post(':id/fail')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  fail(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.transactionsService.failTransaction(+id, reason);
  }
}
