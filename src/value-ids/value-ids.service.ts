import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ValueID } from './entities/value-id.entity';
import { NFTAttribute } from './entities/nft-attribute.entity';
import { UserFavorite } from '../modules/common/entities/user-favorite.entity';
import { CreateValueIDDto, UpdateValueIDDto, ListForSaleDto, ListForRentDto } from './dto/create-value-id.dto';
import { QueryValueIDsDto } from './dto/query-value-id.dto';

@Injectable()
export class ValueIDsService {
  constructor(
    @InjectRepository(ValueID)
    private valueIDRepository: Repository<ValueID>,
    @InjectRepository(NFTAttribute)
    private nftAttributeRepository: Repository<NFTAttribute>,
    @InjectRepository(UserFavorite)
    private userFavoriteRepository: Repository<UserFavorite>,
  ) {}

  async create(createValueIDDto: CreateValueIDDto, ownerId: number): Promise<ValueID> {
    const { attributes, ...valueIDData } = createValueIDDto;
    
    // 创建ValueID
    const valueID = this.valueIDRepository.create({
      ...valueIDData,
      ownerId,
    });
    
    const savedValueID = await this.valueIDRepository.save(valueID);

    // 创建属性
    if (attributes && attributes.length > 0) {
      const nftAttributes = attributes.map(attr => 
        this.nftAttributeRepository.create({
          ...attr,
          valueIdId: savedValueID.id,
        })
      );
      await this.nftAttributeRepository.save(nftAttributes);
    }

    return this.findOne(savedValueID.id);
  }

  async findAll(query: QueryValueIDsDto): Promise<{ data: ValueID[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.valueIDRepository
      .createQueryBuilder('valueID')
      .leftJoinAndSelect('valueID.owner', 'owner')
      .leftJoinAndSelect('valueID.renter', 'renter')
      .leftJoinAndSelect('valueID.attributes', 'attributes');

    // 应用过滤器
    this.applyFilters(queryBuilder, filters);

    // 排序
    queryBuilder.orderBy(`valueID.${sortBy}`, sortOrder);

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

  async findOne(id: number): Promise<ValueID> {
    const valueID = await this.valueIDRepository.findOne({
      where: { id },
      relations: ['owner', 'renter', 'attributes', 'favorites'],
    });

    if (!valueID) {
      throw new NotFoundException('Value ID 不存在');
    }

    // 增加浏览次数
    await this.valueIDRepository.increment({ id }, 'viewCount', 1);

    return valueID;
  }

  async update(id: number, updateValueIDDto: UpdateValueIDDto, userId: number): Promise<ValueID> {
    const valueID = await this.findOne(id);

    if (valueID.ownerId !== userId) {
      throw new ForbiddenException('只有所有者可以更新该Value ID');
    }

    Object.assign(valueID, updateValueIDDto);
    await this.valueIDRepository.save(valueID);

    return this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const valueID = await this.findOne(id);

    if (valueID.ownerId !== userId) {
      throw new ForbiddenException('只有所有者可以删除该Value ID');
    }

    await this.valueIDRepository.remove(valueID);
  }

  async listForSale(id: number, listForSaleDto: ListForSaleDto, userId: number): Promise<ValueID> {
    const valueID = await this.findOne(id);

    if (valueID.ownerId !== userId) {
      throw new ForbiddenException('只有所有者可以上架销售');
    }

    Object.assign(valueID, {
      ...listForSaleDto,
      isForSale: true,
    });

    await this.valueIDRepository.save(valueID);
    return this.findOne(id);
  }

  async listForRent(id: number, listForRentDto: ListForRentDto, userId: number): Promise<ValueID> {
    const valueID = await this.findOne(id);

    if (valueID.ownerId !== userId) {
      throw new ForbiddenException('只有所有者可以上架租赁');
    }

    Object.assign(valueID, {
      ...listForRentDto,
      isForRent: true,
    });

    await this.valueIDRepository.save(valueID);
    return this.findOne(id);
  }

  async cancelSale(id: number, userId: number): Promise<ValueID> {
    const valueID = await this.findOne(id);

    if (valueID.ownerId !== userId) {
      throw new ForbiddenException('只有所有者可以取消销售');
    }

    valueID.isForSale = false;
    await this.valueIDRepository.save(valueID);
    return this.findOne(id);
  }

  async cancelRent(id: number, userId: number): Promise<ValueID> {
    const valueID = await this.findOne(id);

    if (valueID.ownerId !== userId) {
      throw new ForbiddenException('只有所有者可以取消租赁');
    }

    valueID.isForRent = false;
    await this.valueIDRepository.save(valueID);
    return this.findOne(id);
  }

  async addToFavorites(valueIdId: number, userId: number): Promise<void> {
    const existingFavorite = await this.userFavoriteRepository.findOne({
      where: { userId, valueIdId },
    });

    if (existingFavorite) {
      throw new ForbiddenException('已经收藏过该Value ID');
    }

    const favorite = this.userFavoriteRepository.create({
      userId,
      valueIdId,
    });

    await this.userFavoriteRepository.save(favorite);
    await this.valueIDRepository.increment({ id: valueIdId }, 'favoriteCount', 1);
  }

  async removeFromFavorites(valueIdId: number, userId: number): Promise<void> {
    const favorite = await this.userFavoriteRepository.findOne({
      where: { userId, valueIdId },
    });

    if (!favorite) {
      throw new NotFoundException('收藏记录不存在');
    }

    await this.userFavoriteRepository.remove(favorite);
    await this.valueIDRepository.decrement({ id: valueIdId }, 'favoriteCount', 1);
  }

  async getRecommendations(limit: number = 10): Promise<ValueID[]> {
    return this.valueIDRepository
      .createQueryBuilder('valueID')
      .leftJoinAndSelect('valueID.owner', 'owner')
      .leftJoinAndSelect('valueID.attributes', 'attributes')
      .where('valueID.isForSale = :isForSale', { isForSale: true })
      .orderBy('valueID.favoriteCount', 'DESC')
      .addOrderBy('valueID.viewCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getLatest(limit: number = 10): Promise<ValueID[]> {
    return this.valueIDRepository
      .createQueryBuilder('valueID')
      .leftJoinAndSelect('valueID.owner', 'owner')
      .leftJoinAndSelect('valueID.attributes', 'attributes')
      .orderBy('valueID.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<ValueID>, filters: any): void {
    if (filters.name) {
      queryBuilder.andWhere('valueID.name LIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.rarity) {
      queryBuilder.andWhere('valueID.rarity = :rarity', { rarity: filters.rarity });
    }

    if (filters.isForSale !== undefined) {
      queryBuilder.andWhere('valueID.isForSale = :isForSale', { isForSale: filters.isForSale });
    }

    if (filters.isForRent !== undefined) {
      queryBuilder.andWhere('valueID.isForRent = :isForRent', { isForRent: filters.isForRent });
    }

    if (filters.ownerId) {
      queryBuilder.andWhere('valueID.ownerId = :ownerId', { ownerId: filters.ownerId });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('valueID.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('valueID.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
  }
} 