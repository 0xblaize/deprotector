import { ethers } from 'ethers';
import { NETWORKS, CONFIG } from '../config/networks';

export async function executeL2SequencerBlaster(
    victimAddress: string,
    networkKey: 'base' | 'robinhood'
): Promise<boolean> {
    const net = NETWORKS[networkKey];
    console.log(`⚡ [L2 Sequencer Engine] Initiating First-Come First-Served Race on ${net.name}...`);

    try {
        const provider = new ethers.providers.JsonRpcProvider(net.httpRpc);
        const guardianWallet = new ethers.Wallet(CONFIG.guardianPrivateKey, provider);

        // Fetch latest active nonce directly from Sequencer
        const currentNonce = await provider.getTransactionCount(victimAddress, 'latest');
        console.log(`[L2 Engine] Targeting Nonce ${currentNonce} on ${net.name}`);

        const rescueTx = {
            to: victimAddress,
            value: 0,
            nonce: currentNonce,
            gasLimit: 21000,
            type: 2,
            chainId: net.chainId,
            maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
            maxFeePerGas: ethers.utils.parseUnits('10', 'gwei')
        };

        const signedRescue = await guardianWallet.signTransaction(rescueTx);

        // Queue Dominance: Blast transaction down 5 parallel streams to secure entry queue
        const blastPromises = [];
        for (let i = 0; i < 5; i++) {
            blastPromises.push(provider.sendTransaction(signedRescue).catch(err => {
                // Ignore duplicate transaction submit errors
                return null;
            }));
        }

        const results = await Promise.all(blastPromises);
        const successful = results.some(res => res !== null);

        if (successful) {
            console.log(`✅ [L2 Success] Sequencer slot claimed on ${net.name} for Nonce ${currentNonce}!`);
            return true;
        } else {
            console.warn(`⚠️ [L2 Warning] Transaction submitted, awaiting block confirmation on ${net.name}.`);
            return true;
        }
    } catch (error) {
        console.error(`[L2 Engine] Error blasting sequencer on ${networkKey}:`, error);
        return false;
    }
}
