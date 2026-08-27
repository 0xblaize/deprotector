// Deprotector Service Worker Background Script

const BACKEND_ENGINE_URL = "http://localhost:4000/api/telemetry/flag-threat";

let BANNED_DOMAINS = [
  "metamask-airdrop-claim.com",
  "free-bored-ape-mint.net",
  "blur-rewards-claim.xyz",
  "drainer-kit-test.xyz",
  "claim-pepe-tokens.info",
  "uniswap-v4-early-access.com",
  "opensea-verification-pass.net",
  "phantom-solana-airdrop.org",
  "robinhood-crypto-claim.xyz",
  "base-l2-bridge-rewards.com"
];

// Fetch dynamic blocklist on startup
async function refreshBlocklist() {
  try {
    const res = await fetch(chrome.runtime.getURL("rules/blocklist.json"));
    if (res.ok) {
      BANNED_DOMAINS = await res.json();
      console.log("[Deprotector Shield] Blocklist updated with", BANNED_DOMAINS.length, "domains.");
    }
  } catch (err) {
    console.error("[Deprotector Shield] Failed to fetch local blocklist:", err);
  }
}

refreshBlocklist();

// Watch for tab navigations
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Main page loads only

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace("www.", "").toLowerCase();

    if (BANNED_DOMAINS.includes(hostname)) {
      console.warn(`[Deprotector Interceptor] Blocked malicious Web3 phishing portal: ${hostname}`);

      // Dispatch alert payload to Deprotector Counter-Drainer Engine backend
      dispatchTelemetryAlert(hostname, "HIGH_THREAT");

      // Redirect browser tab to warning page
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("warning.html") + "?domain=" + encodeURIComponent(hostname)
      });
    }
  } catch (e) {
    console.error("[Deprotector Interceptor] URL parsing error:", e);
  }
});

// Listen for messages from content.js heuristics scanner
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "HEURISTIC_DRAINER_DETECTED") {
    console.warn(`[Deprotector Heuristics] Drainer signatures detected on tab ${sender.tab.id}: ${message.domain}`);
    dispatchTelemetryAlert(message.domain, "HEURISTIC_FLAG");
    sendResponse({ status: "ACKNOWLEDGED" });
  }
});

function dispatchTelemetryAlert(domain, threatLevel) {
  fetch(BACKEND_ENGINE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: domain,
      threatLevel: threatLevel,
      timestamp: Date.now()
    })
  }).then(res => res.json())
    .then(data => console.log("[Deprotector Backend Response]:", data))
    .catch(err => console.error("[Deprotector Backend Offline]:", err.message));
}
