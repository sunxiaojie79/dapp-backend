import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  QueryTransactionsDto,
} from './dto/create-transaction.dto';
import { FinanceService } from '../finance/finance.service';
import { v4 as uuidv4 } from 'uuid';
import { FinancialRecordType } from 'src/finance/entities/financial-record.entity';
import { FinancialCategory } from 'src/finance/entities/financial-record.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private financeService: FinanceService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { amount, fee, ...transactionData } = createTransactionDto;

    // 计算净金额
    const netAmount = amount - fee;

    if (netAmount <= 0) {
      throw new BadRequestException('净金额必须大于0');
    }

    // 如果没有提供交易哈希，生成一个内部交易ID
    const transactionHash =
      createTransactionDto.transactionHash ||
      `internal_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // 创建交易记录
    const transaction = this.transactionRepository.create({
      ...transactionData,
      transactionHash,
      amount,
      fee,
      netAmount,
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // 记录财务流水
    await this.recordFinancialFlow(savedTransaction);

    return this.findOne(savedTransaction.id);
  }

  async findAll(query: QueryTransactionsDto): Promise<{
    data: Transaction[];
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

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.buyer', 'buyer')
      .leftJoinAndSelect('transaction.seller', 'seller')
      .leftJoinAndSelect('transaction.valueID', 'valueID')
      .leftJoinAndSelect('transaction.order', 'order');

    // 应用过滤器
    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: filters.status,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere(
        '(transaction.buyerId = :userId OR transaction.sellerId = :userId)',
        { userId: filters.userId },
      );
    }

    if (filters.valueIdId) {
      queryBuilder.andWhere('transaction.valueIdId = :valueIdId', {
        valueIdId: filters.valueIdId,
      });
    }

    if (filters.currency) {
      queryBuilder.andWhere('transaction.currency = :currency', {
        currency: filters.currency,
      });
    }

    // 排序
    queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder);

    // 分页
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller', 'valueID', 'order'],
    });

    if (!transaction) {
      throw new NotFoundException('交易记录不存在');
    }

    return transaction;
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    Object.assign(transaction, updateTransactionDto);
    await this.transactionRepository.save(transaction);

    return this.findOne(id);
  }

  async confirmTransaction(id: number): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('只能确认待处理状态的交易');
    }

    transaction.status = TransactionStatus.COMPLETED;
    await this.transactionRepository.save(transaction);

    // 处理资金流动
    await this.processPayment(transaction);

    return transaction;
  }

  async failTransaction(id: number, reason?: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('只能标记待处理状态的交易为失败');
    }

    transaction.status = TransactionStatus.FAILED;
    if (reason) {
      transaction.memo = `${transaction.memo || ''}\n失败原因: ${reason}`;
    }

    await this.transactionRepository.save(transaction);

    return transaction;
  }

  async getUserTransactionStats(userId: number) {
    const stats = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'COUNT(*) as totalTransactions',
        'SUM(CASE WHEN transaction.buyerId = :userId THEN transaction.amount ELSE 0 END) as totalPurchased',
        'SUM(CASE WHEN transaction.sellerId = :userId THEN transaction.netAmount ELSE 0 END) as totalEarned',
        'SUM(CASE WHEN transaction.buyerId = :userId OR transaction.sellerId = :userId THEN transaction.fee ELSE 0 END) as totalFees',
      ])
      .where(
        '(transaction.buyerId = :userId OR transaction.sellerId = :userId)',
      )
      .andWhere('transaction.status = :status')
      .setParameters({
        userId,
        status: TransactionStatus.COMPLETED,
      })
      .getRawOne();

    return {
      totalTransactions: parseInt(stats.totalTransactions) || 0,
      totalPurchased: parseFloat(stats.totalPurchased) || 0,
      totalEarned: parseFloat(stats.totalEarned) || 0,
      totalFees: parseFloat(stats.totalFees) || 0,
    };
  }

  private async recordFinancialFlow(transaction: Transaction): Promise<void> {
    // 记录买家支出
    await this.financeService.recordTransaction({
      userId: transaction.buyerId,
      type: FinancialRecordType.EXPENSE,
      category: FinancialCategory.TRADING,
      amount: transaction.amount,
      currency: transaction.currency,
      description: `购买NFT: ${transaction.valueID?.name || transaction.valueIdId}`,
      transactionId: transaction.id,
    });

    // 记录卖家收入
    await this.financeService.recordTransaction({
      userId: transaction.sellerId,
      type: FinancialRecordType.INCOME,
      category: FinancialCategory.TRADING,
      amount: transaction.netAmount,
      currency: transaction.currency,
      description: `出售NFT: ${transaction.valueID?.name || transaction.valueIdId}`,
      transactionId: transaction.id,
    });

    // 记录平台手续费
    if (transaction.fee > 0) {
      await this.financeService.recordPlatformFee({
        amount: transaction.fee,
        currency: transaction.currency,
        description: `交易手续费`,
        transactionId: transaction.id,
      });
    }
  }

  private async processPayment(transaction: Transaction): Promise<void> {
    // 这里实现实际的支付处理逻辑
    // 比如从买家钱包扣款，向卖家钱包转账等

    try {
      // 扣除买家余额
      await this.financeService.deductBalance(
        transaction.buyerId,
        transaction.amount,
        transaction.currency,
      );

      // 增加卖家余额
      await this.financeService.addBalance(
        transaction.sellerId,
        transaction.netAmount,
        transaction.currency,
      );

      // 记录平台收入
      if (transaction.fee > 0) {
        await this.financeService.addPlatformRevenue(
          transaction.fee,
          transaction.currency,
        );
      }
    } catch (error) {
      // 如果支付处理失败，标记交易为失败
      await this.failTransaction(transaction.id, error.message);
      throw error;
    }
  }
}
