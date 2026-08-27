import express, { Request, Response } from 'express';
import { executeL2SequencerBlaster } from '../execution/l2_sequencer_blaster';
import { executeFlashbotsCountermeasure } from '../execution/ethereum_mev';

export const apiRouter = express.Router();

// Threat memory cache: wallet -> threat profile
const HIGH_THREAT_WALLETS = new Map<string, { domain: string; timestamp: number }>();

apiRouter.post('/telemetry/flag-threat', async (req: Request, res: Response) => {
    const { walletAddress, domain, network } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'walletAddress is required' });
    }

    const normalizedWallet = walletAddress.toLowerCase();
    console.warn(`🚨 [Telemetry Alert] High threat detected for wallet ${normalizedWallet} on domain: ${domain}`);

    // Store in high-threat monitoring cache
    HIGH_THREAT_WALLETS.set(normalizedWallet, {
        domain: domain || 'unknown',
        timestamp: Date.now()
    });

    // If threat is flagged on L2 (Base / Robinhood), trigger pre-emptive invalidation
    if (network === 'base' || network === 'robinhood') {
        console.log(`[Telemetry Alert] Pre-emptively invalidating sequencer queue on ${network}...`);
        executeL2SequencerBlaster(normalizedWallet, network).catch(err => {
            console.error('[Telemetry Alert] L2 pre-emptive invalidation error:', err);
        });
    }

    return res.json({
        status: 'HIGH_THREAT_ACKNOWLEDGED',
        wallet: normalizedWallet,
        timestamp: Date.now()
    });
});

apiRouter.get('/telemetry/status/:wallet', (req: Request, res: Response) => {
    const wallet = req.params.wallet.toLowerCase();
    const threatInfo = HIGH_THREAT_WALLETS.get(wallet);

    if (threatInfo) {
        return res.json({ status: 'HIGH_THREAT', threatInfo });
    }
    return res.json({ status: 'CLEAN' });
});
