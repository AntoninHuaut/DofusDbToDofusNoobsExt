#!/bin/bash
set -euo pipefail

check_deps() {
    for cmd in zip jq; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            echo "Error: '$cmd' is not installed." >&2
            exit 1
        fi
    done
}

zip_ext() {
    suffix="${1:-}"
    if [[ -n "$suffix" ]]; then
        suffix="-$suffix"
    fi
    zip -r extension$suffix.zip . -x "build.sh" -x "manifest-chrome.json" -x "manifest-firefox.json" -x "*.md" -x ".git/*"
}

build() {
    type="$1"
    cp "manifest-$type.json" "manifest.json"
    version=$(jq -r '.version' 'manifest.json')
    zip_ext "$type-$version"
    rm "manifest.json"
    echo "${type^} built"
}

check_deps
build "$1"
