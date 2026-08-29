'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { APPROVAL_TARGETS, type ApprovalTarget } from './approval-config';

type WalletProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };
declare global { interface Window { ethereum?: WalletProvider } }

export type Approval = ApprovalTarget & { allowance: string; loading: boolean; error?: string };
type WalletContextValue = { wallet: string | null; chainId: string | null; approvals: Approval[]; connect: () => Promise<void>; refreshApprovals: () => Promise<void>; revokeApproval: (approval: Approval) => Promise<void>; message: string };
const WalletContext = createContext<WalletContextValue | null>(null);

function word(value: string) { return value.replace(/^0x/, '').padStart(64, '0'); }
function address(value: string) { return /^0x[a-f-fA-F0-9]{40}$/.test(value); }

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [message, setMessage] = useState('Connect a wallet to begin.');

  useEffect(() => {
    const saved = localStorage.getItem('deprotector.wallet');
    const savedChain = localStorage.getItem('deprotector.chainId');
    if (saved) setWallet(saved);
    if (savedChain) setChainId(savedChain);
    const handleAccounts = (...args: unknown[]) => { const account = (args[0] as string[] | undefined)?.[0] || null; setWallet(account); account ? localStorage.setItem('deprotector.wallet', account) : localStorage.removeItem('deprotector.wallet'); };
    const handleChain = (...args: unknown[]) => { const nextChain = args[0] as string; setChainId(nextChain); localStorage.setItem('deprotector.chainId', nextChain); };
    const handleStorage = (event: StorageEvent) => { if (event.key === 'deprotector.wallet') setWallet(event.newValue); if (event.key === 'deprotector.chainId') setChainId(event.newValue); };
    window.ethereum?.on?.('accountsChanged', handleAccounts);
    window.ethereum?.on?.('chainChanged', handleChain);
    window.addEventListener('storage', handleStorage);
    return () => { window.ethereum?.removeListener?.('accountsChanged', handleAccounts); window.ethereum?.removeListener?.('chainChanged', handleChain); window.removeEventListener('storage', handleStorage); };
  }, []);

  async function connect() {
    if (!window.ethereum) { setMessage('No browser wallet detected.'); return; }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const activeChain = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      const account = accounts[0] || null;
      setWallet(account); setChainId(activeChain || null); setMessage('Wallet connected across Deprotector tabs.');
      if (account) localStorage.setItem('deprotector.wallet', account);
      if (activeChain) localStorage.setItem('deprotector.chainId', activeChain);
      await refreshApprovals(account);
    } catch { setMessage('Wallet connection was cancelled.'); }
  }

  async function refreshApprovals(account = wallet) {
    if (!window.ethereum || !account) return;
    const next = APPROVAL_TARGETS.map(target => ({ ...target, allowance: '', loading: true }));
    setApprovals(next);
    const results = await Promise.all(next.map(async approval => {
      if (!address(approval.token) || !address(approval.spender)) return { ...approval, loading: false, error: 'Invalid configured address' };
      try {
        const data = `0xdd62ed3e${word(account)}${word(approval.spender)}`;
        const result = await window.ethereum!.request({ method: 'eth_call', params: [{ to: approval.token, data }, 'latest'] }) as string;
        return { ...approval, allowance: BigInt(result || '0x0').toString(), loading: false };
      } catch { return { ...approval, loading: false, error: 'Unable to read allowance' }; }
    }));
    setApprovals(results);
  }

  async function revokeApproval(approval: Approval) {
    if (!window.ethereum || !wallet) throw new Error('Connect a wallet first');
    if (!address(approval.token) || !address(approval.spender)) throw new Error('Invalid approval configuration');
    const data = `0x095ea7b3${word(approval.spender)}${word('0x0')}`;
    try {
      await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from: wallet, to: approval.token, data }] });
      setMessage(`Revocation submitted for ${approval.symbol}.`);
      await refreshApprovals(wallet);
    } catch {
      setMessage(`Revocation was cancelled or failed for ${approval.symbol}.`);
      throw new Error('Revocation failed');
    }
  }

  return <WalletContext.Provider value={{ wallet, chainId, approvals, connect, refreshApprovals: () => refreshApprovals(), revokeApproval, message }}>{children}</WalletContext.Provider>;
}

export function useWallet() { const context = useContext(WalletContext); if (!context) throw new Error('useWallet must be used inside WalletProvider'); return context; }
