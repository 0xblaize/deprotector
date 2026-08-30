import { ethers } from 'ethers';
import { NETWORKS, PRIMARY_NETWORK } from '../config/networks';
import { decodeTransactionInput } from './decoder';
import { executeFlashbotsCountermeasure } from '../execution/ethereum_mev';
import { recordSecurityEvent } from '../events';


export function startMempoolStream() {
    const primary = NETWORKS[PRIMARY_NETWORK];
    console.log(`[Mempool Streamer] Primary network: ${primary.name}`);

    try {
        if (!primary.wsRpc) {
            console.warn('[Mempool Streamer] No primary WebSocket RPC configured; monitoring is disabled.');
            return;
        }
        const wsProvider = new ethers.providers.WebSocketProvider(primary.wsRpc);
                const socket = (wsProvider as ethers.providers.WebSocketProvider & { _websocket?: { on: (event: string, handler: (error: any) => void) => void } })._websocket;
        socket?.on('error', (error: any) => {
            console.error('[Mempool Streamer] WebSocket connection failed; monitoring is disabled:', error?.message);
            wsProvider.destroy();
        });


        wsProvider.on('error', error => {
            console.error('[Mempool Streamer] Provider connection failed; monitoring is disabled:', error.message);
            wsProvider.destroy();
        });

        wsProvider.on('pending', async (txHash: string) => {
            try {
                const tx = await wsProvider.getTransaction(txHash);
                if (!tx || !tx.to || !tx.data || !tx.from) return;

                const decoded = decodeTransactionInput(tx.data);
                if (!decoded) return;

                if (decoded.isApproval) {
                    recordSecurityEvent({
                        type: 'MEMPOOL_APPROVAL',
                        wallet: tx.from,
                        spender: decoded.spender,
                        nonce: tx.nonce,
                        txHash,
                        chainId: primary.chainId,
                        status: 'USER_AUTHORIZATION_REQUIRED'
                    });
                    console.warn(`[Mempool Alert] Approval transaction detected in mempool. Hash: ${txHash}`);
                    console.log(`From: ${tx.from} | Spender: ${decoded.spender} | Nonce: ${tx.nonce}`);

                    executeFlashbotsCountermeasure(tx.from, tx.nonce, primary.chainId).catch(error => {
                        console.error('[Mempool Streamer] Defensive action requires user authorization:', error);
                    });
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
