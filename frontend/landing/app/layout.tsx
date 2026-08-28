import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from './wallet-context';

export const metadata: Metadata = {
  title: 'Deprotector — Security built into every system layer',
  icons: { icon: '/brand/deprotector-mark.svg' },
  description: 'Deprotector security controls for resilient Web3 systems.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WalletProvider>{children}</WalletProvider></body></html>;
}
