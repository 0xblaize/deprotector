# Chrome Web Store release checklist

1. Create a Chrome Web Store developer account.
2. Package the contents of `web-extension` without node_modules, `.env`, or local caches.
3. Confirm `manifest.json` uses the included 16, 48, and 128 pixel icons.
4. Provide a privacy policy explaining blocklist checks, page heuristics, and optional telemetry.
5. Request only the permissions required for the published behavior.
6. Upload the ZIP in the Chrome Web Store developer dashboard.
7. Complete the store listing, screenshots, category, support contact, and data-use disclosures.
8. Submit for review.
9. After publication, set `NEXT_PUBLIC_CHROME_WEB_STORE_URL` in the website deployment to the approved listing URL.

The website cannot silently install an extension. The Chrome Web Store listing is the normal Add to Chrome path.
