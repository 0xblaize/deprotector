// Deprotector Heuristic DOM Scanner Script

(function scanPageForDrainerSignatures() {
  const pageContent = document.documentElement.innerHTML.toLowerCase();

  // Known Drainer-as-a-Service (DaaS) signature substrings
  const RISK_SIGNATURES = [
    "setapprovalforall",
    "increaseallowance",
    "eth_signtypeddata_v4",
    "claimrewardsbutton",
    "drainer_init",
    "seaport_fulfillorder",
    "permit2_approve",
    "asset_claim_modal"
  ];

  let detectedCount = 0;
  const matchedSignatures = [];

  RISK_SIGNATURES.forEach(sig => {
    if (pageContent.includes(sig)) {
      detectedCount++;
      matchedSignatures.push(sig);
    }
  });

  if (detectedCount >= 2) {
    console.warn(`[Deprotector Heuristics] Warning: Site displays ${detectedCount} malicious Web3 drainer script patterns:`, matchedSignatures);

    // Communicate threat to background service worker
    chrome.runtime.sendMessage({
      type: "HEURISTIC_DRAINER_DETECTED",
      domain: window.location.hostname,
      signatures: matchedSignatures
    });
  }
})();
