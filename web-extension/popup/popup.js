document.addEventListener("DOMContentLoaded", () => {
  // Query backend engine health or local storage for stats
  fetch("http://localhost:4000/health")
    .then(res => res.json())
    .then(data => {
      console.log("[Deprotector Engine Connected]:", data);
    })
    .catch(() => {
      console.log("[Deprotector Engine Backend Offline]");
    });
});
