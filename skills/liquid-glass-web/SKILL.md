---
name: liquid-glass-web
description: Build or review Liquid Glass web navigation, buttons and toolbars using Zerowing’s self-hosted WebGL component. Use for HTML, React, Next.js and iPhone Safari requests about refractive glass, accessible solid fallbacks, or reducing the rendering cost of glass effects.
---

# Liquid Glass for the web

Start from the existing page and its actual links, buttons, labels, focus order and server-rendered content. Ask which surface should use glass only when the request or existing design leaves that unclear. For a native SwiftUI or UIKit target, use the platform’s controls and the available iOS design skill. This package targets the browser.

## Integrate the renderer

1. Choose one bounded scene, usually a toolbar or a hero with a few controls. The renderer refracts the scene’s own backdrop. For controls that float over arbitrary page content, use CSS or a solid surface. Keep text, controls and crawlable links in the DOM.
2. Copy [liquid-glass.js](assets/liquid-glass.js) **and** [LICENSE.zerowing](assets/LICENSE.zerowing) from this skill into the app’s public assets. Respect any base path used by the application. Use a same-origin URL. The bundled ES module registers the custom element and requires no build step.
3. Ship a solid surface in the initial HTML and stylesheet. Give the scene stable dimensions. Load the module in the browser when the enhancement is wanted. In an SSR framework, keep headings and links in server output and import the module from a small client boundary after mount or interaction. Avoid a top-level import in server-rendered code.
4. Put the desired controls inside one `<liquid-glass>` element and add the boolean `glass` attribute to each surface. In JSX emit `glass=""`. Preserve the original controls and listeners when moving them. The upper bound is 16 panes per scene and some mobile GPUs allow fewer. Style the actual shape using CSS padding and border radius.
5. Reveal transparent styling only for a ready WebGL scene. In bundled version 1.1.1 the host then has both `data-renderer="webgl"` and `data-ready`. Keep the baseline opaque on module failure, unavailable WebGL, context loss or a user preference for solid controls. The upstream CSS fallback applies translucent backgrounds, so use a higher-specificity solid rule or remove the scene while preserving its content.

Use this selector pattern with an application-owned opt-in state and your component classes. Define the opaque baseline on the controls even when they sit outside the scene.

```css
.toolbar a,
.toolbar button,
liquid-glass .toolbar [glass] {
  color: #fff;
  background: #14222e;
}
[data-effects="on"] liquid-glass[data-renderer="webgl"][data-ready] .toolbar [glass] {
  background: rgba(10, 20, 30, .68);
}
```

## Choose a backdrop and verify the result

- Prefer a sized, local still image on mobile. For the built-in aurora, set `backdrop="aurora"`. A video can continue playing with `reduce-motion`; select a still or skip the renderer when reduced motion is active. A visually static scene can still schedule frames while visible.
- Provide an operable solid mode. Honor changes to reduced motion, reduced transparency where supported, and forced colors. Keep labels and focus visible over the brightest part of the backdrop. Use [the iPhone and browser checks](references/mobile-web.md) for Safari, SSR or accessibility work.
- Omit audio integration unless the person requests an audio-reactive interface. For microphone input, require a named start control and a stop action and handle denied access. A decorative scene needs no media permission.
- Verify the original actions and URLs, JS-disabled rendering, a failed renderer load and keyboard navigation. Report which browsers or devices were actually exercised, along with any performance figures that were measured.
