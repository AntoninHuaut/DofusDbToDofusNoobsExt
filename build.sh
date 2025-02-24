#!/bin/bash
set -euo pipefail

zip_ext() {
    zip -r extension.zip . -x "build.sh" -x "manifest-chrome.json" -x "manifest-firefox.json" -x "README.md"
}

build() {
    type="$1"
    cp "manifest-$type.json" "manifest.json"
    zip_ext
    rm "manifest.json"
    echo "${type^} built"
}

build "$1"
