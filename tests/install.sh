#!/bin/sh
set -eu
unset CDPATH

repo=$(cd -- "$(dirname -- "$0")/.." && pwd -P)
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' 0

# A fixture lets us test removed, modified and unrelated files without
# changing the release package or touching anyone's installed skills.
fixture=$scratch/checkout
package=$fixture/skills/liquid-glass-web
installer=$fixture/scripts/install.sh
mkdir -p "$fixture/scripts" "$package/assets"
cp "$repo/scripts/install.sh" "$installer"
echo 'fixture skill' > "$package/SKILL.md"
echo 'fixture asset' > "$package/assets/engine"

project="$scratch/Project with spaces"
mkdir "$project"
sh "$installer" --project "$project"
codex="$project/.agents/skills/liquid-glass-web"
claude="$project/.claude/skills/liquid-glass-web"
diff -qr "$package" "$codex"
diff -qr "$package" "$claude"
second_run=$(sh "$installer" --project "$project")
[ "$(printf '%s\n' "$second_run" | grep -c '^Already installed: ')" = 2 ]

expect_failure() {
    if sh "$installer" "$@" > "$scratch/rejected.log" 2>&1; then
        echo "Unexpected installer success: $*" >&2
        exit 1
    fi
}

echo 'custom edit' > "$claude/SKILL.md"
mv "$codex" "$scratch/first-install"
expect_failure --project "$project"
[ ! -e "$codex" ]
[ "$(cat "$claude/SKILL.md")" = 'custom edit' ]
sh "$installer" --project "$project" --codex
diff -qr "$package" "$codex"

links=$scratch/links
mkdir -p "$links/.agents/skills" "$links/.claude"
ln -s ../.agents/skills "$links/.claude/skills"
sh "$installer" --project "$links"
diff -qr "$package" "$links/.claude/skills/liquid-glass-web"

links_only=$scratch/links-only
mkdir -p "$links_only/.claude/skills"
linked_skill=$links_only/.claude/skills/liquid-glass-web
ln -s "$package" "$linked_skill"
sh "$installer" --claude --project "$links_only"
[ -L "$linked_skill" ] && [ ! -e "$links_only/.agents" ]
rm "$linked_skill"
ln -s "$scratch/does-not-exist" "$linked_skill"
expect_failure --claude --project "$links_only"
[ -L "$linked_skill" ]
expect_failure --claude --codex --project "$links_only"
expect_failure --project "$scratch/missing-project"
expect_failure --project "$package"
echo "Installer checks passed."
