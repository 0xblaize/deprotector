import { ethers } from 'ethers';
import { NETWORKS, type NetworkConfig } from './config/networks';

const APPROVAL_TOPIC = ethers.utils.id('Approval(address,address,uint256)');
const APPROVAL_FOR_ALL_TOPIC = ethers.utils.id('ApprovalForAll(address,address,bool)');
const ERC20_ABI = ['function allowance(address owner,address spender) view returns (uint256)'];
const ERC721_ABI = ['function isApprovedForAll(address owner,address operator) view returns (bool)'];
const MAX_BLOCK_RANGE = Number(process.env.APPROVAL_SCAN_BLOCKS || 10000);

export type DiscoveredApproval = {
    chain: string;
    chainId: number;
    token: string;
    spender: string;
    allowance: string;
    kind: 'erc20' | 'nft';
    blockNumber: number;
    transactionHash: string;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
    riskScore: number;
    riskReasons: string[];
};

const KNOWN_MALICIOUS_SPENDERS = new Set((process.env.KNOWN_MALICIOUS_SPENDERS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean));

function topicAddress(value: string) {
    return ethers.utils.hexZeroPad(value, 32).toLowerCase();
}

async function scoreApproval(provider: ethers.providers.Provider, token: string, spender: string, allowance: string, kind: 'erc20' | 'nft') {
    const reasons: string[] = [];
    let score = 0;
    if (kind === 'nft') { score += 60; reasons.push('NFT-wide operator approval'); }
    if (kind === 'erc20' && allowance === ethers.constants.MaxUint256.toString()) { score += 50; reasons.push('Unlimited token allowance'); }
    if (KNOWN_MALICIOUS_SPENDERS.has(spender.toLowerCase())) { score = 100; reasons.push('Spender is on the configured malicious-address list'); }
    const code = await provider.getCode(spender).catch(() => '0x');
    if (code === '0x') { score += 25; reasons.push('Spender has no contract code at scan time'); }
    if (reasons.length === 0) reasons.push('No high-confidence malicious indicator found');
    return { riskScore: Math.min(score, 100), risk: score >= 70 ? 'HIGH' as const : score >= 35 ? 'MEDIUM' as const : 'LOW' as const, riskReasons: reasons };
}

async function scanNetwork(name: string, network: NetworkConfig, owner: string): Promise<DiscoveredApproval[]> {
    if (!network.httpRpc || !network.chainId) return [];
    const provider = new ethers.providers.JsonRpcProvider(network.httpRpc, network.chainId);
    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latest - MAX_BLOCK_RANGE);
    const ownerTopic = topicAddress(owner);
    const [erc20Logs, nftLogs] = await Promise.all([
        provider.getLogs({ fromBlock, toBlock: latest, topics: [APPROVAL_TOPIC, ownerTopic] }),
        provider.getLogs({ fromBlock, toBlock: latest, topics: [APPROVAL_FOR_ALL_TOPIC, ownerTopic] })
    ]);
    const results: DiscoveredApproval[] = [];
    for (const log of erc20Logs) {
        const spender = ethers.utils.getAddress(`0x${log.topics[2].slice(-40)}`);
        let allowance = '0';
        try { allowance = (await new ethers.Contract(log.address, ERC20_ABI, provider).allowance(owner, spender)).toString(); } catch {}
        if (allowance !== '0') results.push({ chain: name, chainId: network.chainId, token: log.address, spender, allowance, kind: 'erc20', blockNumber: log.blockNumber, transactionHash: log.transactionHash, ...await scoreApproval(provider, log.address, spender, allowance, 'erc20') });
    }
    for (const log of nftLogs) {
        const operator = ethers.utils.getAddress(`0x${log.topics[2].slice(-40)}`);
        let approved = false;
        try { approved = await new ethers.Contract(log.address, ERC721_ABI, provider).isApprovedForAll(owner, operator); } catch {}
        if (approved) results.push({ chain: name, chainId: network.chainId, token: log.address, spender: operator, allowance: 'APPROVED_FOR_ALL', kind: 'nft', blockNumber: log.blockNumber, transactionHash: log.transactionHash, ...await scoreApproval(provider, log.address, operator, 'APPROVED_FOR_ALL', 'nft') });
    }
    return results;
}

export async function discoverApprovals(owner: string) {
    if (!ethers.utils.isAddress(owner)) throw new Error('Invalid wallet address');
    const entries = await Promise.all(Object.entries(NETWORKS).map(([name, network]) => scanNetwork(name, network, owner)));
    return entries.flat().sort((a, b) => b.blockNumber - a.blockNumber);
}
