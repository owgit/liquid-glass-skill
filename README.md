# Liquid Glass Skill for Codex and Claude Code

Build a refractive toolbar, navigation bar or set of buttons for the web. This agent skill integrates Zerowing’s WebGL renderer with ordinary HTML controls. It includes iPhone Safari guidance, a self-hosted browser module and a working example that stays usable with JavaScript or WebGL disabled.

**[Try the interactive iPhone demo](https://owgit.github.io/liquid-glass-skill/examples/iphone/)** · [Read the skill](skills/liquid-glass-web/SKILL.md) · [Review the bundled engine](docs/upstream-review.md)

## Install for Codex and Claude Code

On macOS or Linux, clone the project and run the local installer.

```sh
git clone https://github.com/owgit/liquid-glass-skill.git
cd liquid-glass-skill
sh scripts/install.sh
```

The installer copies the complete skill into both clients’ personal skill folders. It requires no package manager, network access or administrator privileges after cloning. A repeat install recognizes identical files. If you have edited an installation, the installer identifies the path and preserves your copy. Move the old version aside to install a changed release.

| Scope | Command from the checkout |
| --- | --- |
| Codex only | `sh scripts/install.sh --codex` |
| Claude Code only | `sh scripts/install.sh --claude` |
| Both clients in an existing project | `sh scripts/install.sh --project /path/to/project` |

To install manually, copy the entire `skills/liquid-glass-web` directory into `~/.agents/skills/` for Codex or `~/.claude/skills/` for Claude Code. Keep the folder name `liquid-glass-web`. [Codex skill locations](https://developers.openai.com/codex/skills) · [Claude Code skill locations](https://code.claude.com/docs/en/skills)

## Use the skill

**Codex**

```text
Use $liquid-glass-web to add a refractive toolbar to my Next.js product page.
Keep its links in the server-rendered HTML and keep the controls readable on iPhone.
```

**Claude Code**

```text
/liquid-glass-web Review my mobile navigation. Add an optional glass mode
and keep keyboard focus, link destinations and the solid appearance working.
```

## How the iPhone example works

The example starts with opaque controls. Turn on **Glass effect** to load the local renderer and refract the aurora behind the navigation. Turn it off to return to the original controls. Motion and transparency preferences can keep the scene solid. The sample handles renderer failures and WebGL context loss.

To run the example locally from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/iphone/`. [Example source](examples/iphone/) · [iPhone accessibility and performance checks](skills/liquid-glass-web/references/mobile-web.md)

## Where the glass works

| Use case | Implementation |
| --- | --- |
| HTML or a client-rendered app | Self-host the bundled module and mark the controls inside a scene with the `glass` attribute. |
| React or Next.js with server rendering | Render the links and labels on the server. Load the WebGL module on the client after mount or interaction. |
| A toolbar over a photo or an aurora | Use that backdrop in the scene. The renderer samples the scene’s backdrop texture. |
| A fixed bar over arbitrary scrolling page content | Use a solid surface or CSS backdrop filtering. The WebGL scene cannot sample unrelated DOM behind it. |
| Native iOS app | Use SwiftUI or UIKit and the platform’s Liquid Glass APIs. This skill is designed for browser interfaces. |

## Source and license

Uygar Duzgun maintains the agent instructions, installer and demo under the [MIT License](LICENSE). The bundled WebGL renderer is Zerowing’s Liquid Glass 1.1.1, distributed with its [original MIT notice](skills/liquid-glass-web/assets/LICENSE.zerowing). The review records the exact source revision, file digest and integration limits. [Upstream project](https://github.com/MuhammadaliMS/liquid-glass) · [Release review](docs/upstream-review.md)
