const button = document.querySelector("#effect");
const sky = document.querySelector("#sky");
const content = sky.querySelector(".scene-content");
const status = document.querySelector("#status");
const preferences = [
  matchMedia("(prefers-reduced-motion: reduce)"),
  matchMedia("(prefers-reduced-transparency: reduce)"),
  matchMedia("(forced-colors: active)"),
];
let scene;
let rendererObserver;
let loading = false;
let revision = 0;

function moveContent(destination) {
  const focused = content.contains(document.activeElement) ? document.activeElement : null;
  destination.append(content);
  if (destination !== sky) sky.append(destination);
  focused?.focus({ preventScroll: true });
}

function useSolid(message = "") {
  revision++;
  loading = false;
  rendererObserver?.disconnect();
  if (scene) {
    moveContent(sky);
    scene.remove();
    scene = null;
  }
  button.setAttribute("aria-pressed", "false");
  status.textContent = message;
}

function syncPreferences() {
  const reduce = preferences.some(query => query.matches);
  button.setAttribute("aria-disabled", String(reduce));
  if (reduce) useSolid("Solid controls are on to match your display preferences.");
  else if (!scene && !loading) status.textContent = "";
}

async function enableGlass() {
  const token = ++revision;
  loading = true;
  status.textContent = "Loading the glass effect…";
  try {
    await import("../../skills/liquid-glass-web/assets/liquid-glass.js");
    if (token !== revision) return;
    scene = document.createElement("liquid-glass");
    scene.setAttribute("backdrop", "aurora");
    scene.setAttribute("colors", "#43d79b #1e897f #4c589b #276c63");
    scene.setAttribute("dim", "0.34");
    moveContent(scene);
    if (scene.dataset.renderer !== "webgl") {
      useSolid("WebGL is unavailable. Solid controls are on.");
      return;
    }
    rendererObserver = new MutationObserver(() => {
      if (scene && scene.dataset.renderer !== "webgl") useSolid("Graphics rendering stopped. Solid controls are on.");
    });
    rendererObserver.observe(scene, { attributes: true, attributeFilter: ["data-renderer"] });
    button.setAttribute("aria-pressed", "true");
    status.textContent = "";
    loading = false;
  } catch {
    if (token === revision) useSolid("The glass effect could not load. Solid controls are on.");
  }
}

if ("customElements" in window && "ResizeObserver" in window && "IntersectionObserver" in window) {
  button.hidden = false;
  preferences.forEach(query => query.addEventListener("change", syncPreferences));
  syncPreferences();
  button.addEventListener("click", () => {
    if (button.getAttribute("aria-disabled") === "true") return;
    if (scene || loading) useSolid();
    else enableGlass();
  });
}
