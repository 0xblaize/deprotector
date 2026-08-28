'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type WalletProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on?: (event: string, handler: (...args: unknown[]) => void) => void; removeListener?: (event: string, handler: (...args: unknown[]) => void) => void };
declare global { interface Window { ethereum?: WalletProvider } }

type WalletContextValue = { wallet: string | null; chainId: string | null; connect: () => Promise<void>; message: string };
const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [message, setMessage] = useState('Connect a wallet to begin.');

  useEffect(() => {
    const saved = localStorage.getItem('deprotector.wallet');
    const savedChain = localStorage.getItem('deprotector.chainId');
    if (saved) setWallet(saved);
    if (savedChain) setChainId(savedChain);
    const handleAccounts = (...args: unknown[]) => { const account = (args[0] as string[] | undefined)?.[0] || null; setWallet(account); account ? localStorage.setItem('deprotector.wallet', account) : localStorage.removeItem('deprotector.wallet'); };
    const handleChain = (...args: unknown[]) => { const nextChain = args[0] as string; setChainId(nextChain); localStorage.setItem('deprotector.chainId', nextChain); };
    window.ethereum?.on?.('accountsChanged', handleAccounts);
    window.ethereum?.on?.('chainChanged', handleChain);
    const handleStorage = (event: StorageEvent) => { if (event.key === 'deprotector.wallet') setWallet(event.newValue); if (event.key === 'deprotector.chainId') setChainId(event.newValue); };
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
    } catch { setMessage('Wallet connection was cancelled.'); }
  }

  return <WalletContext.Provider value={{ wallet, chainId, connect, message }}>{children}</WalletContext.Provider>;
}

export function useWallet() { const context = useContext(WalletContext); if (!context) throw new Error('useWallet must be used inside WalletProvider'); return context; }
