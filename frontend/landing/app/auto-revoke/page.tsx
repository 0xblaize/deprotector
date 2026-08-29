'use client';

import '../dashboard/dashboard.css';
import WalletButton from '../wallet-button';
import Brand from '../brand';
import ApprovalTable from '../dashboard/ApprovalTable';
import { useWallet } from '../wallet-context';

export default function AutoRevoke() {
  const { wallet, approvals, connect, refreshApprovals, revokeApproval, message } = useWallet();
  return <main className="dashboard"><header className="dash-header"><Brand /><nav><a href="/phishing-shield">Phishing shield</a><a className="active" href="/auto-revoke">Auto-revoke</a><a href="/dashboard">Dashboard</a></nav><WalletButton /></header><section className="dash-main"><p className="eyebrow">PRODUCT / APPROVAL CONTROL</p><h1>Auto-revoke</h1><p className="muted">Inspect token allowances and prepare revocations only after you review and approve the transaction in your own wallet.</p>{wallet ? <><p className="muted">{message}</p><ApprovalTable approvals={approvals} onRefresh={refreshApprovals} onRevoke={revokeApproval} /></> : <section className="empty-state"><div className="empty-mark">02</div><h2>Connect a wallet to inspect approvals</h2><p>Deprotector does not custody keys or sign transactions for you. Once connected, the console can show allowance details and prepare user-authorized revoke actions.</p><button className="primary" onClick={connect}>Connect wallet</button></section>}</section></main>;
}
