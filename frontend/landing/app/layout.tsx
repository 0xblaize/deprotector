import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from './wallet-context';

export const metadata: Metadata = {
  title: 'Deprotector — Security built into every system layer',
  description: 'Deprotector security controls for resilient Web3 systems.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="icon" href="/deprotector-mark.svg" type="image/svg+xml" /></head><body><WalletProvider>{children}</WalletProvider></body></html>;
}
