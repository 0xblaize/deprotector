# Deprotector upload structure

## Website

Upload/deploy `frontend` as the Vercel project root.

- Framework: Next.js
- Install: `npm install`
- Build: `npm run build`
- Output: `.next`
- Public brand assets: `landing/public/brand`
- Extension download: `landing/public/downloads/deprotector-chrome-shield.zip`

Required frontend environment variables:

- `NEXT_PUBLIC_CHROME_WEB_STORE_URL` after Chrome Web Store publication

## Backend

Deploy `backend-engine` as a separate Node service.

- Install: `npm install`
- Build: `npm run build`
- Start: `npm start`

Copy `.env.example` to `.env` and provide only official RPC values. Never commit `.env`.

Botchain is the primary network, but remains disabled until its official network name, chain ID, and RPC URLs are supplied.

## Chrome extension

The extension source is `web-extension`. The website ZIP contains only runtime files. For a normal user install, publish the extension through the Chrome Web Store and set `NEXT_PUBLIC_CHROME_WEB_STORE_URL` to the approved listing URL.

Developer Mode is only a pre-publication fallback.

## Smart contracts

Deploy from `smart-contracts` only after testnet verification and an independent security review. Install dependencies with `npm install`, compile with `npm run build`, test with `npm test`, and deploy with `npm run deploy` after setting `BOTCHAIN_HTTP_RPC_URL`, `BOTCHAIN_CHAIN_ID`, `DEPLOYER_PRIVATE_KEY`, and `GUARDIAN_ADDRESS` in the contract service environment. The current GuardWallet is a bounded security prototype, not a complete ERC-4337 account.

## Do not upload

- `.env` files
- private keys
- `node_modules`
- `.next`
- backend `dist` unless the host specifically requires built artifacts
- local caches and editor files
