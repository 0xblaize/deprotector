import * as dotenv from 'dotenv';
dotenv.config();

export interface NetworkConfig {
    name: string;
    chainId: number;
    httpRpc: string;
    wsRpc?: string;
    isL2: boolean;
    type: 'ETH_FLASHBOTS' | 'L2_SEQUENCER';
}

export const NETWORKS: Record<string, NetworkConfig> = {
    ethereum: {
        name: 'Ethereum Mainnet',
        chainId: Number(process.env.ETH_CHAIN_ID || 1),
        httpRpc: process.env.ETH_HTTP_RPC_URL || 'https://rpc.flashbots.net',
        wsRpc: process.env.ETH_WS_RPC_URL || 'wss://eth-mainnet.g.alchemy.com/v2/demo',
        isL2: false,
        type: 'ETH_FLASHBOTS'
    },
    base: {
        name: 'Base L2',
        chainId: Number(process.env.BASE_CHAIN_ID || 8453),
        httpRpc: process.env.BASE_HTTP_RPC_URL || 'https://mainnet.base.org',
        isL2: true,
        type: 'L2_SEQUENCER'
    },
    robinhood: {
        name: 'Robinhood Chain L2',
        chainId: Number(process.env.ROBINHOOD_CHAIN_ID || 4663),
        httpRpc: process.env.ROBINHOOD_HTTP_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com',
        isL2: true,
        type: 'L2_SEQUENCER'
    }
};

export const CONFIG = {
    port: Number(process.env.PORT || 4000),
    guardianPrivateKey: process.env.GUARDIAN_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001',
    flashbotsRelayKey: process.env.FLASHBOTS_RELAY_KEY || '0x0000000000000000000000000000000000000000000000000000000000000002'
};
