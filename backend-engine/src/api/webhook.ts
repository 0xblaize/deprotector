import express, { Request, Response } from 'express';

export const apiRouter = express.Router();
const HIGH_THREAT_WALLETS = new Map<string, { domain: string; timestamp: number; network?: string }>();
const RECENT_EVENTS = new Map<string, number>();
const API_KEY = process.env.TELEMETRY_API_KEY;

function authorized(req: Request) {
    return !API_KEY || req.get('x-api-key') === API_KEY;
}

function validAddress(value: unknown): value is string {
    return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);
}

apiRouter.post('/telemetry/flag-threat', (req: Request, res: Response) => {
    if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized telemetry request' });
    const { walletAddress, domain, network, threatLevel, signatures } = req.body;
    if (typeof domain !== 'string' || domain.length > 253) return res.status(400).json({ error: 'A valid domain is required' });
    if (network !== undefined && typeof network !== 'string') return res.status(400).json({ error: 'Invalid network' });
    if (threatLevel !== undefined && typeof threatLevel !== 'string') return res.status(400).json({ error: 'Invalid threat level' });
    if (signatures !== undefined && (!Array.isArray(signatures) || signatures.length > 20 || signatures.some(item => typeof item !== 'string'))) return res.status(400).json({ error: 'Invalid signatures' });

    const dedupeKey = `${domain}:${walletAddress || 'anonymous'}`;
    const previous = RECENT_EVENTS.get(dedupeKey);
    if (previous && Date.now() - previous < 30_000) return res.status(202).json({ status: 'DUPLICATE_IGNORED' });
    RECENT_EVENTS.set(dedupeKey, Date.now());

    if (validAddress(walletAddress)) {
        const normalizedWallet = walletAddress.toLowerCase();
        HIGH_THREAT_WALLETS.set(normalizedWallet, { domain, network, timestamp: Date.now() });
        console.warn(`[Telemetry Alert] Threat signal recorded for ${normalizedWallet} on ${domain}`);
        return res.status(202).json({ status: 'THREAT_SIGNAL_RECORDED', wallet: normalizedWallet });
    }

    console.warn(`[Telemetry Alert] Anonymous threat signal recorded for ${domain}`);
    return res.status(202).json({ status: 'THREAT_SIGNAL_RECORDED' });
});

apiRouter.get('/telemetry/status/:wallet', (req: Request, res: Response) => {
    if (!validAddress(req.params.wallet)) return res.status(400).json({ error: 'Invalid wallet address' });
    const threatInfo = HIGH_THREAT_WALLETS.get(req.params.wallet.toLowerCase());
    return res.json(threatInfo ? { status: 'HIGH_THREAT', threatInfo } : { status: 'CLEAN' });
});
