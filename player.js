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
    initialFadeDurationMs: 1800,
    autoPlayOnFirstUserClick: true,
    // Mantem o video de fundo rodando e evita pausar ele.
    ignoreVideoElementsWhenStoppingOtherMedia: true,
    labels: {
      playing: "Tocando",
      paused: "Pausado",
      playButton: "Reproduzir",
      pauseButton: "Pausar",
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
    didSmoothStart: false,
    fadeRaf: null,
    playAttemptInFlight: false,
    unlockListenersAttached: false,
  };
  const unlockEvents = ["pointerdown", "click", "keydown", "touchstart"];

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

  function onVisibilityWake() {
    if (document.visibilityState === "visible") {
      handleUserUnlock();
    }
  }

  function removeUserUnlockListeners() {
    if (!state.unlockListenersAttached) {
      return;
    }

    unlockEvents.forEach((eventName) => {
      document.removeEventListener(eventName, handleUserUnlock, true);
    });
    document.removeEventListener("visibilitychange", onVisibilityWake);
    window.removeEventListener("focus", handleUserUnlock, true);
    state.unlockListenersAttached = false;
  }

  function ensureUserUnlockListeners() {
    if (!SETTINGS.autoPlayOnFirstUserClick || state.unlockListenersAttached) {
      return;
    }

    unlockEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleUserUnlock, true);
    });
    document.addEventListener("visibilitychange", onVisibilityWake);
    window.addEventListener("focus", handleUserUnlock, true);
    state.unlockListenersAttached = true;
  }

  function handleUserUnlock() {
    if (state.isPlaying) {
      removeUserUnlockListeners();
      return;
    }

    playAudio().then((didPlay) => {
      if (didPlay) {
        removeUserUnlockListeners();
      }
    });
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

  function getTargetVolume() {
    const value = Number(ui.volumeInput.value);
    if (Number.isNaN(value)) {
      return SETTINGS.initialVolume;
    }

    return Math.min(1, Math.max(0, value));
  }

  function cancelFade() {
    if (state.fadeRaf !== null) {
      cancelAnimationFrame(state.fadeRaf);
      state.fadeRaf = null;
    }
  }

  function fadeInToTarget(durationMs) {
    cancelFade();

    const targetVolume = getTargetVolume();
    audio.muted = false;
    audio.volume = 0;

    const startAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startAt) / durationMs);
      audio.volume = targetVolume * progress;

      if (progress < 1 && !audio.paused) {
        state.fadeRaf = requestAnimationFrame(tick);
        return;
      }

      state.fadeRaf = null;
      audio.volume = targetVolume;
    };

    state.fadeRaf = requestAnimationFrame(tick);
  }

  async function playAudio() {
    if (state.playAttemptInFlight) {
      return false;
    }

    state.playAttemptInFlight = true;
    stopOtherMedia({ target: audio });

    try {
      await audio.play();
      if (!state.didSmoothStart) {
        state.didSmoothStart = true;
        fadeInToTarget(SETTINGS.initialFadeDurationMs);
      } else {
        audio.muted = false;
      }
      return true;
    } catch (error) {
      // Evita mensagem de bloqueio; mantem estado e tenta novamente no proximo gatilho.
      state.isPlaying = false;
      updateUi();
      ensureUserUnlockListeners();
      return false;
    } finally {
      state.playAttemptInFlight = false;
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

  // Tenta iniciar automaticamente de forma silenciosa e depois restaura o volume.
  (function tryAutoStart() {
    audio.volume = 0;
    audio.muted = true;

    audio
      .play()
      .then(() => {
        state.isPlaying = true;
        updateUi();

        if (!state.didSmoothStart) {
          state.didSmoothStart = true;
          fadeInToTarget(SETTINGS.initialFadeDurationMs);
        }
      })
      .catch(() => {
        audio.muted = false;
        audio.volume = getTargetVolume();
        ensureUserUnlockListeners();
      });
  })();

  ui.tabButton.addEventListener("click", togglePanel);
  ui.toggleButton.addEventListener("click", togglePlay);

  // Mantem tentativas de desbloqueio por interacao ate o audio tocar.
  if (SETTINGS.autoPlayOnFirstUserClick) {
    ensureUserUnlockListeners();
  }

  audio.addEventListener("play", () => {
    state.isPlaying = true;
    updateUi();
    removeUserUnlockListeners();
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
      cancelFade();
      audio.muted = false;
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
