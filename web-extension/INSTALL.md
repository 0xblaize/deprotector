# Deprotector Chrome Shield

This folder is a Manifest V3 Chrome extension. It can be installed free through Chrome Developer Mode until the Chrome Web Store listing is published.

## Install

1. Download and unzip the package.
2. Open `chrome://extensions` in Chrome or Brave.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select this folder, the one containing `manifest.json`.
6. Pin the Deprotector icon to your toolbar.

## Integrated services

The packaged extension is preconfigured to use the Deprotector backend and security console:

- Backend: `https://deprotector.onrender.com`
- Security console: `https://0xprotector.vercel.app/dashboard`

No manual URL configuration is required. Keep blocklist and heuristic protection enabled.

The extension contains no private keys or backend secrets.

## Privacy and safety

The extension does not request seed phrases or private keys. It checks domains and page signals, and optional telemetry is sent only to the configured backend.

The extension does not sign or broadcast wallet transactions on behalf of users.
