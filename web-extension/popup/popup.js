document.addEventListener('DOMContentLoaded', async () => {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  const hostname = tab?.url ? new URL(tab.url).hostname : 'Unavailable';
  document.getElementById('site-name').textContent = hostname;

  const stored = await chrome.storage.local.get(['blockedCount', 'lastRisk']);
  document.getElementById('blocked-count').textContent = `${stored.blockedCount || 0} blocked sites`;

  const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS', hostname });
  const badge = document.getElementById('shield-badge');
  const dot = document.getElementById('status-dot');
  const title = document.getElementById('status-title');
  const detail = document.getElementById('status-detail');
  const siteStatus = document.getElementById('site-status');

  if (response?.blocked) {
    badge.textContent = 'BLOCKED';
    dot.className = 'status-dot danger';
    title.textContent = 'Threat blocked';
    siteStatus.textContent = 'Known malicious domain';
    detail.textContent = 'Navigation to this domain was blocked by the local Deprotector blocklist.';
  } else {
    badge.textContent = 'READY';
    dot.className = 'status-dot safe';
    title.textContent = 'Protection ready';
    siteStatus.textContent = 'No blocklist match detected';
    detail.textContent = 'The shield checks domain reputation and page signals before wallet interaction.';
  }

  const health = await fetchHealth();
  document.getElementById('backend-status').textContent = health ? 'Backend online' : 'Backend offline';
  document.getElementById('botchain-status').textContent = health?.primaryNetwork === 'botchain' ? 'PRIMARY / READY' : 'CONFIGURATION REQUIRED';

  document.getElementById('dashboard-btn').addEventListener('click', async () => {
    const settings = await chrome.storage.sync.get({ dashboardUrl: 'http://localhost:3000/dashboard' });
    chrome.tabs.create({ url: settings.dashboardUrl });
  });
  document.getElementById('settings-btn').addEventListener('click', () => chrome.runtime.openOptionsPage());
});

async function fetchHealth() {
  const settings = await chrome.storage.sync.get(['apiBaseUrl']);
  const baseUrl = settings.apiBaseUrl || 'http://localhost:4000';
  try {
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
