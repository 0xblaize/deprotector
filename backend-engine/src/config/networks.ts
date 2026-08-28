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

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is required`);
    return value;
}

export const NETWORKS: Record<string, NetworkConfig> = {
    botchain: {
        name: process.env.BOTCHAIN_NETWORK_NAME || 'Botchain (not configured)',
        chainId: Number(process.env.BOTCHAIN_CHAIN_ID || 0),
        httpRpc: process.env.BOTCHAIN_HTTP_RPC_URL || '',
        wsRpc: process.env.BOTCHAIN_WS_RPC_URL,
        isL2: process.env.BOTCHAIN_IS_L2 === 'true',
        type: process.env.BOTCHAIN_IS_L2 === 'true' ? 'L2_SEQUENCER' : 'ETH_FLASHBOTS'
    },
    ethereum: {
        name: required('ETH_NETWORK_NAME'),
        chainId: Number(required('ETH_CHAIN_ID')),
        httpRpc: required('ETH_HTTP_RPC_URL'),
        wsRpc: process.env.ETH_WS_RPC_URL,
        isL2: false,
        type: 'ETH_FLASHBOTS'
    },
    base: {
        name: required('BASE_NETWORK_NAME'),
        chainId: Number(required('BASE_CHAIN_ID')),
        httpRpc: required('BASE_HTTP_RPC_URL'),
        wsRpc: process.env.BASE_WS_RPC_URL,
        isL2: true,
        type: 'L2_SEQUENCER'
    },
    robinhood: {
        name: required('ROBINHOOD_NETWORK_NAME'),
        chainId: Number(required('ROBINHOOD_CHAIN_ID')),
        httpRpc: required('ROBINHOOD_HTTP_RPC_URL'),
        wsRpc: process.env.ROBINHOOD_WS_RPC_URL,
        isL2: true,
        type: 'L2_SEQUENCER'
    },
};

export const PRIMARY_NETWORK = 'botchain';

if (!NETWORKS.botchain.httpRpc || !NETWORKS.botchain.chainId) {
    console.warn('[Config] Botchain is primary but not configured. Add BOTCHAIN_* values before enabling monitoring.');
}

const configuredNetworks = Object.values(NETWORKS).filter(network => network.httpRpc && network.chainId);
if (configuredNetworks.length === 0) {
    console.warn('[Config] No EVM networks are configured. Monitoring is disabled.');
}

export const CONFIG = {
    port: Number(process.env.PORT || 4000),
    guardianPrivateKey: process.env.GUARDIAN_PRIVATE_KEY,
    flashbotsRelayKey: process.env.FLASHBOTS_RELAY_KEY
};

if (!CONFIG.guardianPrivateKey) console.warn('[Config] Guardian signing is disabled; user authorization is required.');
if (!CONFIG.flashbotsRelayKey) console.warn('[Config] Private relay integration is disabled.');

export { required };

