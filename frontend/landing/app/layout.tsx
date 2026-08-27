import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Security built into every system layer',
  description: 'Deprotector security controls for resilient Web3 systems.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
