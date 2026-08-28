import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from './wallet-context';

export const metadata: Metadata = {
  title: 'Security built into every system layer',
  description: 'Deprotector security controls for resilient Web3 systems.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WalletProvider>{children}</WalletProvider></body></html>;
}
