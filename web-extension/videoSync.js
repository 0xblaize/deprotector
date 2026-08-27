// Video Synchronization & Motion Preference Controller

document.addEventListener("DOMContentLoaded", () => {
  const videos = Array.from(document.querySelectorAll("video"));
  if (videos.length === 0) return;

  const master = videos[0];
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Handle prefers-reduced-motion
  function applyMotionPreference(query) {
    if (query.matches) {
      videos.forEach(video => {
        video.pause();
        video.removeAttribute("autoplay");
      });
      console.log("[Video Sync] prefers-reduced-motion detected: All videos paused and autoplay removed.");
    }
  }

  applyMotionPreference(reducedMotionQuery);

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", applyMotionPreference);
  } else if (reducedMotionQuery.addListener) {
    reducedMotionQuery.addListener(applyMotionPreference);
  }

  // Synchronize follower videos with master video on timeupdate
  master.addEventListener("timeupdate", () => {
    if (reducedMotionQuery.matches) return;

    const masterTime = master.currentTime;
    for (let i = 1; i < videos.length; i++) {
      const follower = videos[i];
      if (Math.abs(follower.currentTime - masterTime) > 0.12) {
        follower.currentTime = masterTime;
      }
    }
  });

  // Master play/pause state synchronization
  master.addEventListener("play", () => {
    if (reducedMotionQuery.matches) return;
    videos.slice(1).forEach(v => v.play().catch(() => {}));
  });

  master.addEventListener("pause", () => {
    videos.slice(1).forEach(v => v.pause());
  });
});
