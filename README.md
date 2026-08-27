# Deprotector: Multi-Chain Anti-Drainer Security Engine

**Deprotector** is an **Automated Revocation & Counter-Drainer Engine** built to protect Web3 users against malicious wallet drainers, deceptive token approvals (`approve`, `setApprovalForAll`, `increaseAllowance`, `permit`), and phishing sites across **Ethereum Mainnet**, **Base L2**, and **Robinhood Chain (Arbitrum Orbit L2)**.

---

## Modular Architecture Overview

### 1. Backend Counter-Drainer Engine (`/backend-engine`)
- **Real-Time Mempool Streamer** (`src/mempool/stream.ts`): Subscribes to pending transactions via WebSocket RPC.
- **Call-Data Decoder** (`src/mempool/decoder.ts`): Identifies approval selectors and extracts spender parameters.
- **Ethereum MEV Frontrunner** (`src/execution/ethereum_mev.ts`): Packages EIP-1559 0-ETH self-transfers into private Flashbots block bundles targeting identical transaction nonces.
- **L2 Sequencer Blaster** (`src/execution/l2_sequencer_blaster.ts`): Outruns drainers on Base and Robinhood Chain using multi-node queue dominance blasting.
- **Telemetry Webhook API** (`src/api/webhook.ts`): Endpoint receiving live threat alerts from the browser extension.

### 2. Browser Security Extension (`/web-extension`)
- **Manifest V3 Service Worker** (`background.js`): Intercepts web navigation requests against known phishing domain blocklists.
- **DOM Heuristics Inspector** (`content.js`): Scans active webpage code for obfuscated drainer kit signatures.
- **Threat Warning Portal** (`warning.html`): Intercepts traffic to malicious sites with SVG alert interfaces.
- **Popup Dashboard** (`popup/`): Live status indicator for guarded networks and telemetry engine health.

### 3. Smart Contracts (`/smart-contracts`)
- **ERC-4337 Smart Account Wallet** (`GuardWallet.sol`): Dual-signature co-signing wallet with emergency freezing and token sweeping functionality.
- **On-Chain Blacklist Registry** (`TokenGuard.sol`): Registry for storing verified drainer spender contract addresses on-chain.

### 4. Frontend Web Applications (`/frontend`)
- **Cybersecurity Landing Page** (`frontend/landing/`): Vite-powered landing page featuring fixed viewport responsive canvas scaling, triple-synchronized background video layers, SVG color grading, and WAAPI entrance choreography.

---

## Quick Start & Running locally

### Prerequisites
- Node.js (v18+ recommended)
- TypeScript

### 1. Launch Frontend Landing Page
```bash
cd frontend/landing
npm install
npm run dev
```

### 2. Launch Backend Engine
```bash
cd backend-engine
cp .env.example .env
npm install
npm run dev
```

### 3. Install Web Extension
1. Open Google Chrome or Brave browser.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the `deprotector/web-extension` directory.

---

## Defensive Execution Flow
1. **Phishing Interception**: The Web Extension catches phishing sites via blocklist or DOM heuristics and flags the user's wallet address to the Backend Telemetry Webhook.
2. **Ethereum Frontrunning**: If a pending approval transaction is broadcast on Ethereum L1, the backend constructs a Flashbots bundle with the same nonce and higher gas priority fee, consuming the nonce so the drainer transaction fails.
3. **L2 Invalidation**: On Base and Robinhood Chain, the backend triggers queue dominance nonce invalidation to burn the pending sequence slot ahead of the drainer.
