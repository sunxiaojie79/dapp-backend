import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  upload: {
    destination: process.env.UPLOAD_DEST || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  },
  blockchain: {
    web3ProviderUrl: process.env.WEB3_PROVIDER_URL || '',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
  },
}));
