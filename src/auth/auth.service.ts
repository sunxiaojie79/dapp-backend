import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto, WalletLoginDto, RegisterDto } from './dto/login.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(address: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByAddress(address);
      if (user && (await argon2.verify(user.password, password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.address, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('钱包地址或密码错误');
    }

    const payload = {
      address: user.address,
      sub: user.id,
      username: user.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        balance: user.balance,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // 检查用户是否已存在
    try {
      await this.userService.findByAddress(registerDto.address);
      throw new ConflictException('该钱包地址已被注册');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // 用户不存在，继续注册流程
    }

    const user = await this.userService.create({
      address: registerDto.address,
      username: registerDto.username,
      password: registerDto.password,
      // avatar: registerDto.avatar || '',
    });

    const payload = {
      address: user.address,
      sub: user.id,
      username: user.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        balance: user.balance,
      },
    };
  }

  async walletLogin(walletLoginDto: WalletLoginDto) {
    // TODO: 实现钱包签名验证逻辑
    // 这里需要验证签名是否有效
    const isValidSignature = this.verifySignature(
      walletLoginDto.message,
      walletLoginDto.signature,
      walletLoginDto.address,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('钱包签名验证失败');
    }

    try {
      const user = await this.userService.findByAddress(walletLoginDto.address);
      const payload = {
        address: user.address,
        sub: user.id,
        username: user.username,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          address: user.address,
          username: user.username,
          avatar: user.avatar,
          balance: user.balance,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('用户不存在，请先注册');
    }
  }

  private verifySignature(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    // TODO: 实现Web3签名验证
    // 这里应该使用Web3库来验证签名
    // 临时返回true，实际项目中需要实现真实的签名验证
    return true;
  }
}
