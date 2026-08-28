document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Load saved options
  chrome.storage.sync.get(["apiUrl", "blocklistShield", "heuristicShield"], (items) => {
    if (items.apiUrl) document.getElementById("apiUrl").value = items.apiUrl;
    if (items.blocklistShield !== undefined) document.getElementById("blocklistShield").checked = items.blocklistShield;
    if (items.heuristicShield !== undefined) document.getElementById("heuristicShield").checked = items.heuristicShield;
  });

  saveBtn.addEventListener("click", () => {
    const apiUrl = document.getElementById("apiUrl").value.replace(/\/$/, '');
    const blocklistShield = document.getElementById("blocklistShield").checked;
    const heuristicShield = document.getElementById("heuristicShield").checked;

    chrome.storage.sync.set({ apiUrl, blocklistShield, heuristicShield }, () => {
      statusMsg.textContent = "Settings saved successfully.";
      setTimeout(() => { statusMsg.textContent = ""; }, 3000);
    });
  });
});
