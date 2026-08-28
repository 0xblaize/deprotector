import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';
import type { HardhatUserConfig } from 'hardhat/config';

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  paths: { sources: './contracts', tests: './test' },
  networks: {
    hardhat: {},
    botchain: {
      url: process.env.BOTCHAIN_HTTP_RPC_URL || '',
      chainId: Number(process.env.BOTCHAIN_CHAIN_ID || 0),
      accounts
    }
  }
};

export default config;
