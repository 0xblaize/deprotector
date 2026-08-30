export type SecurityEvent = {
    id: string;
    type: 'MEMPOOL_APPROVAL' | 'PHISHING_SIGNAL';
    timestamp: string;
    wallet?: string;
    domain?: string;
    spender?: string;
    nonce?: number;
    txHash?: string;
    chainId?: number;
    threatLevel?: string;
    signatures?: string[];
    status: 'DETECTED' | 'USER_AUTHORIZATION_REQUIRED';
};

const events: SecurityEvent[] = [];
const MAX_EVENTS = 100;

export function recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    const stored = { ...event, id: `${Date.now()}-${events.length}`, timestamp: new Date().toISOString() };
    events.unshift(stored);
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
    return stored;
}

export function listSecurityEvents(wallet?: string) {
    const normalized = wallet?.toLowerCase();
    return events.filter(event => !normalized || !event.wallet || event.wallet.toLowerCase() === normalized);
}
