'use client';

import { useState } from 'react';
import './dashboard.css';

const networks = ['Botchain', 'Ethereum', 'Base', 'Robinhood Chain'];

export default function Dashboard() {
  const [network, setNetwork] = useState(networks[0]);
  const [connected, setConnected] = useState(false);
  return <main className="dashboard">
    <header className="dash-header"><a href="/" className="dash-brand">DEPROTECTOR</a><nav><a href="/phishing-shield">Phishing shield</a><a href="/auto-revoke">Auto-revoke</a><a className="active" href="/dashboard">Dashboard</a></nav><button className="connect" onClick={() => setConnected(!connected)}>{connected ? 'Wallet connected' : 'Connect wallet'}</button></header>
    <section className="dash-main"><p className="eyebrow">SECURITY CONSOLE / {network.toUpperCase()}</p><div className="dash-title-row"><div><h1>Protection dashboard</h1><p className="muted">Connect a wallet to inspect approvals and configure protection.</p></div><div className="network-tabs">{networks.map(item => <button key={item} className={item === network ? 'selected' : ''} onClick={() => setNetwork(item)}>{item}</button>)}</div></div>
      <section className="empty-state"><div className="empty-mark">+</div><h2>{connected ? 'No security data yet' : 'Connect your wallet to begin'}</h2><p>{connected ? 'Approval history and threat signals will appear here when monitoring is enabled.' : 'Deprotector never asks for your seed phrase or private key. You approve every wallet action.'}</p><button className="primary" onClick={() => setConnected(true)}>{connected ? 'Configure monitoring' : 'Connect wallet'}</button></section>
      <section className="dash-grid"><article><p className="eyebrow">PHISHING SHIELD</p><h3>Browser protection</h3><p className="muted">Review blocked domains and suspicious site signals from the extension.</p><span className="status">NOT CONNECTED</span></article><article><p className="eyebrow">AUTO-REVOKE</p><h3>Approval policy</h3><p className="muted">Choose which approvals should require review before any transaction is signed.</p><span className="status">SETUP REQUIRED</span></article></section>
    </section>
  </main>;
}
