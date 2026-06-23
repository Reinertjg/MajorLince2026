const musicTrack = "audio/sound-track-t-spawn.mp3";

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

document.documentElement.classList.toggle("is-ios", isIOS);

if (isIOS) {
  const greenVideo = document.querySelector(".shirt-green-source");
  const chromaCanvas = document.querySelector(".shirt-chroma-canvas");
  const chromaContext = chromaCanvas.getContext("2d", {
    alpha: true,
    willReadFrequently: true,
  });

  function removeGreenBackground() {
    if (greenVideo.readyState < 2) return;

    chromaContext.drawImage(
      greenVideo,
      0,
      0,
      chromaCanvas.width,
      chromaCanvas.height,
    );

    const frame = chromaContext.getImageData(
      0,
      0,
      chromaCanvas.width,
      chromaCanvas.height,
    );
    const pixels = frame.data;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const greenDominance = green - Math.max(red, blue);

      if (green > 55 && greenDominance > 10) {
        const transparency = Math.min(1, (greenDominance - 10) / 50);
        pixels[index + 1] = Math.min(green, Math.max(red, blue) * 1.08);
        pixels[index + 3] = Math.round(255 * (1 - transparency));
      }
    }

    chromaContext.putImageData(frame, 0, 0);
    document.documentElement.classList.add("chroma-ready");
  }

  function renderChromaFrame() {
    removeGreenBackground();

    if ("requestVideoFrameCallback" in greenVideo) {
      greenVideo.requestVideoFrameCallback(renderChromaFrame);
    } else {
      requestAnimationFrame(renderChromaFrame);
    }
  }

  function startChroma() {
    const scale = Math.min(1, 480 / greenVideo.videoWidth);
    chromaCanvas.width = Math.round(greenVideo.videoWidth * scale);
    chromaCanvas.height = Math.round(greenVideo.videoHeight * scale);
    greenVideo.play().catch(() => {});
    renderChromaFrame();
  }

  if (greenVideo.readyState >= 1) {
    startChroma();
  } else {
    greenVideo.addEventListener("loadedmetadata", startChroma, { once: true });
  }
}

const audio = document.querySelector("#background-music");
const soundButton = document.querySelector(".sound-control");
const soundLabel = soundButton.querySelector(".sound-control__label");
const countdownDisplay = document.querySelector("#c4-countdown");

let autoplayBlocked = false;

audio.volume = 0.42;
audio.src = musicTrack;
audio.loop = true;

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
