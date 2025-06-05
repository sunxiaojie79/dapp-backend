# QF DApp Backend

基于 NestJS + MySQL + TypeORM 的 NFT 数字身份交易平台后端 API 服务。

## 📋 功能特性

### ✅ 已实现功能

- **用户管理系统**
  - 用户注册/登录（支持密码和钱包签名登录）
  - JWT 认证和授权
  - 用户资料管理
  - 用户余额管理

- **NFT/Value ID 管理**
  - NFT 创建和铸造
  - NFT 元数据管理（名称、描述、图片、属性等）
  - 稀有度系统（common, uncommon, rare, epic, legendary）
  - NFT 上架销售/租赁
  - NFT 收藏功能

- **交易订单系统**
  - 购买订单处理
  - 销售订单管理
  - 租赁订单处理
  - 订单状态管理（pending, completed, cancelled, expired）
  - 自动所有权转移

- **搜索和推荐**
  - NFT 搜索功能
  - 推荐算法（基于稀有度、价格、浏览量等）
  - 最新上架排序
  - 分类筛选

- **系统架构**
  - 全局异常处理
  - 统一响应格式
  - 请求验证和参数校验
  - CORS 配置
  - 数据库关系映射

## 🏗️ 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.0+
- **ORM**: TypeORM 0.3.x
- **认证**: JWT + Passport
- **验证**: class-validator + class-transformer
- **配置**: @nestjs/config
- **密码加密**: argon2
- **包管理**: pnpm

## 📁 项目结构

```
src/
├── app.module.ts                 # 主应用模块
├── main.ts                      # 应用启动入口
├── config/                      # 配置文件
│   ├── app.config.ts           # 应用配置
│   ├── database.config.ts      # 数据库配置
│   └── jwt.config.ts           # JWT 配置
├── common/                      # 通用模块
│   ├── decorators/             # 装饰器
│   ├── filters/                # 异常过滤器
│   ├── guards/                 # 守卫
│   └── interceptors/           # 拦截器
├── modules/                     # 业务模块
│   ├── auth/                   # 认证模块
│   ├── value-ids/             # NFT/Value ID 模块
│   ├── search/                # 搜索模块
│   └── common/                # 公共模块
│       └── entities/          # 公共实体
├── user/                       # 用户模块
└── orders/                     # 订单模块
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制并配置环境变量：

```bash
cp .env.example .env
```

修改 `.env` 文件：

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=qf_dapp
DB_SYNC=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 数据库设置

1. 创建数据库：
```sql
CREATE DATABASE qf_dapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 运行数据库迁移（如果启用了同步，会自动创建表）

### 启动应用

```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run start:prod

# 调试模式
pnpm run start:debug
```

应用将在 `http://localhost:3000` 启动

## 📖 API 文档

### 认证相关接口

```
POST /api/v1/auth/register        # 用户注册
POST /api/v1/auth/login          # 用户登录
POST /api/v1/auth/wallet-login   # 钱包签名登录
```

### Value ID (NFT) 相关接口

```
GET    /api/v1/value-ids              # 获取 NFT 列表
GET    /api/v1/value-ids/:id          # 获取 NFT 详情
POST   /api/v1/value-ids              # 创建 NFT
PUT    /api/v1/value-ids/:id          # 更新 NFT
DELETE /api/v1/value-ids/:id          # 删除 NFT
POST   /api/v1/value-ids/:id/list-for-sale   # 上架销售
POST   /api/v1/value-ids/:id/list-for-rent   # 上架租赁
POST   /api/v1/value-ids/:id/favorites       # 添加收藏
DELETE /api/v1/value-ids/:id/favorites       # 取消收藏
```

### 订单相关接口

```
GET    /api/v1/orders           # 获取订单列表
POST   /api/v1/orders           # 创建订单
GET    /api/v1/orders/:id       # 获取订单详情
PUT    /api/v1/orders/:id       # 更新订单
POST   /api/v1/orders/:id/cancel    # 取消订单
POST   /api/v1/orders/:id/complete  # 完成订单
```

### 搜索相关接口

```
GET /api/v1/search/value-ids      # 搜索 NFT
GET /api/v1/search/recommendations # 获取推荐 NFT
GET /api/v1/search/latest         # 获取最新 NFT
GET /api/v1/search/trending       # 获取热门 NFT
```

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独使用 Docker

```bash
# 构建镜像
docker build -t qf-dapp-backend .

# 运行容器
docker run -d \
  --name qf-dapp-backend \
  -p 3000:3000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_db_password \
  qf-dapp-backend
```

## 🗄️ 数据库设计

### 核心实体表

- `users` - 用户表
- `value_ids` - NFT/数字身份表
- `orders` - 订单表
- `nft_attributes` - NFT属性表
- `user_favorites` - 用户收藏表

### 关系设计

- 用户与 NFT: 一对多关系（所有权和租赁关系）
- NFT 与属性: 一对多关系
- 用户与订单: 多对多关系（买家、卖家、租赁者）
- 用户与收藏: 多对多关系

## 🧪 测试

```bash
# 单元测试
pnpm run test

# 端到端测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov
```

## 📝 开发计划

### 🚧 待实现功能

- [ ] **财务模块**
  - [ ] 交易手续费计算
  - [ ] 收益分配
  - [ ] 提现管理
  - [ ] 财务报表

- [ ] **租赁模块增强**
  - [ ] 租赁到期自动处理
  - [ ] 租赁收益管理

- [ ] **系统增强**
  - [ ] Redis 缓存
  - [ ] API 文档 (Swagger)
  - [ ] 日志系统
  - [ ] 监控和健康检查

- [ ] **区块链集成**
  - [ ] Web3 签名验证
  - [ ] 智能合约交互
  - [ ] 链上数据同步

- [ ] **安全增强**
  - [ ] Rate Limiting
  - [ ] SQL 注入防护
  - [ ] 输入验证增强

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如有问题或建议，请创建 [Issue](https://github.com/your-repo/issues)

---

**注意**: 这是一个开发中的项目，部分功能仍在完善中。生产环境使用前请确保进行充分的测试。
