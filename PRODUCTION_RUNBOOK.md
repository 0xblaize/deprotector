# Deprotector production deployment

## Architecture

```text
Website       -> Vercel
Backend API   -> Railway / Render / Fly.io / Cloud Run
Chrome shield -> Chrome Web Store when published
Smart account -> Botchain testnet, then mainnet after audit
```

The current system is defensive: it detects threats, blocks known phishing domains, monitors signals, and requires user authorization for wallet actions. It does not custody private keys or sign for ordinary wallets.

## 1. Deploy the website

Vercel project settings:

```text
Root Directory: frontend
Framework: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Set Vercel variables:

```env
NEXT_PUBLIC_APP_URL=https://your-website.example.com
NEXT_PUBLIC_CHROME_WEB_STORE_URL=https://chromewebstore.google.com/detail/your-extension-id
```

The Web Store variable stays empty until the extension is published. Until then, `/phishing-shield` serves the free unpackable ZIP.

## 2. Deploy the backend

Use `backend-engine` as the service root:

```text
Install: npm install
Build: npm run build
Start: npm start
```

Set production variables in the host secret manager:

```env
PORT=4000
BOTCHAIN_NETWORK_NAME=official-botchain-name
BOTCHAIN_CHAIN_ID=official-botchain-chain-id
BOTCHAIN_HTTP_RPC_URL=https://official-botchain-rpc
BOTCHAIN_WS_RPC_URL=wss://official-botchain-ws-rpc
BOTCHAIN_IS_L2=true
TELEMETRY_API_KEY=long-random-secret
CORS_ORIGIN=https://your-website.example.com
REDIS_URL=
DATABASE_URL=
```

Use only official Botchain values. Do not guess RPC URLs or chain IDs.

Verify:

```text
GET https://your-api.example.com/health
```

Expected configured response:

```json
{
  "status": "READY",
  "primaryNetwork": "botchain"
}
```

## 3. Configure the Chrome extension

The extension source is `web-extension`.

Before Chrome Web Store publication, the website download is:

```text
https://your-website.example.com/downloads/deprotector-chrome-shield.zip
```

The ZIP has `manifest.json` at its root and can be loaded in Chrome Developer Mode.

After installation, open Extension options and set:

```text
Backend base URL: https://your-api.example.com
Security console URL: https://your-website.example.com/dashboard
Telemetry API key: same value as TELEMETRY_API_KEY
```

The extension provides:

- Local phishing blocklist checks.
- Suspicious Web3 page-signal detection.
- Current-site status in the popup.
- Persistent blocked-site count.
- Optional authenticated telemetry.
- Botchain-first status display.

## 4. Publish the extension later

When a Chrome Web Store developer account is available:

1. Upload the contents of `web-extension` as a ZIP.
2. Keep `manifest.json` at the ZIP root.
3. Provide privacy and permission disclosures.
4. Add screenshots and support information.
5. Submit for review.
6. Put the approved listing URL into `NEXT_PUBLIC_CHROME_WEB_STORE_URL`.
7. Redeploy the website.

The website cannot silently install a Chrome extension. The Web Store provides the normal **Add to Chrome** flow.

## 5. Prepare smart contracts

The contract project is `smart-contracts`.

Required deployment variables:

```env
BOTCHAIN_HTTP_RPC_URL=https://official-testnet-rpc
BOTCHAIN_CHAIN_ID=official-testnet-chain-id
DEPLOYER_PRIVATE_KEY=testnet-only-key
OWNER_ADDRESS=owner-address
GUARDIAN_ADDRESS=guardian-address
RESCUE_VAULT_ADDRESS=user-controlled-vault
```

Run the deployment preflight in the contract service:

```bash
npm install
npm run preflight
```

Deploy only after preflight passes:

```bash
npm run deploy
```

The deployment script validates the chain ID, deploys `TokenGuard`, deploys `GuardWallet`, links the registry, configures the rescue vault, and prints deployed addresses.

## 6. Contract safety gate

The current `GuardWallet` is a bounded prototype, not a complete ERC-4337 account. Do not use it with mainnet funds until:

- Contract compilation and tests pass.
- Blacklist enforcement is tested.
- Freeze and rescue behavior is tested.
- Guardian governance is reviewed.
- The rescue vault is owner-controlled or multisig-controlled.
- An independent security audit is complete.
- Testnet behavior is verified.

## 7. Final production checks

```text
[ ] Official Botchain details verified
[ ] Backend deployed with HTTPS
[ ] /health returns READY
[ ] TELEMETRY_API_KEY configured
[ ] CORS restricted to website origin
[ ] Website deployed from frontend
[ ] Website routes work: /, /dashboard, /phishing-shield, /auto-revoke
[ ] Extension ZIP contains root manifest.json
[ ] Extension options point to production API and website
[ ] Contract preflight passes
[ ] Contracts tested on Botchain testnet
[ ] Smart-account audit completed before mainnet
[ ] No .env, private keys, node_modules, or .next uploaded
```
