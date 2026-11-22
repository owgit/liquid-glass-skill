# Tuning variables and component recipes

Values below are read from the bundled renderer, version 1.1.1. Each recipe is running in [the gallery example](https://owgit.github.io/liquid-glass-skill/examples/iphone/).

## Scene attributes

Set these on `<liquid-glass>`.

| Attribute | Effect |
| --- | --- |
| `backdrop` | `aurora` (default, generated and animated) or the URL of an image or an `.mp4`/`.webm` video. A cross-origin file needs CORS headers. |
| `colors` | Up to four colours for the generated aurora, separated by spaces. |
| `dim` | 0 to 0.9. Darkens the backdrop under the glass, like a scrim on a hero photo. |
| `inner-light` | Makes the panes glow in turn without audio input. Leave it off unless the design asks for it. |

## Pane attributes and variables

Add `glass` to an element inside the scene. Add `glass-drag` as well to let a pointer move it. Dragging has no built-in keyboard equivalent, so give a draggable pane a keyboard path or keep it decorative. Set the variables in CSS on the pane.

| Variable | Default | Range | Use |
| --- | --- | --- | --- |
| `--glass-tint` | none | any colour | Colour mixed into the glass. Its alpha is the strength. |
| `--glass-depth` | 1 | 0.2 to 3 | Thickness. Higher values widen the bent rim. |
| `--glass-dome` | 1 | 0 to 4 | How far the face crowns outward. Higher values magnify. |
| `--glass-ior` | 1.38 | 1.05 to 2.4 | Index of refraction. Window glass is about 1.5. |
| `--glass-frost` | 0 | 0 to 1 | Blur. Raise it behind body text. |
| `--glass-chroma` | 0.008 | 0 to 0.1 | Colour fringing at the rim. |
| `--glass-pull` | size-based, at most 9 | px | How far the rim bulges toward the pointer. 0 turns it off. |
| `--glass-press` | 1.045 | 0.8 to 1.3 | Scale while pressed. 1 turns it off. |
| `--glass-shadow` | 1 | 0 to 1 | Drop shadow strength. |
| `--glass-glow` | 1 | 0 to 2 | Response to audio or `inner-light`. |
| `--glass-lens` | none | `x y radius` in px | A raised disc on the face, measured from the centre. |

The pane takes its shape from the element’s own size, position and `border-radius`. Keep the element’s background opaque until the scene reports `data-renderer="webgl"` and `data-ready`, as described in the skill.

## Recipes

Start from these and adjust against the real backdrop. A busy backdrop with fine detail hides refraction, so prefer large shapes behind small panes, and check label contrast over the brightest area.

| Component | Markup | Variables |
| --- | --- | --- |
| Navigation bar | `<nav glass>` holding plain links. One pane for the bar keeps the pane count low. | `--glass-depth: 1.5; --glass-dome: 1.3; --glass-ior: 1.5` |
| Primary button | `<a glass>` or `<button glass>` | The bar’s values plus `--glass-tint: rgba(255, 138, 61, .55)` in the brand colour |
| Segmented control | `<fieldset glass>` holding radio inputs and labels. Mark the checked label in CSS. | `--glass-frost: .35` |
| Switch | `<button glass aria-pressed="false">` with a visible label | The bar’s values |
| Card or notice | `<article glass>` | `--glass-frost: .5; --glass-depth: .8; --glass-dome: .8; --glass-tint: rgba(4, 20, 32, .45)` so body text stays readable |
| Tab bar | `<nav glass>` of links, each with an icon and a one-word label, plus a round `<a glass>` action | `--glass-depth: 1.6; --glass-dome: 1.4; --glass-frost: .3; --glass-tint: rgba(6, 24, 20, .4)`. To mark the selected tab, set `--glass-lens` to that tab’s centre from script. |
| Lens | `<button glass glass-drag>` with `border-radius: 50%` | `--glass-depth: 2; --glass-dome: 2.2; --glass-pull: 0` |

Each scene is its own WebGL context, and browsers limit how many a page can hold. Group nearby controls into one scene, and remove a scene that is no longer needed.

### Tab bar

These points follow Apple’s Human Interface Guidelines for [tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [materials](https://developer.apple.com/design/human-interface-guidelines/materials) and [colour](https://developer.apple.com/design/human-interface-guidelines/color):

- Use the bar to move between sections, and keep it visible in every section. Put actions elsewhere.
- Keep to a few tabs. Give each a filled icon and a one-word label, and never hide or disable one.
- Keep the bar monochrome over colourful content. Give only the selected tab the accent colour, and pick an accent that differs from every backdrop the bar sits over.
- Put search at the trailing end as its own round button.
- Frost the bar so the labels stay readable. Use clear glass only over photos and video, and dim a bright backdrop by about 0.35 with the scene’s `dim` attribute.

The moving lens copies how the iOS tab bar behaves; the guidelines do not describe it. The lens rests on the selected tab at about 0.46 of the bar’s height, glides to a tapped tab, and grows to about 0.7 while a finger holds and drags it. The renderer springs `--glass-lens` to each new value, so the script writes only the target position and radius. The lens bends the backdrop and leaves the labels alone, so scale the tab under it in CSS.

Keep the tabs as links, so a tap, the keyboard and a page without script all work without the drag. On the bar in glass mode, set `touch-action: pan-y` so a sideways drag reaches the script while the page still scrolls, and `-webkit-touch-callout: none` so a long press in Safari does not open the link preview.
