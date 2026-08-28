# Deprotector production runbook

This is the complete setup order for deploying the current defensive MVP. The system is split into four parts because each part has a different runtime:

```text
Website       -> Vercel
Backend API   -> Railway, Render, Fly.io, Cloud Run, or similar Node host
Chrome shield -> Chrome Web Store, or free Developer Mode ZIP before publication
Contracts     -> Botchain testnet first, then mainnet after review
```

The current protection model is defensive and user-authorized. It does not custody private keys, sign for ordinary user wallets, or guarantee automatic rescue of arbitrary EOAs.

## 0. Before deployment

Obtain and verify:

- Official Botchain network name.
- Official Botchain chain ID.
- Official Botchain HTTPS RPC URL.
- Official Botchain WebSocket RPC URL, if supported.
- Website domain.
- Backend API domain.
- Database or Redis service, if persistence is enabled.
- Chrome Web Store developer account, when affordable.
- Testnet owner, guardian, rescue-vault, and deployer addresses.
- Separate RPC credentials for production and testnet.

Never guess a chain ID or RPC URL. Never commit private keys.

## 1. Repository structure

```text
deprotector/
├── frontend/                 # Vercel website project root
│   ├── package.json
│   ├── package-lock.json
│   └── landing/              # Next.js app
│       ├── app/
│       └── public/
├── backend-engine/           # Node/Express API service
│   ├── package.json
│   ├── .env.example
│   └── src/
├── web-extension/            # Manifest V3 Chrome extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup/
│   ├── options/
│   ├── icons/
│   └── rules/
├── smart-contracts/           # Hardhat contract project
│   ├── package.json
│   ├── hardhat.config.ts
│   ├── contracts/
│   ├── scripts/
│   └── test/
├── .env.example
└── PRODUCTION_RUNBOOK.md
```

Do not deploy the repository root as the website. The website root is `frontend`.

## 2. Website deployment: Vercel

Create a Vercel project connected to the repository.

Set:

```text
Root Directory: frontend
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

The build script runs the Next app from `frontend/landing` and writes the output to the Vercel-facing `frontend/.next` directory.

Add this Vercel environment variable:

```env
NEXT_PUBLIC_APP_URL=https://your-website.example.com
```

After Chrome Web Store publication, add:

```env
NEXT_PUBLIC_CHROME_WEB_STORE_URL=https://chromewebstore.google.com/detail/your-extension-id
```

If that variable is absent, `/phishing-shield` provides the free ZIP fallback.

Deploy and verify:

```text
/
/dashboard
/phishing-shield
/auto-revoke
```

The website must not show an “Add to Chrome” Web Store link until the listing URL is real.

## 3. Backend deployment

Deploy `backend-engine` as a separate long-running Node service.

Service settings:

```text
Root Directory: backend-engine
Install Command: npm install
Build Command: npm run build
Start Command: npm start
```

Create backend environment variables from `.env.example`.

Minimum Botchain configuration:

```env
PORT=4000
BOTCHAIN_NETWORK_NAME=official-name
BOTCHAIN_CHAIN_ID=official-chain-id
BOTCHAIN_HTTP_RPC_URL=https://official-rpc
BOTCHAIN_WS_RPC_URL=wss://official-websocket-rpc
BOTCHAIN_IS_L2=true
```

Optional secondary networks can be added only with verified values:

```env
ETH_NETWORK_NAME=
ETH_CHAIN_ID=
ETH_HTTP_RPC_URL=
ETH_WS_RPC_URL=
BASE_NETWORK_NAME=
BASE_CHAIN_ID=
BASE_HTTP_RPC_URL=
BASE_WS_RPC_URL=
ROBINHOOD_NETWORK_NAME=
ROBINHOOD_CHAIN_ID=
ROBINHOOD_HTTP_RPC_URL=
ROBINHOOD_WS_RPC_URL=
```

Backend security variables:

```env
TELEMETRY_API_KEY=long-random-secret
CORS_ORIGIN=https://your-website.example.com
REDIS_URL=
DATABASE_URL=
```

Do not set these for the current alert-only MVP:

```env
GUARDIAN_PRIVATE_KEY=
FLASHBOTS_RELAY_KEY=
```

Verify after deployment:

```text
GET https://your-api.example.com/health
```

A configured primary network should report `READY`. Without Botchain values it should report `CONFIGURATION_REQUIRED`, not pretend to be fully online.

## 4. Connect website and extension to backend

In the extension Options page, set:

```text
Backend base URL: https://your-api.example.com
Security console URL: https://your-website.example.com/dashboard
```

The extension sends telemetry to:

```text
POST https://your-api.example.com/api/telemetry/flag-threat
```

The backend must use HTTPS in production. Restrict CORS to the website domain and do not expose administrative endpoints publicly.

## 5. Free Chrome Developer Mode installation

Until the Web Store listing is published, users can download the package from:

```text
https://your-website.example.com/downloads/deprotector-chrome-shield.zip
```

The ZIP has `manifest.json` at its root and includes `INSTALL.md`.

User steps:

1. Download the ZIP.
2. Extract it.
3. Open `chrome://extensions`.
4. Enable Developer mode.
5. Select **Load unpacked**.
6. Choose the extracted folder containing `manifest.json`.
7. Open Extension options.
8. Set the production backend and dashboard URLs.
9. Pin the extension.

The ZIP must be refreshed whenever extension files change:

```bash
python -c "import zipfile,pathlib; root=pathlib.Path('web-extension'); files=[p for p in root.rglob('*') if p.is_file() and 'video-monitor.html' not in str(p) and 'videoSync.js' not in str(p) and 'filters.svg' not in str(p) and 'STORE_SUBMISSION.md' not in str(p)]; out=pathlib.Path('frontend/landing/public/downloads/deprotector-chrome-shield.zip'); z=zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED); [z.write(p,p.relative_to(root)) for p in files]; z.close()"
```

## 6. Chrome Web Store publication

When you can pay for the developer account:

1. Create the developer account.
2. Upload a ZIP containing `web-extension` contents with `manifest.json` at the root.
3. Provide privacy disclosures for URL checks, page heuristics, and optional telemetry.
4. Add screenshots, support contact, category, and store description.
5. Explain every requested permission.
6. Submit for review.
7. Copy the approved listing URL.
8. Set `NEXT_PUBLIC_CHROME_WEB_STORE_URL` in Vercel.
9. Redeploy the website.

The website cannot silently install a Chrome extension. The Web Store is the normal user installation path.

## 7. Smart-contract deployment

The current contracts are prototypes, not audited ERC-4337 production accounts.

Install and test:

```bash
npm --prefix smart-contracts install
npm --prefix smart-contracts run build
npm --prefix smart-contracts test
```

For testnet deployment, configure a separate contract environment:

```env
BOTCHAIN_HTTP_RPC_URL=https://official-testnet-rpc
BOTCHAIN_CHAIN_ID=official-testnet-chain-id
DEPLOYER_PRIVATE_KEY=testnet-only-key
OWNER_ADDRESS=testnet-owner
GUARDIAN_ADDRESS=testnet-guardian
RESCUE_VAULT_ADDRESS=testnet-user-controlled-vault
```

The current deploy script requires `GUARDIAN_ADDRESS` and deploys `TokenGuard` followed by `GuardWallet`.

Do not deploy to mainnet until:

- Contract tests cover all owner and guardian paths.
- Guardian and rescue vault governance is reviewed.
- TokenGuard integration is tested.
- Reentrancy and ERC-20 return behavior are tested.
- The contract is independently audited.
- The deployer key is held in a secure secret manager.
- The rescue vault is controlled by the intended owner or multisig.

## 8. What the anti-drainer bot does in production

Current safe flow:

```text
Extension checks domain
        -> local blocklist or heuristic signal
        -> optional authenticated telemetry
        -> backend records threat signal
        -> configured Botchain monitor observes supported activity
        -> dashboard presents status
        -> user reviews and authorizes any wallet transaction
```

The current bot does not:

- Sign for arbitrary user wallets.
- Replace an EOA transaction without the user’s signature.
- Automatically transfer user assets.
- Guarantee a protection percentage.
- Override a malicious signature after it has been authorized.

The GuardWallet prototype can enforce policies only for assets held by that smart account. It cannot retroactively control an ordinary MetaMask EOA.

## 9. Pre-launch tests

Website:

```bash
npm --prefix frontend run build
```

Backend:

```bash
npm --prefix backend-engine run build
```

Extension:

```bash
node --check web-extension/background.js
node --check web-extension/content.js
node --check web-extension/popup/popup.js
node --check web-extension/options/options.js
```

Contracts:

```bash
npm --prefix smart-contracts run build
npm --prefix smart-contracts test
```

Manual tests:

- Open the website on desktop and mobile.
- Connect a wallet on Dashboard.
- Open another Deprotector tab and confirm the wallet state is shared.
- Open Phishing Shield and download the ZIP.
- Extract the ZIP and load it in Chrome Developer Mode.
- Visit a safe page and confirm the popup reports a safe/ready state.
- Use a controlled test domain from the blocklist and confirm warning redirect.
- Disable the backend and confirm the extension reports offline, not live.
- Test extension options persistence.
- Test contracts on a testnet only.

## 10. Production launch order

```text
1. Verify Botchain network details.
2. Deploy backend with HTTPS and environment variables.
3. Verify backend /health.
4. Deploy website to Vercel with Root Directory = frontend.
5. Configure the extension with production URLs.
6. Refresh and publish/download the extension package.
7. Test website + extension + backend together.
8. Deploy GuardWallet contracts to testnet.
9. Run contract tests and security review.
10. Publish contracts only after approval.
11. Publish Chrome Web Store listing when affordable.
12. Replace ZIP fallback with official Add to Chrome URL.
```

## 11. Never upload or commit

```text
.env
.env.* except .env.example
private keys
node_modules
.next
frontend/.next
backend-engine/dist when not required
local caches
wallet seed phrases
```
