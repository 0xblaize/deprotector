'use client';

import { useEffect, useState } from 'react';
import './dashboard.css';

declare global { interface Window { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void; }; } }

const networks = [
  { name: 'Botchain', chainId: undefined },
  { name: 'Ethereum', chainId: 1 },
  { name: 'Base', chainId: 8453 },
  { name: 'Robinhood Chain', chainId: 4663 }
];

function shorten(address: string) { return `${address.slice(0, 6)}...${address.slice(-4)}`; }

export default function Dashboard() {
  const [network, setNetwork] = useState(networks[0]);
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [message, setMessage] = useState('Connect a wallet to begin.');

  async function connectWallet() {
    if (!window.ethereum) { setMessage('No browser wallet detected. Install a wallet extension to continue.'); return; }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const activeChain = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      setWallet(accounts[0] || null); setChainId(activeChain || null); setMessage('Wallet connected. Approval inspection is read-only until you approve an action.');
    } catch { setMessage('Wallet connection was cancelled.'); }
  }

  useEffect(() => {
    const handleAccounts = (...args: unknown[]) => setWallet((args[0] as string[] | undefined)?.[0] || null);
    const handleChain = (...args: unknown[]) => setChainId(args[0] as string);
    window.ethereum?.on?.('accountsChanged', handleAccounts);
    window.ethereum?.on?.('chainChanged', handleChain);
    return () => { window.ethereum?.removeListener?.('accountsChanged', handleAccounts); window.ethereum?.removeListener?.('chainChanged', handleChain); };
  }, []);

  const selectedConfigured = network.name !== 'Botchain';
  return <main className="dashboard">
    <header className="dash-header"><a href="/" className="dash-brand">DEPROTECTOR</a><nav><a href="/phishing-shield">Phishing shield</a><a href="/auto-revoke">Auto-revoke</a><a className="active" href="/dashboard">Dashboard</a></nav><button className="connect" onClick={connectWallet}>{wallet ? shorten(wallet) : 'Connect wallet'}</button></header>
    <section className="dash-main"><p className="eyebrow">SECURITY CONSOLE / {network.name.toUpperCase()}</p><div className="dash-title-row"><div><h1>Protection dashboard</h1><p className="muted">{wallet ? `${shorten(wallet)} · ${message}` : message}</p></div><div className="network-tabs">{networks.map(item => <button key={item.name} className={item.name === network.name ? 'selected' : ''} onClick={() => setNetwork(item)}>{item.name}</button>)}</div></div>
      <section className="empty-state"><div className="empty-mark">{wallet ? 'OK' : '+'}</div><h2>{wallet ? 'Wallet connected' : 'Connect your wallet to begin'}</h2><p>{wallet ? (selectedConfigured ? `Connected chain ID: ${chainId || 'unknown'}. Read-only approval inspection can be enabled for ${network.name}.` : 'Botchain is the primary network, but its official RPC and chain ID still need to be configured.') : 'Deprotector never asks for your seed phrase or private key. You approve every wallet action in your wallet.'}</p><button className="primary" onClick={connectWallet}>{wallet ? 'Refresh wallet' : 'Connect wallet'}</button></section>
      <section className="dash-grid"><article><p className="eyebrow">PHISHING SHIELD</p><h3>Browser protection</h3><p className="muted">Review blocked domains and suspicious site signals from the extension.</p><span className="status">{wallet ? 'READY FOR REVIEW' : 'WALLET NOT CONNECTED'}</span></article><article><p className="eyebrow">AUTO-REVOKE</p><h3>Approval policy</h3><p className="muted">Revocations will always be prepared for your wallet to review and sign.</p><span className="status">{wallet ? 'USER AUTHORIZATION REQUIRED' : 'SETUP REQUIRED'}</span></article></section>
    </section>
  </main>;
}
