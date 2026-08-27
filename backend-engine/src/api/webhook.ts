import express, { Request, Response } from 'express';
export const apiRouter = express.Router();

const HIGH_THREAT_WALLETS = new Map<string, { domain: string; timestamp: number; network?: string }>();

apiRouter.post('/telemetry/flag-threat', (req: Request, res: Response) => {
    const { walletAddress, domain, network } = req.body;
    if (typeof walletAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'A valid EVM wallet address is required' });
    }
    const normalizedWallet = walletAddress.toLowerCase();
    HIGH_THREAT_WALLETS.set(normalizedWallet, { domain: typeof domain === 'string' ? domain : 'unknown', network, timestamp: Date.now() });
    console.warn(`[Telemetry Alert] Threat signal recorded for ${normalizedWallet} on ${domain || 'unknown'}`);
    return res.status(202).json({ status: 'THREAT_SIGNAL_RECORDED', wallet: normalizedWallet });
});

apiRouter.get('/telemetry/status/:wallet', (req: Request, res: Response) => {
    const wallet = req.params.wallet.toLowerCase();
    return res.json(HIGH_THREAT_WALLETS.has(wallet) ? { status: 'HIGH_THREAT', threatInfo: HIGH_THREAT_WALLETS.get(wallet) } : { status: 'CLEAN' });
});

apiRouter.get('/telemetry/status/:wallet', (req: Request, res: Response) => {
    const wallet = req.params.wallet.toLowerCase();
    const threatInfo = HIGH_THREAT_WALLETS.get(wallet);
    return res.json(threatInfo ? { status: 'HIGH_THREAT', threatInfo } : { status: 'CLEAN' });
});

apiRouter.get('/telemetry/status/:wallet', (req: Request, res: Response) => {
    const wallet = req.params.wallet.toLowerCase();
    const threatInfo = HIGH_THREAT_WALLETS.get(wallet);

    if (threatInfo) {
        return res.json({ status: 'HIGH_THREAT', threatInfo });
    }
    return res.json({ status: 'CLEAN' });
});
