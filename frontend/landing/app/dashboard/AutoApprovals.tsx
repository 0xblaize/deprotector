'use client';

import { useEffect, useState } from 'react';

type Approval = { chain: string; chainId: number; token: string; spender: string; allowance: string; kind: string; blockNumber: number; transactionHash: string; risk: 'HIGH' | 'MEDIUM' | 'LOW'; riskScore: number; riskReasons: string[] };
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://deprotector.onrender.com').trim().replace(/\/+$/, '');
function shorten(value: string) { return `${value.slice(0, 8)}...${value.slice(-6)}`; }

export default function AutoApprovals({ wallet }: { wallet: string | null }) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [state, setState] = useState('Connect a wallet to scan all configured chains.');
  useEffect(() => {
    if (!wallet) { setApprovals([]); setState('Connect a wallet to scan all configured chains.'); return; }
    let active = true;
    setState('Scanning Botchain, Ethereum, Base, and Robinhood...');
    fetch(`${API_BASE}/api/approvals/${wallet}`, { cache: 'no-store' }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`); return data; }).then(data => { if (active) { setApprovals(data.approvals || []); setState(`${(data.approvals || []).length} active approvals found.`); } }).catch(error => { if (active) setState(`Scan failed: ${error instanceof Error ? error.message : 'unknown error'}`); });
    return () => { active = false; };
  }, [wallet]);
  return <section className="approval-panel"><div className="panel-heading"><div><p className="eyebrow">AUTOMATIC MULTI-CHAIN SCAN</p><h2>Discovered approvals</h2></div><span className="status">{wallet ? 'RPC SCAN' : 'WALLET REQUIRED'}</span></div><p className="muted">{state}</p>{approvals.length > 0 && <div className="approval-list">{approvals.map(approval => <div className="approval-row" key={`${approval.chain}-${approval.token}-${approval.spender}`}><div><strong>{approval.chain} · {approval.kind}</strong><small>Token {shorten(approval.token)} · Spender {shorten(approval.spender)}</small><small>{approval.riskReasons.join(' · ')}</small></div><code>{approval.allowance}</code><span className={`event-status risk-${approval.risk.toLowerCase()}`}>{approval.risk} / {approval.riskScore}</span></div>)}</div>}</section>;
}
