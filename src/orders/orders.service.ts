import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderType, OrderStatus } from './entities/order.entity';
import { ValueID } from '../value-ids/entities/value-id.entity';
import {
  CreateOrderDto,
  UpdateOrderDto,
  QueryOrdersDto,
} from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ValueID)
    private valueIDRepository: Repository<ValueID>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const { type, valueIdId, amount, currency, rentalPeriod } = createOrderDto;

    // 检查Value ID是否存在
    const valueID = await this.valueIDRepository.findOne({
      where: { id: valueIdId },
      relations: ['owner', 'renter'],
    });

    if (!valueID) {
      throw new NotFoundException('Value ID 不存在');
    }

    // 根据订单类型进行验证
    if (type === OrderType.BUY) {
      if (!valueID.isForSale) {
        throw new BadRequestException('该Value ID未上架销售');
      }
      if (valueID.ownerId === userId) {
        throw new ForbiddenException('不能购买自己的Value ID');
      }
    } else if (type === OrderType.RENT) {
      if (!valueID.isForRent) {
        throw new BadRequestException('该Value ID未上架租赁');
      }
      if (valueID.ownerId === userId) {
        throw new ForbiddenException('不能租赁自己的Value ID');
      }
      if (!rentalPeriod) {
        throw new BadRequestException('租赁订单必须指定租赁期限');
      }
    }

    // 创建订单
    const order = this.orderRepository.create({
      type,
      valueIdId,
      amount,
      currency,
      rentalPeriod,
      ...(type === OrderType.BUY && {
        buyerId: userId,
        sellerId: valueID.ownerId,
      }),
      ...(type === OrderType.RENT && {
        renterId: userId,
        sellerId: valueID.ownerId,
      }),
      ...(type === OrderType.SELL && { sellerId: userId }),
    });

    const savedOrder = await this.orderRepository.save(order);
    return this.findOne(savedOrder.id);
  }

  async findAll(
    query: QueryOrdersDto,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.valueID', 'valueID')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.renter', 'renter');

    // 应用过滤器
    if (filters.type) {
      queryBuilder.andWhere('order.type = :type', { type: filters.type });
    }

    if (filters.valueIdId) {
      queryBuilder.andWhere('order.valueIdId = :valueIdId', {
        valueIdId: filters.valueIdId,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere(
        '(order.buyerId = :userId OR order.sellerId = :userId OR order.renterId = :userId)',
        { userId: filters.userId },
      );
    }

    // 排序
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

    // 分页
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['valueID', 'buyer', 'seller', 'renter'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    userId: number,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // 只有订单的创建者可以更新订单（且订单状态为待处理）
    const isOwner =
      order.buyerId === userId ||
      order.sellerId === userId ||
      order.renterId === userId;
    if (!isOwner) {
      throw new ForbiddenException('只有订单创建者可以更新订单');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('只能更新待处理状态的订单');
    }

    Object.assign(order, updateOrderDto);
    await this.orderRepository.save(order);

    return this.findOne(id);
  }

  async cancel(id: number, userId: number): Promise<Order> {
    const order = await this.findOne(id);

    const isOwner =
      order.buyerId === userId ||
      order.sellerId === userId ||
      order.renterId === userId;
    if (!isOwner) {
      throw new ForbiddenException('只有订单创建者可以取消订单');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('只能取消待处理状态的订单');
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    return order;
  }

  async complete(id: number, userId: number): Promise<Order> {
    const order = await this.findOne(id);

    // 通常只有卖家可以确认完成订单
    if (order.sellerId !== userId) {
      throw new ForbiddenException('只有卖家可以确认完成订单');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('只能完成待处理状态的订单');
    }

    order.status = OrderStatus.COMPLETED;

    // 如果是租赁订单，设置租赁时间
    if (order.type === OrderType.RENT) {
      const now = new Date();
      order.rentalStartTime = now;
      order.rentalEndTime = new Date(
        now.getTime() + order.rentalPeriod * 24 * 60 * 60 * 1000,
      );

      // 更新Value ID的租赁状态
      const valueID = order.valueID;
      valueID.renterId = order.renterId;
      valueID.rentalEndTime = order.rentalEndTime;
      await this.valueIDRepository.save(valueID);
    } else if (order.type === OrderType.BUY) {
      // 如果是购买订单，转移所有权
      const valueID = order.valueID;
      valueID.ownerId = order.buyerId;
      valueID.isForSale = false;
      await this.valueIDRepository.save(valueID);
    }

    await this.orderRepository.save(order);
    return order;
  }

  async remove(id: number, userId: number): Promise<void> {
    const order = await this.findOne(id);

    const isOwner =
      order.buyerId === userId ||
      order.sellerId === userId ||
      order.renterId === userId;
    if (!isOwner) {
      throw new ForbiddenException('只有订单创建者可以删除订单');
    }

    // 只能删除已取消或已完成的订单
    if (
      ![OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(order.status)
    ) {
      throw new ForbiddenException('只能删除已取消或已完成的订单');
    }

    await this.orderRepository.remove(order);
  }
}
