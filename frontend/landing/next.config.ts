import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: '../.next',
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
