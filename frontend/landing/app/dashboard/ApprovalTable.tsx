'use client';

import { useState } from 'react';
import type { Approval } from '../wallet-context';
export default function ApprovalTable({ approvals, onRefresh, onRevoke }: { approvals: Approval[]; onRefresh: () => Promise<void>; onRevoke: (approval: Approval) => Promise<void> }) {
  const [busy, setBusy] = useState<string | null>(null);
  return <section className="approval-panel"><div className="panel-heading"><div><p className="eyebrow">APPROVAL INSPECTION</p><h2>Configured allowances</h2></div><button className="secondary" onClick={onRefresh}>Refresh</button></div>{approvals.length === 0 ? <p className="muted">No token targets configured. Add NEXT_PUBLIC_APPROVAL_TARGETS to enable read-only inspection.</p> : <div className="approval-list">{approvals.map(approval => <div className="approval-row" key={`${approval.token}-${approval.spender}`}><div><strong>{approval.symbol}</strong><small>{approval.label}</small></div><code>{approval.loading ? 'READING...' : approval.error || approval.allowance || '0'}</code><button className="primary" disabled={busy === approval.spender || approval.loading || approval.error !== undefined || approval.allowance === '0'} onClick={async () => { setBusy(approval.spender); try { await onRevoke(approval); } catch { } finally { setBusy(null); } }}>{busy === approval.spender ? 'Confirming...' : 'Revoke'}</button></div>)}</div>}</section>;
}

