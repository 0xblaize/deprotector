document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Load saved options
  chrome.storage.sync.get(["apiBaseUrl", "apiKey", "dashboardUrl", "blocklistShield", "heuristicShield", "l2PreemptiveShield"], (items) => {
    if (items.apiBaseUrl) document.getElementById("apiUrl").value = items.apiBaseUrl;
    if (items.apiKey) document.getElementById("apiKey").value = items.apiKey;
    if (items.dashboardUrl) document.getElementById("dashboardUrl").value = items.dashboardUrl;
    if (items.blocklistShield !== undefined) document.getElementById("blocklistShield").checked = items.blocklistShield;
    if (items.heuristicShield !== undefined) document.getElementById("heuristicShield").checked = items.heuristicShield;
    if (items.l2PreemptiveShield !== undefined) document.getElementById("l2PreemptiveShield").checked = items.l2PreemptiveShield;
  });

  saveBtn.addEventListener("click", () => {
    const apiBaseUrl = document.getElementById("apiUrl").value.replace(/\/$/, '');
    const dashboardUrl = document.getElementById("dashboardUrl").value.replace(/\/$/, '');
    const apiKey = document.getElementById("apiKey").value;
    const blocklistShield = document.getElementById("blocklistShield").checked;
    const heuristicShield = document.getElementById("heuristicShield").checked;
    const l2PreemptiveShield = document.getElementById("l2PreemptiveShield").checked;

    chrome.storage.sync.set({ apiBaseUrl, apiKey, dashboardUrl, blocklistShield, heuristicShield, l2PreemptiveShield }, () => {
      statusMsg.textContent = "Settings saved successfully.";
      setTimeout(() => { statusMsg.textContent = ""; }, 3000);
    });
  });
});
