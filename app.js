const STORAGE_KEYS = {
  theme: "pomodoro.theme",
  volume: "pomodoro.volume",
};

const SESSIONS = {
  25: {
    label: "Pomodoro 25",
    focusSeconds: 25 * 60,
    breakSeconds: 5 * 60,
  },
  50: {
    label: "Pomodoro 50",
    focusSeconds: 50 * 60,
    breakSeconds: 10 * 60,
  },
};

const state = {
  selectedSession: "25",
  mode: "focus",
  isRunning: false,
  remainingSeconds: SESSIONS["25"].focusSeconds,
  targetTime: null,
  timerId: null,
  volume: 0.5,
};

const elements = {
  timeDisplay: document.querySelector("#timeDisplay"),
  statusLabel: document.querySelector("#statusLabel"),
  nextLabel: document.querySelector("#nextLabel"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  resetButton: document.querySelector("#resetButton"),
  sessionButtons: document.querySelectorAll("[data-session]"),
  themeToggle: document.querySelector("#themeToggle"),
  volumeSlider: document.querySelector("#volumeSlider"),
  volumeValue: document.querySelector("#volumeValue"),
};

function init() {
  loadPreferences();
  bindEvents();
  render();
}

function loadPreferences() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  const savedVolumeValue = localStorage.getItem(STORAGE_KEYS.volume);
  const savedVolume = Number(savedVolumeValue);

  if (savedTheme === "dark" || savedTheme === "light") {
    document.documentElement.dataset.theme = savedTheme;
  }

  if (savedVolumeValue !== null && !Number.isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
    state.volume = savedVolume;
  }

  elements.volumeSlider.value = Math.round(state.volume * 100);
}

function bindEvents() {
  elements.startButton.addEventListener("click", startTimer);
  elements.pauseButton.addEventListener("click", pauseTimer);
  elements.resetButton.addEventListener("click", resetTimer);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.volumeSlider.addEventListener("input", updateVolume);

  elements.sessionButtons.forEach((button) => {
    button.addEventListener("click", () => selectSession(button.dataset.session));
  });
}

function selectSession(sessionKey) {
  if (!SESSIONS[sessionKey]) return;

  state.selectedSession = sessionKey;
  state.mode = "focus";
  stopInterval();
  state.isRunning = false;
  state.remainingSeconds = SESSIONS[sessionKey].focusSeconds;
  state.targetTime = null;
  render();
}

function startTimer() {
  if (state.isRunning) return;

  state.isRunning = true;
  state.targetTime = Date.now() + state.remainingSeconds * 1000;
  tick();
  state.timerId = window.setInterval(tick, 250);
  render();
}

function pauseTimer() {
  if (!state.isRunning) return;

  state.remainingSeconds = secondsUntilTarget();
  state.isRunning = false;
  state.targetTime = null;
  stopInterval();
  render();
}

function resetTimer() {
  stopInterval();
  state.isRunning = false;
  state.mode = "focus";
  state.remainingSeconds = currentSession().focusSeconds;
  state.targetTime = null;
  render();
}

function tick() {
  state.remainingSeconds = secondsUntilTarget();

  if (state.remainingSeconds <= 0) {
    completeCurrentMode();
    return;
  }

  renderTimer();
}

function completeCurrentMode() {
  stopInterval();
  playAlarm();

  if (state.mode === "focus") {
    state.mode = "break";
    state.remainingSeconds = currentSession().breakSeconds;
    state.targetTime = Date.now() + state.remainingSeconds * 1000;
    state.isRunning = true;
    state.timerId = window.setInterval(tick, 250);
  } else {
    state.mode = "focus";
    state.remainingSeconds = currentSession().focusSeconds;
    state.targetTime = null;
    state.isRunning = false;
  }

  render();
}

function secondsUntilTarget() {
  if (!state.targetTime) return state.remainingSeconds;
  return Math.max(0, Math.ceil((state.targetTime - Date.now()) / 1000));
}

function stopInterval() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function currentSession() {
  return SESSIONS[state.selectedSession];
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
  renderThemeButton();
}

function updateVolume(event) {
  state.volume = Number(event.target.value) / 100;
  localStorage.setItem(STORAGE_KEYS.volume, String(state.volume));
  renderVolume();
}

function playAlarm() {
  if (state.volume === 0) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audioContext = new AudioContext();
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(state.volume * 0.12, audioContext.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.5);
  gain.connect(audioContext.destination);

  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.12);
    oscillator.connect(gain);
    oscillator.start(audioContext.currentTime + index * 0.12);
    oscillator.stop(audioContext.currentTime + 1.3 + index * 0.08);
  });

  window.setTimeout(() => audioContext.close(), 1700);
}

function render() {
  renderTimer();
  renderStatus();
  renderSessionTabs();
  renderControls();
  renderThemeButton();
  renderVolume();
}

function renderTimer() {
  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  elements.timeDisplay.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
  document.title = `${elements.timeDisplay.textContent} - Pomodoro`;
}

function renderStatus() {
  const session = currentSession();
  const breakMinutes = Math.round(session.breakSeconds / 60);

  if (state.mode === "break") {
    elements.statusLabel.textContent = state.isRunning ? "Descanso en curso" : "Descanso pausado";
    elements.nextLabel.textContent = "Al terminar podras iniciar una nueva sesion";
    return;
  }

  elements.statusLabel.textContent = state.isRunning ? "Sesion en curso" : "Sesion lista";
  elements.nextLabel.textContent = `Descanso automatico: ${breakMinutes} min`;
}

function renderSessionTabs() {
  elements.sessionButtons.forEach((button) => {
    const isActive = button.dataset.session === state.selectedSession;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderControls() {
  elements.startButton.disabled = state.isRunning;
  elements.pauseButton.disabled = !state.isRunning;
  elements.startButton.textContent = state.remainingSeconds < modeDuration() ? "Resume" : "Start";
}

function modeDuration() {
  return state.mode === "break" ? currentSession().breakSeconds : currentSession().focusSeconds;
}

function renderThemeButton() {
  const isDark = document.documentElement.dataset.theme === "dark";
  elements.themeToggle.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  elements.themeToggle.querySelector("span").textContent = isDark ? "☼" : "☾";
}

function renderVolume() {
  elements.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;
}

init();
