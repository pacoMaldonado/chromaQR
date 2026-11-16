#!/usr/bin/env bash
# ChromaQR — Kernel-Level Sandboxed Launcher for Linux (.rpm / .deb) using Bubblewrap (bwrap)
# Isolates network (--unshare-net) and restricts home directory access strictly to AppData & Downloads.

set -euo pipefail

APP_DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/com.chromaqr.desktop"
DOWNLOADS_DIR="${XDG_DOWNLOAD_DIR:-$HOME/Descargas}"
mkdir -p "$APP_DATA_DIR"

if ! command -v bwrap >/dev/null 2>&1; then
  exec /usr/bin/chromaqr "$@"
fi

exec bwrap \
  --ro-bind /usr /usr \
  --ro-bind /lib /lib \
  --ro-bind-try /lib64 /lib64 \
  --ro-bind /bin /bin \
  --ro-bind /etc /etc \
  --proc /proc \
  --dev /dev \
  --tmpfs /tmp \
  --tmpfs "$HOME" \
  --bind "$APP_DATA_DIR" "$APP_DATA_DIR" \
  --bind-try "$DOWNLOADS_DIR" "$DOWNLOADS_DIR" \
  --ro-bind-try "/run/user/$(id -u)" "/run/user/$(id -u)" \
  --unshare-net \
  --die-with-parent \
  /usr/bin/chromaqr "$@"
