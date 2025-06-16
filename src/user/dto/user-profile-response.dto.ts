import { User } from '../entities/user.entity';
import { ValueID } from '../../value-ids/entities/value-id.entity';
import { Order } from '../../orders/entities/order.entity';
import { UserFavorite } from '../../common/entities/user-favorite.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { FinancialRecord } from '../../finance/entities/financial-record.entity';
import { Wallet } from '../../finance/entities/wallet.entity';

export class UserProfileResponseDto {
  id: number;
  address: string;
  username: string;
  avatar: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;

  // 关联数据
  ownedValueIDs?: ValueID[];
  rentedValueIDs?: ValueID[];
  buyOrders?: Order[];
  sellOrders?: Order[];
  rentalOrders?: Order[];
  favorites?: UserFavorite[];
  buyTransactions?: Transaction[];
  sellTransactions?: Transaction[];
  financialRecords?: FinancialRecord[];
  wallets?: Wallet[];

  // 统计信息
  stats?: {
    totalOwnedNFTs: number;
    totalRentedNFTs: number;
    totalBuyOrders: number;
    totalSellOrders: number;
    totalRentalOrders: number;
    totalFavorites: number;
    totalBuyTransactions: number;
    totalSellTransactions: number;
    totalFinancialRecords: number;
    totalWallets: number;
  };

  constructor(user: User) {
    this.id = user.id;
    this.address = user.address;
    this.username = user.username;
    this.avatar = user.avatar;
    this.balance = user.balance;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    // 关联数据
    this.ownedValueIDs = user.ownedValueIDs;
    this.rentedValueIDs = user.rentedValueIDs;
    this.buyOrders = user.buyOrders;
    this.sellOrders = user.sellOrders;
    this.rentalOrders = user.rentalOrders;
    this.favorites = user.favorites;
    this.buyTransactions = user.buyTransactions;
    this.sellTransactions = user.sellTransactions;
    this.financialRecords = user.financialRecords;
    this.wallets = user.wallets;

    // 计算统计信息
    this.stats = {
      totalOwnedNFTs: user.ownedValueIDs?.length || 0,
      totalRentedNFTs: user.rentedValueIDs?.length || 0,
      totalBuyOrders: user.buyOrders?.length || 0,
      totalSellOrders: user.sellOrders?.length || 0,
      totalRentalOrders: user.rentalOrders?.length || 0,
      totalFavorites: user.favorites?.length || 0,
      totalBuyTransactions: user.buyTransactions?.length || 0,
      totalSellTransactions: user.sellTransactions?.length || 0,
      totalFinancialRecords: user.financialRecords?.length || 0,
      totalWallets: user.wallets?.length || 0,
    };
  }
}
