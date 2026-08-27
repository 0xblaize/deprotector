export interface ThreatRecord {
    walletAddress: string;
    domain: string;
    threatLevel: 'HIGH_THREAT' | 'HEURISTIC_FLAG';
    timestamp: number;
}

export class ThreatStateCache {
    private cache: Map<string, ThreatRecord> = new Map();

    public setThreat(wallet: string, domain: string, threatLevel: 'HIGH_THREAT' | 'HEURISTIC_FLAG'): void {
        const key = wallet.toLowerCase();
        const record: ThreatRecord = {
            walletAddress: key,
            domain,
            threatLevel,
            timestamp: Date.now()
        };
        this.cache.set(key, record);
        console.log(`[Threat Cache] Cached high-threat state for wallet: ${key}`);
    }

    public isHighThreat(wallet: string): boolean {
        const key = wallet.toLowerCase();
        const record = this.cache.get(key);
        if (!record) return false;

        // Threat flags expire after 30 minutes
        const THREAT_TTL_MS = 30 * 60 * 1000;
        if (Date.now() - record.timestamp > THREAT_TTL_MS) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    public getThreat(wallet: string): ThreatRecord | null {
        const key = wallet.toLowerCase();
        return this.cache.get(key) || null;
    }
}

export const globalThreatCache = new ThreatStateCache();
