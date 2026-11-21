#!/bin/sh
set -eu
unset CDPATH

usage() {
    cat <<'EOF'
Usage: sh scripts/install.sh [--codex | --claude] [--project DIR]

Install Liquid Glass for Codex and Claude Code. Select one client with
--codex or --claude. Skills are installed in your home directory unless
--project supplies an existing project directory.

An identical installation is reused. If a different skill already occupies
the destination, move it aside yourself before running the installer again.
EOF
}

die() { echo "install: $*" >&2; exit 1; }

client=both
project=
while [ "$#" -gt 0 ]; do
    case "$1" in
        --codex|--claude)
            [ "$client" = both ] || die "choose one client or omit both selectors"
            client=${1#--}
            ;;
        --project)
            [ "$#" -ge 2 ] && [ -n "$2" ] || die "--project requires a directory"
            [ -z "$project" ] || die "--project was specified twice"
            project=$2
            shift
            ;;
        -h|--help) usage; exit 0 ;;
        *) die "unknown argument: $1" ;;
    esac
    shift
done

script_dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
source_dir=$(cd -P -- "$script_dir/../skills/liquid-glass-web" && pwd -P)
[ -f "$source_dir/SKILL.md" ] || die "missing $source_dir/SKILL.md"
if [ -n "$project" ]; then
    [ -d "$project" ] || die "project directory does not exist: $project"
    root=$(cd -P -- "$project" && pwd -P)
else
    root=${HOME:?HOME must be set for a personal install}
    [ -d "$root" ] || die "home directory does not exist: $root"
    root=$(cd -P -- "$root" && pwd -P)
fi
case "$root/" in
    "$source_dir/"*) die "choose a directory outside the skill package" ;;
esac

case "$client" in
    codex) set -- "$root/.agents/skills" ;;
    claude) set -- "$root/.claude/skills" ;;
    both) set -- "$root/.agents/skills" "$root/.claude/skills" ;;
esac

check_destination() {
    if [ -L "$1" ]; then
        link_dir=$(cd -P -- "$1" 2>/dev/null && pwd -P) || link_dir=
        [ "$link_dir" = "$source_dir" ] || die "preserving existing link: $1"
    elif [ -d "$1" ]; then
        diff -qr "$source_dir" "$1" >/dev/null || die "preserving different installation: $1"
    elif [ -e "$1" ]; then
        die "preserving existing file: $1"
    fi
}

# Check both clients before writing so a known conflict leaves both untouched.
for base do
    check_destination "$base/liquid-glass-web"
done

install_one() (
    base=$1
    destination=$base/liquid-glass-web
    mkdir -p "$base"
    physical_base=$(cd -P -- "$base" && pwd -P)
    case "$physical_base/" in
        "$source_dir/"*) die "installation target is inside the source package: $base" ;;
    esac
    check_destination "$destination"
    if [ -d "$destination" ]; then
        echo "Already installed: $destination"
        return
    fi

    lock=$base/.liquid-glass-web-install.lock
    mkdir "$lock" || die "could not acquire install lock: $lock"
    trap 'rm -rf "$lock/staged"; rmdir "$lock"' 0
    trap 'exit 1' HUP INT TERM
    check_destination "$destination"
    if [ -d "$destination" ]; then
        echo "Already installed: $destination"
        return
    fi
    cp -R "$source_dir" "$lock/staged"
    mv "$lock/staged" "$destination"
    echo "Installed: $destination"
)

for base do
    install_one "$base"
done
