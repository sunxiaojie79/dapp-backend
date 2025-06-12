import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { Wallet, WalletStatus, WalletType } from './entities/wallet.entity';
import {
  FinancialRecord,
  FinancialRecordType,
  FinancialCategory,
} from './entities/financial-record.entity';
import {
  CreateWalletDto,
  UpdateWalletDto,
  CreateFinancialRecordDto,
  TransferDto,
  WithdrawDto,
  DepositDto,
  QueryFinancialRecordsDto,
} from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(FinancialRecord)
    private financialRecordRepository: Repository<FinancialRecord>,
    private dataSource: DataSource,
  ) {}

  // ==================== 钱包管理 ====================

  async createWallet(
    userId: number,
    createWalletDto: CreateWalletDto,
  ): Promise<Wallet> {
    // 检查是否已存在相同地址和币种的钱包
    const existingWallet = await this.walletRepository.findOne({
      where: {
        address: createWalletDto.address,
        currency: createWalletDto.currency,
      },
    });

    if (existingWallet) {
      throw new BadRequestException('该钱包地址和币种组合已存在');
    }

    // 如果设置为默认钱包，先取消其他默认钱包
    if (createWalletDto.isDefault) {
      await this.walletRepository.update(
        { userId, currency: createWalletDto.currency },
        { isDefault: false },
      );
    }

    const wallet = this.walletRepository.create({
      ...createWalletDto,
      userId,
    });

    return this.walletRepository.save(wallet);
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    return this.walletRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async getWallet(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    return wallet;
  }

  async updateWallet(
    id: number,
    updateWalletDto: UpdateWalletDto,
  ): Promise<Wallet> {
    const wallet = await this.getWallet(id);

    // 如果设置为默认钱包，先取消其他默认钱包
    if (updateWalletDto.isDefault) {
      await this.walletRepository.update(
        { userId: wallet.userId, currency: wallet.currency },
        { isDefault: false },
      );
    }

    Object.assign(wallet, updateWalletDto);
    return this.walletRepository.save(wallet);
  }

  async getUserBalance(userId: number, currency: string): Promise<number> {
    const result = await this.walletRepository
      .createQueryBuilder('wallet')
      .select('SUM(wallet.balance)', 'totalBalance')
      .where('wallet.userId = :userId')
      .andWhere('wallet.currency = :currency')
      .andWhere('wallet.status = :status')
      .setParameters({
        userId,
        currency,
        status: WalletStatus.ACTIVE,
      })
      .getRawOne();

    return parseFloat(result.totalBalance) || 0;
  }

  // ==================== 余额管理 ====================

  async addBalance(
    userId: number,
    amount: number,
    currency: string,
    description?: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取或创建默认钱包
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId, currency, isDefault: true },
      });

      if (!wallet) {
        // 创建默认内部钱包
        wallet = queryRunner.manager.create(Wallet, {
          userId,
          currency,
          address: `internal_${userId}_${currency}`,
          type: WalletType.INTERNAL,
          isDefault: true,
          label: '默认钱包',
        });
        wallet = await queryRunner.manager.save(wallet);
      }

      const balanceBefore = wallet.balance;
      wallet.balance += amount;
      await queryRunner.manager.save(wallet);

      // 记录财务流水
      await this.createFinancialRecord(queryRunner, {
        userId,
        type: FinancialRecordType.INCOME,
        category: FinancialCategory.TRADING,
        amount,
        currency,
        description: description || '余额增加',
        balanceBefore,
        balanceAfter: wallet.balance,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('余额更新失败');
    } finally {
      await queryRunner.release();
    }
  }

  async deductBalance(
    userId: number,
    amount: number,
    currency: string,
    description?: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查余额是否足够
      const totalBalance = await this.getUserBalance(userId, currency);
      if (totalBalance < amount) {
        throw new BadRequestException('余额不足');
      }

      // 获取用户的钱包列表，按余额从大到小排序
      const wallets = await queryRunner.manager.find(Wallet, {
        where: { userId, currency, status: WalletStatus.ACTIVE },
        order: { balance: 'DESC' },
      });

      let remainingAmount = amount;

      for (const wallet of wallets) {
        if (remainingAmount <= 0) break;

        const deductFromWallet = Math.min(wallet.balance, remainingAmount);
        if (deductFromWallet > 0) {
          const balanceBefore = wallet.balance;
          wallet.balance -= deductFromWallet;
          await queryRunner.manager.save(wallet);

          // 记录财务流水
          await this.createFinancialRecord(queryRunner, {
            userId,
            type: FinancialRecordType.EXPENSE,
            category: FinancialCategory.TRADING,
            amount: deductFromWallet,
            currency,
            description: description || '余额扣除',
            balanceBefore,
            balanceAfter: wallet.balance,
          });

          remainingAmount -= deductFromWallet;
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== 转账功能 ====================

  async transfer(transferDto: TransferDto): Promise<void> {
    const { fromUserId, toUserId, amount, currency, description } = transferDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 扣除发送方余额
      await this.deductBalance(
        fromUserId,
        amount,
        currency,
        `转账给用户${toUserId}: ${description || ''}`,
      );

      // 增加接收方余额
      await this.addBalance(
        toUserId,
        amount,
        currency,
        `从用户${fromUserId}收到转账: ${description || ''}`,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== 提现和充值 ====================

  async withdraw(userId: number, withdrawDto: WithdrawDto): Promise<void> {
    const { amount, currency, toAddress, description } = withdrawDto;

    // 检查余额
    const balance = await this.getUserBalance(userId, currency);
    if (balance < amount) {
      throw new BadRequestException('余额不足');
    }

    // 扣除余额
    await this.deductBalance(
      userId,
      amount,
      currency,
      `提现到${toAddress}: ${description || ''}`,
    );

    // 这里可以集成实际的区块链提现逻辑
    // 暂时只记录提现请求
    await this.recordTransaction({
      userId,
      type: FinancialRecordType.WITHDRAWAL,
      category: FinancialCategory.TRADING,
      amount,
      currency,
      description: `提现到${toAddress}: ${description || ''}`,
      metadata: JSON.stringify({ toAddress, withdrawDto }),
    });
  }

  async deposit(userId: number, depositDto: DepositDto): Promise<void> {
    const { amount, currency, fromAddress, description, transactionHash } =
      depositDto;

    // 增加余额
    await this.addBalance(
      userId,
      amount,
      currency,
      `从${fromAddress}充值: ${description || ''}`,
    );

    // 记录充值记录
    await this.recordTransaction({
      userId,
      type: FinancialRecordType.DEPOSIT,
      category: FinancialCategory.TRADING,
      amount,
      currency,
      description: `从${fromAddress}充值: ${description || ''}`,
      metadata: JSON.stringify({ fromAddress, transactionHash, depositDto }),
    });
  }

  // ==================== 财务记录 ====================

  async recordTransaction(
    createRecordDto: CreateFinancialRecordDto,
  ): Promise<FinancialRecord> {
    const record = this.financialRecordRepository.create(createRecordDto);
    return this.financialRecordRepository.save(record);
  }

  async recordPlatformFee(feeData: {
    amount: number;
    currency: string;
    description: string;
    transactionId?: number;
  }): Promise<FinancialRecord> {
    return this.recordTransaction({
      userId: 0, // 平台用户ID设为0
      type: FinancialRecordType.FEE,
      category: FinancialCategory.PLATFORM_FEE,
      ...feeData,
    });
  }

  async addPlatformRevenue(amount: number, currency: string): Promise<void> {
    // 这里可以将平台收益记录到专门的平台账户
    // 暂时只记录收益流水
    await this.recordTransaction({
      userId: 0, // 平台用户ID
      type: FinancialRecordType.INCOME,
      category: FinancialCategory.PLATFORM_FEE,
      amount,
      currency,
      description: '平台手续费收入',
    });
  }

  async getFinancialRecords(
    userId: number,
    query: QueryFinancialRecordsDto,
  ): Promise<{
    data: FinancialRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.financialRecordRepository
      .createQueryBuilder('record')
      .where('record.userId = :userId', { userId });

    // 应用过滤器
    if (filters.type) {
      queryBuilder.andWhere('record.type = :type', { type: filters.type });
    }

    if (filters.category) {
      queryBuilder.andWhere('record.category = :category', {
        category: filters.category,
      });
    }

    if (filters.currency) {
      queryBuilder.andWhere('record.currency = :currency', {
        currency: filters.currency,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('record.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('record.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // 排序
    queryBuilder.orderBy(`record.${sortBy}`, sortOrder);

    // 分页
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async getUserFinancialStats(userId: number, currency?: string) {
    const query = this.financialRecordRepository
      .createQueryBuilder('record')
      .select([
        'SUM(CASE WHEN record.type = "income" THEN record.amount ELSE 0 END) as totalIncome',
        'SUM(CASE WHEN record.type = "expense" THEN record.amount ELSE 0 END) as totalExpense',
        'SUM(CASE WHEN record.type = "fee" THEN record.amount ELSE 0 END) as totalFees',
        'COUNT(*) as totalRecords',
      ])
      .where('record.userId = :userId', { userId });

    if (currency) {
      query.andWhere('record.currency = :currency', { currency });
    }

    const stats = await query.getRawOne();

    return {
      totalIncome: parseFloat(stats.totalIncome) || 0,
      totalExpense: parseFloat(stats.totalExpense) || 0,
      totalFees: parseFloat(stats.totalFees) || 0,
      totalRecords: parseInt(stats.totalRecords) || 0,
      netAmount:
        (parseFloat(stats.totalIncome) || 0) -
        (parseFloat(stats.totalExpense) || 0),
    };
  }

  private async createFinancialRecord(
    queryRunner: QueryRunner,
    recordData: Partial<FinancialRecord>,
  ): Promise<FinancialRecord> {
    const record = queryRunner.manager.create(FinancialRecord, recordData);
    return queryRunner.manager.save(record);
  }
}
