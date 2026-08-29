'use client';

import { useState } from 'react';
import { useWallet } from '../wallet-context';

const FACTORY = process.env.NEXT_PUBLIC_GUARD_FACTORY_ADDRESS || '';
const FACTORY_DEPLOY_SELECTOR = '0xfe490b66';

export default function DeployPanel() {
  const { wallet, chainId, connect } = useWallet();
  const [rescueVault, setRescueVault] = useState('');
  const [status, setStatus] = useState('WALLET CONNECTION REQUIRED');

  async function deploy() {
    if (!wallet) { await connect(); return; }
    if (!window.ethereum) { setStatus('NO BROWSER WALLET'); return; }
    if (!FACTORY) { setStatus('FACTORY ADDRESS NOT CONFIGURED'); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(rescueVault || wallet)) { setStatus('INVALID RESCUE VAULT'); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(FACTORY)) { setStatus('INVALID FACTORY CONFIGURATION'); return; }
    setStatus(`CONFIRM DEPLOYMENT ON CHAIN ${chainId || 'UNKNOWN'}`);
    try {
      const data = `${FACTORY_DEPLOY_SELECTOR}${rescueVault.replace(/^0x/, '').padStart(64, '0')}`;
      const hash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: FACTORY, data }] });
      setStatus(`DEPLOYMENT SUBMITTED: ${String(hash).slice(0, 12)}...`);
    } catch { setStatus('DEPLOYMENT CANCELLED'); }
  }

  return <section className="deploy-panel"><div><p className="eyebrow">ANTI-DRAINER GUARD</p><h2>Deploy wallet protection</h2><p className="muted">Deploy a GuardWallet for the connected wallet. Your wallet signs the deployment; Deprotector never receives your private key.</p></div><div className="deploy-controls"><label><span>Rescue vault</span><input value={rescueVault} onChange={event => setRescueVault(event.target.value)} placeholder={wallet || '0x...'} /></label><span className="deploy-status">{status}</span><button className="primary" onClick={deploy}>{wallet ? 'Deploy protection' : 'Connect wallet'}</button></div></section>;
}
