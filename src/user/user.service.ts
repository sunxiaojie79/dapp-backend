import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { address: createUserDto.address },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByAddress(address: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { address },
      select: [
        'id',
        'address',
        'username',
        'avatar',
        'balance',
        'password',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneWithRelations(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'ownedValueIDs',
        'rentedValueIDs',
        'buyOrders',
        'sellOrders',
        'rentalOrders',
        'favorites',
        'favorites.valueID',
        'buyTransactions',
        'sellTransactions',
        'financialRecords',
        'wallets',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByAddressWithRelations(address: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { address },
      relations: [
        'ownedValueIDs',
        'rentedValueIDs',
        'buyOrders',
        'sellOrders',
        'rentalOrders',
        'favorites',
        'favorites.valueID',
        'buyTransactions',
        'sellTransactions',
        'financialRecords',
        'wallets',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneWithSelectedRelations(
    id: number,
    relations?: string[],
  ): Promise<User> {
    const defaultRelations = [
      'ownedValueIDs',
      'rentedValueIDs',
      'buyOrders',
      'sellOrders',
      'rentalOrders',
      'favorites',
      'favorites.valueID',
      'buyTransactions',
      'sellTransactions',
      'financialRecords',
      'wallets',
    ];

    const user = await this.userRepository.findOne({
      where: { id },
      relations: relations || defaultRelations,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }

  async updateBalance(id: number, balance: number): Promise<User> {
    const user = await this.findOne(id);
    user.balance = balance;
    return this.userRepository.save(user);
  }

  async getUserProfileWithRelations(
    id: number,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findOneWithRelations(id);
    return new UserProfileResponseDto(user);
  }

  async getUserProfileByAddressWithRelations(
    address: string,
  ): Promise<UserProfileResponseDto> {
    const user = await this.findByAddressWithRelations(address);
    return new UserProfileResponseDto(user);
  }
}
