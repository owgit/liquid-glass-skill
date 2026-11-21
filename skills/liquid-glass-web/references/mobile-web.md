# iPhone Safari and browser integration

## Controls and layout

Use a link with a real `href` for navigation and a button for actions. Give icon-only controls an accessible name. Give a two-state control a stable label and update `aria-pressed`. Keep tap targets generous, typically at least 44 CSS pixels each way when space permits. Provide alternatives for hover and drag. Preserve focus when toggling the enhancement.

Use `viewport-fit=cover` only when drawing to screen edges. On edge-to-edge bars, combine ordinary padding with `env(safe-area-inset-*)` using `max()`. Account for landscape and for the bottom bar covering the final link. Allow browser zoom, test long or enlarged labels and use content-driven height. [WebKit safe-area guidance](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

## Reading and motion

Check the brightest area of the actual backdrop with controls focused, active and at rest. Target 4.5:1 for ordinary text and 3:1 for large text. Dimming the backdrop and adding a dark surface behind the label are independent controls. Offer solid controls even in browsers that cannot report the user's transparency preference. [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [Reduced transparency support](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency)

For a lightweight first paint, render a plain container and native controls on the server. On opt-in, dynamically import the module, create the scene and reparent the same controls. On opt-out, move the controls back before removing the scene so the renderer disconnects and releases resources. In React, let React own this transition and preserve focus and form state. Reserve the same layout space in each mode. A merely hidden canvas is a poor substitute for disconnecting a scene that is no longer needed.

## Verification

| Check | What to look for |
| --- | --- |
| Initial HTML, JavaScript disabled or module blocked | Headings, labels and destinations are present and the original actions work. |
| Keyboard and screen reader | Tab order follows the page, focus stays visible, the toggle announces its state and anchors announce meaningful destinations. Test VoiceOver on a device when available. |
| Reduced effects or context loss | Solid surfaces remain legible. The page can still scroll and navigate. Switching a preference while the page is open updates the scene. |
| Narrow and landscape iPhone viewports | Safe areas clear fixed bars. Long labels wrap, text zoom works and the final action remains reachable. |
| Mobile graphics cost | Record with and without the effect on the target phone. Compare scrolling, rendering time and layout shifts with the same backdrop. Record device, OS, browser and conditions. |

For native apps, consult [Apple’s guidance on adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass). Use a Safari device or simulator for browser-specific behavior. Report desktop emulation as emulation.
