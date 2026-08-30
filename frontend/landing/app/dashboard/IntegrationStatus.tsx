'use client';

const FACTORY = process.env.NEXT_PUBLIC_GUARD_FACTORY_ADDRESS || '';
const TARGET_COUNT = (process.env.NEXT_PUBLIC_APPROVAL_TARGETS || '').split(',').map(value => value.trim()).filter(Boolean).length;
const CHAIN_ID = process.env.NEXT_PUBLIC_BOTCHAIN_CHAIN_ID || '677';

export default function IntegrationStatus({ wallet, chainId }: { wallet: string | null; chainId: string | null }) {
  const connectedChain = chainId ? Number.parseInt(chainId, 16).toString() : 'not connected';
  return <section className="integration-panel"><div className="panel-heading"><div><p className="eyebrow">SYSTEM INTEGRATION</p><h2>Protection services</h2></div><span className="status">LIVE CONFIGURATION</span></div><div className="integration-grid"><div><strong>Backend engine</strong><span className="integration-value">https://deprotector.onrender.com</span><small>Health and security events API</small></div><div><strong>Botchain</strong><span className="integration-value">Chain {CHAIN_ID}</span><small>Wallet chain: {connectedChain}</small></div><div><strong>GuardFactory</strong><span className={`integration-value ${FACTORY ? '' : 'missing'}`}>{FACTORY ? FACTORY : 'Not configured'}</span><small>{FACTORY ? 'Ready for user-authorized deployment' : 'Set NEXT_PUBLIC_GUARD_FACTORY_ADDRESS in Vercel'}</small></div><div><strong>Approval targets</strong><span className={`integration-value ${TARGET_COUNT ? '' : 'missing'}`}>{TARGET_COUNT ? `${TARGET_COUNT} configured` : 'Not configured'}</span><small>{TARGET_COUNT ? 'Allowance inspection enabled' : 'Set NEXT_PUBLIC_APPROVAL_TARGETS in Vercel'}</small></div></div>{!wallet && <p className="muted integration-note">Connect a wallet to read allowances or request a user-approved GuardWallet deployment.</p>}</section>;
}
