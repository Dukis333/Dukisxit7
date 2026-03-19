/*
  Créditos:
  Email: marcosxxt658@gmail.com
  WhatsApp: https://wa.me/5593981160223
  Instagram: @marcos_xll77
*/
(function () {
  const audio = new Audio("./DJ MU540  Submundo 808 DJ SET  Campinas_SP - SUBMUNDO 808 (youtube).mp3");
  audio.preload = "auto";
  audio.volume = 0.35;

  const overlay = document.getElementById("enter-overlay");
  const enterButton = document.getElementById("enter-button");
  const playerPanel = document.getElementById("player-panel");
  const toggleButton = document.getElementById("player-toggle");
  const status = document.getElementById("player-status");

  if (!overlay || !enterButton || !playerPanel || !toggleButton || !status) {
    return;
  }

  const showPlayer = () => {
    playerPanel.classList.add("player-panel--visible");
    overlay.classList.add("hidden");
    status.textContent = "Pronto para tocar";
  };

  const updateStatus = () => {
    status.textContent = isPlaying ? "Tocando" : "Pausado";
    toggleButton.textContent = isPlaying ? "Pausar" : "Reproduzir";
  };

  let isPlaying = false;

  const stopExternalMedia = (event) => {
    const target = event.target;
    if (target === audio) {
      return;
    }
    if (target instanceof HTMLMediaElement) {
      target.pause();
      target.currentTime = 0;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
      return;
    }
    stopExternalMedia({ target: audio });
    audio
      .play()
      .then(() => {
        isPlaying = true;
        updateStatus();
      })
      .catch(() => {
        status.textContent = "Permita o áudio antes de tocar";
      });
  };

  enterButton.addEventListener("click", () => {
    showPlayer();
  });

  toggleButton.addEventListener("click", () => {
    togglePlay();
  });

  audio.addEventListener("play", () => {
    isPlaying = true;
    updateStatus();
  });

  audio.addEventListener("pause", () => {
    isPlaying = false;
    updateStatus();
  });

  audio.addEventListener("ended", () => {
    isPlaying = false;
    updateStatus();
  });

  document.addEventListener("play", stopExternalMedia, true);
})();
