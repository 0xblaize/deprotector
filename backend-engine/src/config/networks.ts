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

function optionalNetwork(prefix: string, defaults: { name: string; isL2: boolean; type: NetworkConfig['type'] }): NetworkConfig {
    return {
        name: process.env[`${prefix}_NETWORK_NAME`] || defaults.name,
        chainId: Number(process.env[`${prefix}_CHAIN_ID`] || 0),
        httpRpc: process.env[`${prefix}_HTTP_RPC_URL`] || '',
        wsRpc: process.env[`${prefix}_WS_RPC_URL`],
        isL2: defaults.isL2,
        type: defaults.type
    };
}

export const NETWORKS: Record<string, NetworkConfig> = {
    botchain: optionalNetwork('BOTCHAIN', { name: 'Botchain (not configured)', isL2: process.env.BOTCHAIN_IS_L2 === 'true', type: process.env.BOTCHAIN_IS_L2 === 'true' ? 'L2_SEQUENCER' : 'ETH_FLASHBOTS' }),
    ethereum: optionalNetwork('ETH', { name: 'Ethereum Mainnet (not configured)', isL2: false, type: 'ETH_FLASHBOTS' }),
    base: optionalNetwork('BASE', { name: 'Base (not configured)', isL2: true, type: 'L2_SEQUENCER' }),
    robinhood: optionalNetwork('ROBINHOOD', { name: 'Robinhood Chain (not configured)', isL2: true, type: 'L2_SEQUENCER' })
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


