'use client';

import { useWallet } from './wallet-context';

export default function WalletButton() {
  const { wallet, connect } = useWallet();
  const label = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Connect wallet';
  return <button className="connect" onClick={connect}>{label}</button>;
}
