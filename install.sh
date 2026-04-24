#!/usr/bin/env sh
set -eu

fail() {
	echo "ask install failed: $1" >&2
	exit 1
}

detect_os() {
	case "$(uname -s)" in
		Linux*) echo "linux" ;;
		Darwin*) echo "macos" ;;
		MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
		*) fail "unsupported OS: $(uname -s)" ;;
	esac
}

detect_arch() {
	case "$(uname -m)" in
		x86_64|amd64) echo "x86_64" ;;
		arm64|aarch64) echo "aarch64" ;;
		*) fail "unsupported architecture: $(uname -m)" ;;
	esac
}

download() {
	if command -v curl >/dev/null 2>&1; then
		curl -fsSL "$1" -o "$2"
	elif command -v wget >/dev/null 2>&1; then
		wget -qO "$2" "$1"
	else
		fail "curl or wget is required"
	fi
}

to_shell_path() {
	if command -v cygpath >/dev/null 2>&1; then
		cygpath -u "$1"
	else
		printf '%s\n' "$1"
	fi
}

OS="$(detect_os)"
ARCH="$(detect_arch)"

# Pick the correct release asset and install/data directories for this machine.
case "$OS:$ARCH" in
	windows:x86_64)
		ASSET="ask-x86_64-pc-windows-msvc.exe"
		INSTALL_DIR="$(to_shell_path "${LOCALAPPDATA:-$HOME/AppData/Local}")/Programs/ask"
		DATA_DIR="$(to_shell_path "${APPDATA:-$HOME/AppData/Roaming}")/ask"
		BIN_PATH="$INSTALL_DIR/ask.exe"
		;;
	linux:x86_64)
		ASSET="ask-x86_64-unknown-linux-gnu"
		INSTALL_DIR="${ASK_INSTALL_DIR:-$HOME/.local/bin}"
		DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ask"
		HIST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/ask"
		BIN_PATH="$INSTALL_DIR/ask"
		;;
	linux:aarch64)
		ASSET="ask-aarch64-unknown-linux-gnu"
		INSTALL_DIR="${ASK_INSTALL_DIR:-$HOME/.local/bin}"
		DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ask"
		HIST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/ask"
		BIN_PATH="$INSTALL_DIR/ask"
		;;
	macos:x86_64)
		ASSET="ask-x86_64-apple-darwin"
		INSTALL_DIR="${ASK_INSTALL_DIR:-$HOME/.local/bin}"
		DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ask"
		HIST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/ask"
		BIN_PATH="$INSTALL_DIR/ask"
		;;
	macos:aarch64)
		ASSET="ask-aarch64-apple-darwin"
		INSTALL_DIR="${ASK_INSTALL_DIR:-$HOME/.local/bin}"
		DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ask"
		HIST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/ask"
		BIN_PATH="$INSTALL_DIR/ask"
		;;
	*) fail "unsupported target: $OS/$ARCH" ;;
esac

HIST_DIR="${HIST_DIR:-$DATA_DIR}"
URL="https://github.com/IsaiahGardeen1017/ask/releases/latest/download/$ASSET"

# Create the install/data folders, reset config.json on every install,
# and create history only if it does not already exist.
mkdir -p "$INSTALL_DIR" "$DATA_DIR" "$HIST_DIR"
rm -f "$DATA_DIR/config.json"
printf '{"logQuerires":false}\n' > "$DATA_DIR/config.json"
[ -f "$HIST_DIR/hist.json" ] || printf '{"history":[]}\n' > "$HIST_DIR/hist.json"

# Download the precompiled binary for this platform into the install directory.
download "$URL" "$BIN_PATH"
chmod +x "$BIN_PATH" 2>/dev/null || true

echo "ask installed to $BIN_PATH"
# If the install directory is not already on PATH, tell the user what to add.
case ":$PATH:" in
	*":$INSTALL_DIR:"*) ;;
	*) echo "Add $INSTALL_DIR to your PATH if the ask command is not found." ;;
esac
