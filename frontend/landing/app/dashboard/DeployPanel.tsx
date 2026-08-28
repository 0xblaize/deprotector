'use client';

import { useState } from 'react';

export default function DeployPanel() {
  const [network, setNetwork] = useState('Botchain');
  const [status, setStatus] = useState('READY FOR CONFIGURATION');
  function deploy() {
    setStatus('WALLET AUTHORIZATION REQUIRED');
  }
  return <section className="deploy-panel"><div><p className="eyebrow">ANTI-DRAINER GUARD</p><h2>Deploy wallet protection</h2><p className="muted">Deploy a GuardWallet for a wallet you control. The guardian can freeze the account during an incident; it cannot sign for your personal wallet.</p></div><div className="deploy-controls"><label><span>Network</span><select value={network} onChange={event => setNetwork(event.target.value)}><option>Botchain</option><option>Ethereum</option><option>Base</option><option>Robinhood Chain</option></select></label><span className="deploy-status">{status}</span><button className="primary" onClick={deploy}>Prepare deployment</button></div></section>;
}
