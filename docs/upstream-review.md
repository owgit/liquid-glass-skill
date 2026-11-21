# Zerowing Liquid Glass 1.1.1 review

This skill includes Zerowing’s browser renderer so a website can serve it locally. The bundled JavaScript is byte-identical to the upstream distribution. The agent instructions and iPhone guidance are maintained in this project.

| Item | Reviewed value |
| --- | --- |
| Upstream | [MuhammadaliMS/liquid-glass](https://github.com/MuhammadaliMS/liquid-glass) |
| Revision | [32cd7f8f45a782ba1f209295d8358d3c855c4aa5](https://github.com/MuhammadaliMS/liquid-glass/commit/32cd7f8f45a782ba1f209295d8358d3c855c4aa5) |
| Source file | [dist/liquid-glass.js](https://github.com/MuhammadaliMS/liquid-glass/blob/32cd7f8f45a782ba1f209295d8358d3c855c4aa5/dist/liquid-glass.js) |
| Bundled file | [liquid-glass.js](../skills/liquid-glass-web/assets/liquid-glass.js), 47,977 bytes |
| SHA-256 | `8b52156fdb99f2499e622672eea08a225a842312051a5671e4ee5c4705c9d1ee` |
| License | MIT, copyright © 2026 zerowing. Include the [upstream notice](../skills/liquid-glass-web/assets/LICENSE.zerowing) when redistributing the renderer. |

## Static review

On November 21, 2026, we inspected the distribution, TypeScript sources, shaders and package manifest at the pinned revision. We found no telemetry endpoints, audio uploads, persistent storage or dynamic JavaScript evaluation in the renderer. The manifest declares no runtime dependencies or install hooks. This review covers that revision of the browser module. [Source](https://github.com/MuhammadaliMS/liquid-glass/tree/32cd7f8f45a782ba1f209295d8358d3c855c4aa5/src) · [Manifest](https://github.com/MuhammadaliMS/liquid-glass/blob/32cd7f8f45a782ba1f209295d8358d3c855c4aa5/package.json)

The renderer loads URLs supplied as backdrops. A locally hosted image keeps those requests on the site. Calling `startMicrophone()` explicitly requests audio input and analyses it on-device. Stopping the microphone, removing the component or hiding the tab releases the microphone. Basic glass effects require no audio permission. [Audio implementation](https://github.com/MuhammadaliMS/liquid-glass/blob/32cd7f8f45a782ba1f209295d8358d3c855c4aa5/src/core/audio.ts) · [Element lifecycle](https://github.com/MuhammadaliMS/liquid-glass/blob/32cd7f8f45a782ba1f209295d8358d3c855c4aa5/src/element.ts)

## Integration limits

- A scene refracts its own backdrop and supports up to 16 panes, depending on the GPU. Use a semantic HTML base that stays legible with the effect disabled.
- Visible scenes continue scheduling animation frames even when a static scene skips drawing. Profile scrolling on the target device.
- A video backdrop can keep playing with reduced motion enabled. Select a still backdrop or skip the renderer for that preference.
- The module accesses `document` at import time. In a server-rendered framework, register the custom element on the client after rendering the HTML.

To check the bundled bytes on macOS, run this from the repository root and compare the result with the SHA-256 above.

```sh
shasum -a 256 skills/liquid-glass-web/assets/liquid-glass.js
```
