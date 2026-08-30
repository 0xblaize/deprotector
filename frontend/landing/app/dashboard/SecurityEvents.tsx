'use client';

import { useEffect, useState } from 'react';

type SecurityEvent = {
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
  status: string;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://deprotector.onrender.com').trim().replace(/\/+$/, '');

function shorten(value: string) { return `${value.slice(0, 8)}...${value.slice(-6)}`; }

export default function SecurityEvents({ wallet }: { wallet: string | null }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const query = wallet ? `?wallet=${encodeURIComponent(wallet)}` : '';
        const response = await fetch(`${API_BASE}/api/events${query}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) { setEvents(data.events || []); setError(''); }
      } catch (eventError) {
        if (active) setError(eventError instanceof Error ? eventError.message : 'Unable to load events');
      }
    }
    load();
    const timer = window.setInterval(load, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [wallet]);

  return <section className="events-panel"><div className="panel-heading"><div><p className="eyebrow">LIVE SECURITY EVENTS</p><h2>Mempool and shield activity</h2></div><span className="status">AUTO-REFRESH / 5S</span></div>{error ? <p className="muted">Backend event feed unavailable: {error}</p> : events.length === 0 ? <p className="muted">No recent events for this wallet.</p> : <div className="events-list">{events.map(event => <article className="event-row" key={event.id}><div><strong>{event.type === 'MEMPOOL_APPROVAL' ? 'Approval detected in mempool' : 'Phishing signal received'}</strong><small>{new Date(event.timestamp).toLocaleString()}</small></div><div className="event-details">{event.wallet && <span>Wallet {shorten(event.wallet)}</span>}{event.spender && <span>Spender {shorten(event.spender)}</span>}{event.domain && <span>Domain {event.domain}</span>}{event.nonce !== undefined && <span>Nonce {event.nonce}</span>}{event.chainId !== undefined && <span>Chain {event.chainId}</span>}{event.txHash && <span>Tx {shorten(event.txHash)}</span>}</div><span className="event-status">{event.status}</span></article>)}</div>}</section>;
}
