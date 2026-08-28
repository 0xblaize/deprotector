(async function scanPageForDrainerSignals() {
  const settings = await chrome.storage.sync.get({ heuristicShield: true });
  if (!settings.heuristicShield) return;

  const signals = [
    'setapprovalforall',
    'increaseallowance',
    'eth_signtypeddata_v4',
    'permit2_approve',
    'claimrewardsbutton',
    'drainer_init',
    'asset_claim_modal'
  ];
  const pageContent = document.documentElement.innerHTML.toLowerCase();
  const matched = signals.filter(signal => pageContent.includes(signal));

  if (matched.length >= 2) {
    chrome.runtime.sendMessage({
      type: 'HEURISTIC_DRAINER_DETECTED',
      domain: window.location.hostname,
      signatures: matched
    });
  }
})();
