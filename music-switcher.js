/*
  Créditos:
  Email: marcosxxt658@gmail.com
  WhatsApp: https://wa.me/5593981160223
  Instagram: @marcos_xll77
*/
/* Global credits comment earlier... */
(function () {
  const playlist = [
    {
      title: "DJ MU540 — Submundo 808",
      file: "DJ MU540  Submundo 808 DJ SET  Campinas_SP - SUBMUNDO 808 (youtube).mp3",
    },
    {
      title: "Junior Vianna — Doutorzinho",
      file: "Junior Vianna - Doutorzinho - Musicas Sertaneja (youtube).mp3",
    },
    {
      title: "Junior Vianna — Pu Pu Pu",
      file: "Junior Vianna - Pu Pu Pu - (CAIXA ALTERADA)  -  Mas ele não entende - meme - Top Hits Brasil (youtube).mp3",
    },
    {
      title: "Miguell Brandao — Lengo Tengo",
      file: "LENGO TENGO - miguell brandão (youtube).mp3",
    },
  ];

  const container = document.getElementById("music-switcher");
  if (!container) {
    return;
  }

  const trackName = container.querySelector("[data-track-name]");
  const statusText = container.querySelector("[data-status]");
  const playlistList = container.querySelector("[data-playlist]");
  const playBtn = container.querySelector("[data-action='play']");
  const prevBtn = container.querySelector("[data-action='prev']");
  const nextBtn = container.querySelector("[data-action='next']");

  if (!trackName || !statusText || !playlistList || !playBtn || !prevBtn || !nextBtn) {
    return;
  }

  const preferredIndex = playlist.findIndex((track) =>
    track.title.toLowerCase().includes("dj mu540")
  );
  let currentIndex = preferredIndex >= 0 ? preferredIndex : 0;
  let isPlaying = false;
  let hasEntered = false;

  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 0.35;

  const cleanExternalAudio = () => {
    document.querySelectorAll("audio").forEach((element) => {
      if (container.contains(element)) {
        return;
      }
      element.pause();
      element.remove();
    });
    audio.pause();
  };

  cleanExternalAudio();

  const renderPlaylist = () => {
    playlistList.innerHTML = playlist
      .map(
        (track, index) =>
          `<li class="${
            index === currentIndex ? "music-switcher__track--active" : ""
          }" data-track-index="${index}">${track.title}</li>`
      )
      .join("");
  };

  const updateDisplay = () => {
    const current = playlist[currentIndex];
    trackName.textContent = current.title;
    statusText.textContent = isPlaying ? "Tocando" : "Pausado";
    playBtn.textContent = isPlaying ? "Pausar" : "Reproduzir";
    renderPlaylist();
  };

  const loadTrack = (index, autoPlay = true) => {
    currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
    audio.pause();
    audio.src = encodeURI(`./${playlist[currentIndex].file}`);
    audio.currentTime = 0;
    updateDisplay();
    cleanExternalAudio();

    if (autoPlay) {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          updateDisplay();
        })
        .catch(() => {
          isPlaying = false;
          statusText.textContent = "Clique em reproduzir para liberar o áudio";
          playBtn.textContent = "Reproduzir";
        });
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      updateDisplay();
      return;
    }
    audio
      .play()
      .then(() => {
        isPlaying = true;
        updateDisplay();
      })
      .catch(() => {
        statusText.textContent = "Clique em reproduzir para liberar o áudio";
      });
  };

  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", () => loadTrack(currentIndex - 1));
  nextBtn.addEventListener("click", () => loadTrack(currentIndex + 1));

  playlistList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-track-index]");
    if (!item) {
      return;
    }
    const index = Number(item.getAttribute("data-track-index"));
    if (Number.isNaN(index)) {
      return;
    }
    loadTrack(index);
  });

  audio.addEventListener("ended", () => loadTrack(currentIndex + 1));
  audio.addEventListener("play", () => {
    isPlaying = true;
    updateDisplay();
  });
  audio.addEventListener("pause", () => {
    isPlaying = false;
    updateDisplay();
  });

  const initDisplay = () => {
    const current = playlist[currentIndex];
    trackName.textContent = current.title;
    statusText.textContent = "Aguardando entrada";
    playBtn.textContent = "Reproduzir";
    renderPlaylist();
  };

  const showSwitcher = () => {
    if (hasEntered) {
      return;
    }
    hasEntered = true;
    container.classList.add("music-switcher--visible");
    container.classList.remove("music-switcher--hidden");
    cleanExternalAudio();
    loadTrack(currentIndex, false);
  };

  const checkEntry = () => {
    if (hasEntered) {
      return;
    }
    const overlay = document.querySelector(".enter-screen");
    if (!overlay) {
      showSwitcher();
    }
  };

  const attachEntryListener = () => {
    const overlay = document.querySelector(".enter-screen");
    if (!overlay || overlay.__musicSwitcherBound) {
      return;
    }
    overlay.__musicSwitcherBound = true;
    overlay.addEventListener("click", () => {
      showSwitcher();
    });
  };

  const observer = new MutationObserver(() => {
    cleanExternalAudio();
    checkEntry();
    attachEntryListener();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  checkEntry();
  attachEntryListener();

  initDisplay();
})();
