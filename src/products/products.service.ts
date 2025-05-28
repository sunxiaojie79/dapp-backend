import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    ownerId: number,
  ): Promise<Product> {
    const product = await this.productRepository.create({
      ...createProductDto,
      owner: { id: ownerId },
    });
    return this.productRepository.save(product);
  }

  async findAll(query: GetProductsQueryDto): Promise<Product[]> {
    const { name, page, limit, isForSale, isForRent } = query;
    const take = limit ?? 10;
    const skip = (page - 1) * take;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.owner', 'owner')
      .leftJoinAndSelect('product.renter', 'renter')
      .skip(skip)
      .take(take);
    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', {
        name: `%${name}%`,
      });
    }
    if (isForSale) {
      queryBuilder.andWhere('product.isForSale = :isForSale', { isForSale });
    }
    if (isForRent) {
      queryBuilder.andWhere('product.isForRent = :isForRent', { isForRent });
    }
    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['owner', 'renter'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['owner', 'renter'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const updatedProduct = this.productRepository.merge(
      product,
      updateProductDto,
    );
    return this.productRepository.save(updatedProduct);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.remove(product);
  }
}
