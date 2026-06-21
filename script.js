const tracks = [
  "audio/sound-track-ct-spawn.mp3",
  "audio/sound-track-mid.mp3",
  "audio/sound-track-t-spawn.mp3",
];

const audio = document.querySelector("#background-music");
const soundButton = document.querySelector(".sound-control");
const soundLabel = soundButton.querySelector(".sound-control__label");
const countdownDisplay = document.querySelector("#c4-countdown");

let currentTrack = 0;
let autoplayBlocked = false;

audio.volume = 0.42;
audio.src = tracks[currentTrack];

function updateControl() {
  const muted = audio.muted;
  soundButton.classList.toggle("is-muted", muted || autoplayBlocked);
  soundButton.setAttribute("aria-pressed", String(muted));

  if (autoplayBlocked) {
    soundButton.setAttribute("aria-label", "Ativar música");
    soundLabel.textContent = "Ativar";
  } else if (muted) {
    soundButton.setAttribute("aria-label", "Ativar som");
    soundLabel.textContent = "Mudo";
  } else {
    soundButton.setAttribute("aria-label", "Mutar música");
    soundLabel.textContent = "Som";
  }
}

async function startPlayback() {
  try {
    await audio.play();
    autoplayBlocked = false;
  } catch {
    autoplayBlocked = true;
  }
  updateControl();
}

audio.addEventListener("ended", () => {
  currentTrack = (currentTrack + 1) % tracks.length;
  audio.src = tracks[currentTrack];
  startPlayback();
});

soundButton.addEventListener("click", async () => {
  if (autoplayBlocked || audio.paused) {
    audio.muted = false;
    await startPlayback();
    return;
  }

  audio.muted = !audio.muted;
  updateControl();
});

startPlayback();

const eventDate = new Date("2026-08-15T00:00:00-03:00");

function updateCountdown() {
  const remaining = Math.max(0, eventDate.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownDisplay.textContent = `${String(days).padStart(2, "0")}D ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

updateCountdown();
setInterval(updateCountdown, 1000);
