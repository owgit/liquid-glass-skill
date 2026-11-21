const button = document.querySelector("#effect");
const sky = document.querySelector("#sky");
const content = sky.querySelector(".scene-content");
const status = document.querySelector("#status");
const backdrop = new URL("./aurora.webp", import.meta.url).href;
const preferences = [
  matchMedia("(prefers-reduced-motion: reduce)"),
  matchMedia("(prefers-reduced-transparency: reduce)"),
  matchMedia("(forced-colors: active)"),
];
let scene;
let rendererObserver;
let pendingTimeout;
let loading = false;
let wantsGlass = true;
let revision = 0;

function moveContent(destination) {
  const focused = content.contains(document.activeElement) ? document.activeElement : null;
  destination.append(content);
  if (destination !== sky) sky.append(destination);
  focused?.focus({ preventScroll: true });
}

function useSolid(message = "") {
  revision++;
  clearTimeout(pendingTimeout);
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
  else if (wantsGlass && !scene && !loading) enableGlass();
  else if (!wantsGlass) status.textContent = "";
}

async function enableGlass() {
  const token = ++revision;
  loading = true;
  button.setAttribute("aria-pressed", "true");
  status.textContent = "Loading the glass effect…";
  pendingTimeout = setTimeout(() => useSolid("The glass effect took too long to load. Solid controls are on."), 15000);
  try {
    await import("../../skills/liquid-glass-web/assets/liquid-glass.js");
    if (token !== revision) return;
    scene = document.createElement("liquid-glass");
    scene.setAttribute("backdrop", backdrop);
    const checkRenderer = () => {
      if (token !== revision) return;
      if (scene.dataset.renderer !== "webgl") {
        useSolid("WebGL is unavailable. Solid controls are on.");
      } else if (scene.hasAttribute("data-ready")) {
        // The pinned renderer marks both a loaded image and its procedural error fallback ready.
        // For a static image, animatedScene is true only after that fallback.
        if (scene.animatedScene) {
          useSolid("The backdrop could not load. Solid controls are on.");
          return;
        }
        clearTimeout(pendingTimeout);
        loading = false;
        status.textContent = "";
      }
    };
    rendererObserver = new MutationObserver(checkRenderer);
    rendererObserver.observe(scene, { attributes: true, attributeFilter: ["data-renderer", "data-ready"] });
    moveContent(scene);
    checkRenderer();
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
    wantsGlass = !scene && !loading;
    if (!wantsGlass) useSolid();
    else enableGlass();
  });
}
