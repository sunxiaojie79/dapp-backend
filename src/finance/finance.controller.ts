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
import { FinanceService } from './finance.service';
import {
  CreateWalletDto,
  UpdateWalletDto,
  TransferDto,
  WithdrawDto,
  DepositDto,
  QueryFinancialRecordsDto,
} from './dto/finance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ==================== 钱包管理 ====================

  @Post('wallets')
  @UseGuards(JwtAuthGuard)
  createWallet(
    @Body() createWalletDto: CreateWalletDto,
    @CurrentUser() user: any,
  ) {
    return this.financeService.createWallet(user.userId, createWalletDto);
  }

  @Get('wallets')
  @UseGuards(JwtAuthGuard)
  getUserWallets(@CurrentUser() user: any) {
    return this.financeService.getUserWallets(user.userId);
  }

  @Get('wallets/:id')
  @UseGuards(JwtAuthGuard)
  getWallet(@Param('id') id: string) {
    return this.financeService.getWallet(+id);
  }

  @Patch('wallets/:id')
  @UseGuards(JwtAuthGuard)
  updateWallet(
    @Param('id') id: string,
    @Body() updateWalletDto: UpdateWalletDto,
  ) {
    return this.financeService.updateWallet(+id, updateWalletDto);
  }

  // ==================== 余额查询 ====================

  @Get('balance/:currency')
  @UseGuards(JwtAuthGuard)
  getUserBalance(
    @Param('currency') currency: string,
    @CurrentUser() user: any,
  ) {
    return this.financeService.getUserBalance(user.userId, currency);
  }

  // ==================== 转账功能 ====================

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  transfer(@Body() transferDto: TransferDto) {
    return this.financeService.transfer(transferDto);
  }

  // ==================== 提现和充值 ====================

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  withdraw(@Body() withdrawDto: WithdrawDto, @CurrentUser() user: any) {
    return this.financeService.withdraw(user.userId, withdrawDto);
  }

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  deposit(@Body() depositDto: DepositDto, @CurrentUser() user: any) {
    return this.financeService.deposit(user.userId, depositDto);
  }

  // ==================== 财务记录 ====================

  @Get('records')
  @UseGuards(JwtAuthGuard)
  getFinancialRecords(
    @Query() query: QueryFinancialRecordsDto,
    @CurrentUser() user: any,
  ) {
    return this.financeService.getFinancialRecords(user.userId, query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getUserFinancialStats(
    @Query('currency') currency: string,
    @CurrentUser() user: any,
  ) {
    return this.financeService.getUserFinancialStats(user.userId, currency);
  }
}
