const glassButton = document.querySelector("#effect");
const motionButton = document.querySelector("#motion");
const sky = document.querySelector("#sky");
const content = sky.querySelector(".scene-content");
const panes = [...content.querySelectorAll("[glass]")];
const status = document.querySelector("#status");
const poster = new URL("./aurora.webp", import.meta.url).href;
const movie = new URL("./aurora-loop.mp4", import.meta.url).href;
const preferences = [
  matchMedia("(prefers-reduced-motion: reduce)"),
  matchMedia("(prefers-reduced-transparency: reduce)"),
  matchMedia("(forced-colors: active)"),
];

let scene;
let video;
let observer;
let generation = 0;
let playRequest = 0;
let loadTimer;
let inView = false;
let wantsGlass = true;
let wantsMotion = !navigator.connection?.saveData;
let unavailable = false;

const reducedEffects = () => preferences.some(query => query.matches);
const canPlay = () => wantsMotion && inView && !document.hidden;

function updateControls() {
  const disabled = reducedEffects() || unavailable;
  glassButton.disabled = disabled;
  glassButton.setAttribute("aria-pressed", String(Boolean(scene) && wantsGlass && !disabled));
  motionButton.hidden = !scene || disabled;
  motionButton.textContent = wantsMotion ? "Pause motion" : "Play motion";
  for (const pane of panes) pane.toggleAttribute("glass", wantsGlass);
}

function moveContent(destination) {
  const focused = content.contains(document.activeElement) ? document.activeElement : null;
  destination.append(content);
  if (destination !== sky) sky.append(destination);
  focused?.focus({ preventScroll: true });
}

function clearPlayback() {
  playRequest++;
  clearTimeout(loadTimer);
  video?.pause();
}

function removeScene(message) {
  generation++;
  clearPlayback();
  observer?.disconnect();
  video = null;
  if (scene) {
    moveContent(sky);
    scene.remove();
    scene = null;
  }
  updateControls();
  status.textContent = message;
}

function usePoster(media) {
  if (media !== video || !scene) return;
  clearPlayback();
  video = null;
  wantsMotion = false;
  scene.removeAttribute("data-ready");
  scene.backdrop = poster;
  status.textContent = "Showing the still photograph. Select Play motion to try again.";
  updateControls();
}

function syncPlayback() {
  if (!scene) return;
  if (!canPlay()) {
    clearPlayback();
    return;
  }

  if (!video) {
    scene.removeAttribute("data-ready");
    scene.backdrop = movie;
    // Zerowing 1.1.1 owns this muted inline video and consumes its frames in WebGL.
    video = scene.video;
    if (!video) {
      usePoster(video);
      return;
    }
    const media = video;
    media.addEventListener("error", () => usePoster(media), { once: true });
  }

  const media = video;
  const request = ++playRequest;
  clearTimeout(loadTimer);
  if (media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    loadTimer = setTimeout(() => {
      if (request === playRequest) usePoster(media);
    }, 12000);
  }
  // Also invoked directly by the Play button on devices that require a gesture.
  media.play().then(() => {
    if (request === playRequest) {
      clearTimeout(loadTimer);
      status.textContent = "";
    }
  }).catch(() => {
    if (request === playRequest && canPlay()) usePoster(media);
  });
}

async function syncPreferences() {
  if (reducedEffects()) {
    removeScene("Solid controls and a still photograph match your display preferences.");
    return;
  }
  if (unavailable || scene) return;
  const token = ++generation;
  try {
    await import("../../skills/liquid-glass-web/assets/liquid-glass.js");
    if (token !== generation) return;
    scene = document.createElement("liquid-glass");
    scene.backdrop = poster;
    const checkRenderer = () => {
      if (scene?.dataset.renderer !== "webgl") {
        unavailable = true;
        removeScene("WebGL is unavailable. Showing the photograph with solid controls.");
      } else if (scene.backdrop === poster && scene.hasAttribute("data-ready") && scene.animatedScene) {
        unavailable = true;
        removeScene("The backdrop could not load. Solid controls are on.");
      }
    };
    observer = new MutationObserver(checkRenderer);
    observer.observe(scene, { attributes: true, attributeFilter: ["data-renderer", "data-ready"] });
    moveContent(scene);
    checkRenderer();
    if (!scene) return;
    status.textContent = "";
    updateControls();
    syncPlayback();
  } catch {
    if (token === generation) {
      unavailable = true;
      removeScene("The glass effect could not load. Showing the photograph with solid controls.");
    }
  }
}

if ("customElements" in window && "ResizeObserver" in window && "IntersectionObserver" in window) {
  glassButton.hidden = false;
  glassButton.addEventListener("click", () => {
    wantsGlass = !wantsGlass;
    updateControls();
  });
  motionButton.addEventListener("click", () => {
    wantsMotion = !wantsMotion;
    status.textContent = "";
    updateControls();
    syncPlayback();
  });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }).observe(sky);
  document.addEventListener("visibilitychange", syncPlayback);
  preferences.forEach(query => query.addEventListener("change", syncPreferences));
  syncPreferences();
}
