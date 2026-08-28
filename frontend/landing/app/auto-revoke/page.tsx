import '../dashboard/dashboard.css';
import DeployPanel from '../dashboard/DeployPanel';

export default function AutoRevoke() {
  return <main className="dashboard"><header className="dash-header"><a href="/" className="dash-brand">DEPROTECTOR</a><nav><a href="/phishing-shield">Phishing shield</a><a className="active" href="/auto-revoke">Auto-revoke</a><a href="/dashboard">Dashboard</a></nav><a className="connect" href="/dashboard">Open console</a></header><section className="dash-main"><DeployPanel /><p className="eyebrow">PRODUCT / APPROVAL CONTROL</p><h1>Auto-revoke</h1><p className="muted">Inspect token allowances and prepare revocations only after you review and approve the transaction in your own wallet.</p><section className="empty-state"><div className="empty-mark">02</div><h2>Connect a wallet to inspect approvals</h2><p>Deprotector does not custody keys or sign transactions for you. Once connected, the console can show allowance details and prepare user-authorized revoke actions.</p><a className="primary" href="/dashboard">Connect in console</a></section></section></main>;
}
