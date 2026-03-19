/*
  Creditos:
  Email: marcosxxt658@gmail.com
  WhatsApp: https://wa.me/5593981160223
  Instagram: @marcos_xll77
*/
(function () {
  const audio = new Audio("./DJ MU540  Submundo 808 DJ SET  Campinas_SP - SUBMUNDO 808 (youtube).mp3");
  audio.preload = "auto";
  audio.volume = 0.35;

  const panel = document.getElementById("player-panel");
  const toggleButton = document.getElementById("player-toggle");
  const status = document.getElementById("player-status");
  const volumeInput = document.getElementById("player-volume");

  if (!panel || !toggleButton || !status || !volumeInput) {
    return;
  }

  panel.classList.add("player-panel--visible");

  let isPlaying = false;

  const updateStatus = () => {
    status.textContent = isPlaying ? "Tocando" : "Pausado";
    toggleButton.textContent = isPlaying ? "Pausar" : "Reproduzir";
  };

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
    audio
      .play()
      .then(() => {
        isPlaying = true;
        updateStatus();
      })
      .catch(() => {
        status.textContent = "Permita o audio no navegador";
      });
  };

  toggleButton.addEventListener("click", togglePlay);

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

  volumeInput.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      audio.volume = value;
    }
  });

  document.addEventListener("play", stopExternalMedia, true);
  updateStatus();
})();
