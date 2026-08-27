import { ethers } from 'ethers';
import { NETWORKS } from '../config/networks';
import { decodeTransactionInput } from './decoder';
import { executeFlashbotsCountermeasure } from '../execution/ethereum_mev';

export function startMempoolStream() {
    console.log(`📡 [Mempool Streamer] Connecting to WebSocket RPC: ${NETWORKS.ethereum.wsRpc}...`);

    try {
        const wsProvider = new ethers.providers.WebSocketProvider(NETWORKS.ethereum.wsRpc);

        wsProvider.on('pending', async (txHash: string) => {
            try {
                const tx = await wsProvider.getTransaction(txHash);
                if (!tx || !tx.to || !tx.data || !tx.from) return;

                const decoded = decodeTransactionInput(tx.data);
                if (!decoded) return;

                if (decoded.isApproval) {
                    console.warn(`⚠️ [Mempool Alert] Approval transaction detected in mempool! Hash: ${txHash}`);
                    console.log(`   From: ${tx.from} | Spender: ${decoded.spender} | Nonce: ${tx.nonce}`);

                    // Trigger MEV Flashbots cancellation immediately
                    executeFlashbotsCountermeasure(tx.from, tx.nonce, tx.chainId || 1);
                }
            } catch (err) {
                // Ignore transient provider connection errors
            }
        });

        console.log('✅ [Mempool Streamer] WebSocket pending transaction listener is live.');
    } catch (error) {
        console.error('❌ [Mempool Streamer] Failed to initialize WebSocket stream:', error);
    }
}
