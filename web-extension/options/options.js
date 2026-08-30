const DEFAULTS = {
  apiBaseUrl: "https://deprotector.onrender.com",
  dashboardUrl: "https://0xprotector.vercel.app/dashboard",
  blocklistShield: true,
  heuristicShield: true,
  l2PreemptiveShield: true
};

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  chrome.storage.sync.get({ ...DEFAULTS, apiKey: "" }, (items) => {
    document.getElementById("apiUrl").value = items.apiBaseUrl;
    document.getElementById("apiKey").value = items.apiKey;
    document.getElementById("dashboardUrl").value = items.dashboardUrl;
    document.getElementById("blocklistShield").checked = items.blocklistShield;
    document.getElementById("heuristicShield").checked = items.heuristicShield;
    document.getElementById("l2PreemptiveShield").checked = items.l2PreemptiveShield;
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
