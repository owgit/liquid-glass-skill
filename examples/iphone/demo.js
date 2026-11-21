const glassButton = document.querySelector("#effect");
const status = document.querySelector("#status");
const preferences = [
  matchMedia("(prefers-reduced-motion: reduce)"),
  matchMedia("(prefers-reduced-transparency: reduce)"),
  matchMedia("(forced-colors: active)"),
];
let wantsGlass = true;

const reducedEffects = () => preferences.some(query => query.matches);

// One stage is one <liquid-glass> scene. Its content starts as plain HTML in the stage
// and is moved into the scene once the renderer is wanted, then back out when it is not.
function createStage(host) {
  const content = host.querySelector(".scene-content");
  const panes = [...content.querySelectorAll("[glass]")];
  const motionButton = host.querySelector("[data-motion]");
  const sceneOnly = host.querySelectorAll("[data-needs-scene]");
  const aurora = host.dataset.scene === "aurora";
  const poster = aurora ? "aurora" : new URL(host.dataset.scene, import.meta.url).href;
  const movie = host.dataset.video && new URL(host.dataset.video, import.meta.url).href;

  let scene;
  let video;
  let observer;
  let generation = 0;
  let playRequest = 0;
  let loadTimer;
  let inView = false;
  let wantsMotion = !navigator.connection?.saveData;
  const stage = { unavailable: false, get scene() { return scene; }, update, sync };

  const canPlay = () => movie && wantsMotion && inView && !document.hidden;

  function update() {
    const off = !scene || reducedEffects();
    for (const pane of panes) pane.toggleAttribute("glass", wantsGlass);
    for (const element of sceneOnly) element.hidden = off || (element.dataset.needsScene === "glass" && !wantsGlass);
    if (motionButton) {
      motionButton.hidden = off;
      motionButton.textContent = (wantsMotion ? "Pause" : "Play") + motionButton.dataset.noun;
    }
  }

  function moveContent(destination) {
    const focused = content.contains(document.activeElement) ? document.activeElement : null;
    destination.append(content);
    if (destination !== host) host.append(destination);
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
      moveContent(host);
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
    status.textContent = "Showing the still image. Select Play to try again.";
    update();
  }

  function syncPlayback() {
    if (!scene || !movie) return;
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

  async function sync() {
    if (reducedEffects()) {
      removeScene("Solid controls and still images match your display preferences.");
      return;
    }
    if (stage.unavailable || scene) return;
    const token = ++generation;
    try {
      await import("../../skills/liquid-glass-web/assets/liquid-glass.js");
      if (token !== generation) return;
      scene = document.createElement("liquid-glass");
      scene.backdrop = poster;
      for (const name of ["colors", "dim"]) {
        if (host.dataset[name]) scene.setAttribute(name, host.dataset[name]);
      }
      const checkRenderer = () => {
        if (scene?.dataset.renderer !== "webgl") {
          stage.unavailable = true;
          removeScene("WebGL is unavailable. Showing still images with solid controls.");
        } else if (!aurora && scene.backdrop === poster && scene.hasAttribute("data-ready") && scene.animatedScene) {
          stage.unavailable = true;
          removeScene("A backdrop could not load. Solid controls are on.");
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
        stage.unavailable = true;
        removeScene("The glass effect could not load. Showing still images with solid controls.");
      }
    }
  }

  motionButton?.addEventListener("click", () => {
    wantsMotion = !wantsMotion;
    status.textContent = "";
    update();
    syncPlayback();
  });
  if (movie) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { rootMargin: "200px" }).observe(host); // start loading just before the stage scrolls in
    document.addEventListener("visibilitychange", syncPlayback);
  }
  return stage;
}

let stages = [];

function updateControls() {
  const disabled = reducedEffects() || stages.every(stage => stage.unavailable);
  glassButton.disabled = disabled;
  glassButton.setAttribute("aria-pressed", String(wantsGlass && !disabled && stages.some(stage => stage.scene)));
  for (const stage of stages) stage.update();
}

if ("customElements" in window && "ResizeObserver" in window && "IntersectionObserver" in window) {
  stages = [...document.querySelectorAll("[data-scene]")].map(createStage);
  const syncAll = () => stages.forEach(stage => stage.sync());

  glassButton.hidden = false;
  glassButton.addEventListener("click", () => {
    wantsGlass = !wantsGlass;
    updateControls();
  });
  preferences.forEach(query => query.addEventListener("change", syncAll));
  syncAll();

  // The palette and the scrim drive the scene's own `colors` and `dim` attributes.
  const dim = document.querySelector("#dim");
  dim.addEventListener("click", () => {
    const on = dim.getAttribute("aria-pressed") !== "true";
    dim.setAttribute("aria-pressed", String(on));
    dim.closest("liquid-glass")?.setAttribute("dim", on ? "0.45" : "0");
  });
  const palette = document.querySelector("#palette");
  palette.addEventListener("change", event => {
    palette.closest("liquid-glass")?.setAttribute("colors", event.target.value);
  });

  // Keyboard alternative to dragging: replay an arrow key as a short drag, which is the
  // only way Zerowing 1.1.1 moves a pane.
  const loupe = document.querySelector("#loupe");
  loupe.addEventListener("keydown", event => {
    const step = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[event.key];
    if (!step || !loupe.hasAttribute("glass")) return;
    event.preventDefault();
    const box = loupe.getBoundingClientRect();
    const bounds = loupe.closest(".stage").getBoundingClientRect();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (x + step[0] < bounds.left || x + step[0] > bounds.right || y + step[1] < bounds.top || y + step[1] > bounds.bottom) return;
    const send = (type, target, dx = 0, dy = 0) => target.dispatchEvent(
      new PointerEvent(type, { bubbles: true, pointerId: 1, clientX: x + dx, clientY: y + dy }));
    loupe.setPointerCapture = () => {}; // a synthetic pointer cannot be captured
    send("pointerdown", loupe);
    send("pointermove", window, ...step);
    send("pointerup", window, ...step);
    delete loupe.setPointerCapture;
  });
}
