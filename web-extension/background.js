const DEFAULT_API_BASE_URL = 'http://localhost:4000';
let BANNED_DOMAINS = [];

async function getSettings() {
  return chrome.storage.sync.get({
    apiBaseUrl: DEFAULT_API_BASE_URL,
    blocklistShield: true,
    heuristicShield: true
  });
}

async function refreshBlocklist() {
  try {
    const response = await fetch(chrome.runtime.getURL('rules/blocklist.json'));
    if (response.ok) BANNED_DOMAINS = await response.json();
  } catch (error) {
    console.warn('[Deprotector] Blocklist unavailable', error);
  }
}

function normalizeHost(hostname) {
  return hostname.replace(/^www\./, '').toLowerCase();
}

function isBlocked(hostname) {
  const host = normalizeHost(hostname);
  return BANNED_DOMAINS.some(domain => host === domain || host.endsWith(`.${domain}`));
}

async function recordBlockedSite() {
  const { blockedCount = 0 } = await chrome.storage.local.get('blockedCount');
  await chrome.storage.local.set({ blockedCount: blockedCount + 1 });
}

async function dispatchTelemetryAlert(domain, threatLevel, signatures = []) {
  const settings = await getSettings();
  try {
    await fetch(`${settings.apiBaseUrl}/api/telemetry/flag-threat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(settings.apiKey ? { 'x-api-key': settings.apiKey } : {}) },
      body: JSON.stringify({ domain, threatLevel, signatures, timestamp: Date.now() })
    });
  } catch (error) {
    console.warn('[Deprotector] Backend offline');
  }
}

chrome.runtime.onInstalled.addListener(refreshBlocklist);
refreshBlocklist();

chrome.webNavigation.onBeforeNavigate.addListener(async details => {
  if (details.frameId !== 0) return;
  const settings = await getSettings();
  if (!settings.blocklistShield) return;
  try {
    const url = new URL(details.url);
    if (!isBlocked(url.hostname)) return;
    await recordBlockedSite();
    await dispatchTelemetryAlert(normalizeHost(url.hostname), 'HIGH_THREAT');
    await chrome.tabs.update(details.tabId, { url: `${chrome.runtime.getURL('warning.html')}?domain=${encodeURIComponent(normalizeHost(url.hostname))}` });
  } catch (error) {
    console.warn('[Deprotector] Navigation check failed', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ blocked: isBlocked(message.hostname || '') });
    return true;
  }
  if (message.type === 'HEURISTIC_DRAINER_DETECTED') {
    dispatchTelemetryAlert(message.domain, 'HEURISTIC_FLAG', message.signatures || []);
    sendResponse({ status: 'ACKNOWLEDGED' });
    return true;
  }
});
