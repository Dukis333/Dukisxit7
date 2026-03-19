/*
  Creditos:
  Email: marcosxxt658@gmail.com
  WhatsApp: https://wa.me/5593981160223
  Instagram: @marcos_xll77

  ------------------------------------------------------------
  GUIA RAPIDO PARA EDICAO MANUAL
  ------------------------------------------------------------
  1) Trocar musica:
     - Altere SETTINGS.audioSrc
  2) Ajustar volume inicial:
     - Altere SETTINGS.initialVolume (0.0 a 1.0)
  3) Mudar textos de botao/status:
     - Altere SETTINGS.labels
  4) Remover autoplay ao clicar em "Entrar":
     - Troque SETTINGS.autoPlayOnFirstUserClick para false
*/
(function initCustomPlayer() {
  const SETTINGS = {
    audioSrc: "./diario-cafajeste.mp3",
    initialVolume: 0.35,
    autoPlayOnFirstUserClick: true,
    // Mantem o video de fundo rodando e evita pausar ele.
    ignoreVideoElementsWhenStoppingOtherMedia: true,
    labels: {
      playing: "Tocando",
      paused: "Pausado",
      playButton: "Reproduzir",
      pauseButton: "Pausar",
      unlockError: "Permita audio antes de tocar",
    },
  };

  const ui = {
    panel: document.getElementById("player-panel"),
    tabButton: document.getElementById("player-tab"),
    toggleButton: document.getElementById("player-toggle"),
    status: document.getElementById("player-status"),
    volumeInput: document.getElementById("player-volume"),
  };

  if (!ui.panel || !ui.tabButton || !ui.toggleButton || !ui.status || !ui.volumeInput) {
    return;
  }

  const state = {
    isPlaying: false,
    panelOpen: false,
  };

  const audio = new Audio(SETTINGS.audioSrc);
  audio.preload = "auto";
  audio.volume = SETTINGS.initialVolume;
  ui.volumeInput.value = String(SETTINGS.initialVolume);

  function updateUi() {
    ui.status.textContent = state.isPlaying
      ? SETTINGS.labels.playing
      : SETTINGS.labels.paused;
    ui.toggleButton.textContent = state.isPlaying
      ? SETTINGS.labels.pauseButton
      : SETTINGS.labels.playButton;
  }

  function updatePanelUi() {
    ui.panel.classList.toggle("player-panel--visible", state.panelOpen);
    ui.tabButton.setAttribute("aria-expanded", String(state.panelOpen));
    ui.tabButton.textContent = state.panelOpen ? "Fechar música" : "Abrir música";
  }

  function stopOtherMedia(event) {
    const target = event.target;

    if (target === audio) {
      return;
    }

    if (
      SETTINGS.ignoreVideoElementsWhenStoppingOtherMedia &&
      target instanceof HTMLVideoElement
    ) {
      return;
    }

    if (target instanceof HTMLMediaElement) {
      target.pause();
      target.currentTime = 0;
    }
  }

  async function playAudio() {
    stopOtherMedia({ target: audio });

    try {
      await audio.play();
    } catch (error) {
      ui.status.textContent = SETTINGS.labels.unlockError;
    }
  }

  function togglePlay() {
    if (state.isPlaying) {
      audio.pause();
      return;
    }

    playAudio();
  }

  function togglePanel() {
    state.panelOpen = !state.panelOpen;
    updatePanelUi();

    // Se abriu o painel e ainda nao esta tocando, tenta iniciar automaticamente.
    if (state.panelOpen && !state.isPlaying && SETTINGS.autoPlayOnFirstUserClick) {
      playAudio();
    }
  }

  updatePanelUi();
  updateUi();

  ui.tabButton.addEventListener("click", togglePanel);
  ui.toggleButton.addEventListener("click", togglePlay);

  // Ao clicar em "Entrar", o primeiro clique libera e inicia o audio.
  if (SETTINGS.autoPlayOnFirstUserClick) {
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        // Evita disparo duplo quando o clique foi no botao principal de play/pause.
        if (target instanceof Element && target.closest("#player-toggle")) {
          return;
        }

        if (!state.isPlaying) {
          playAudio();
        }
      },
      { capture: true, once: true }
    );
  }

  audio.addEventListener("play", () => {
    state.isPlaying = true;
    updateUi();
  });

  audio.addEventListener("pause", () => {
    state.isPlaying = false;
    updateUi();
  });

  audio.addEventListener("ended", () => {
    state.isPlaying = false;
    updateUi();
  });

  // Sempre que outro audio tocar, ele e parado para evitar duas musicas juntas.
  document.addEventListener("play", stopOtherMedia, true);

  ui.volumeInput.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (!Number.isNaN(value)) {
      audio.volume = value;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.panelOpen) {
      state.panelOpen = false;
      updatePanelUi();
    }
  });
})();
