#!/usr/bin/env sh
set -eu

detect_os() {
	case "$(uname -s)" in
		MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
		*) echo "unix" ;;
	esac
}

to_shell_path() {
	if command -v cygpath >/dev/null 2>&1; then
		cygpath -u "$1"
	else
		printf '%s\n' "$1"
	fi
}

OS="$(detect_os)"

# Resolve the same install/data locations that install.sh uses.
if [ "$OS" = "windows" ]; then
	INSTALL_DIR="$(to_shell_path "${LOCALAPPDATA:-$HOME/AppData/Local}")/Programs/ask"
	DATA_DIR="$(to_shell_path "${APPDATA:-$HOME/AppData/Roaming}")/ask"
else
	INSTALL_DIR="${ASK_INSTALL_DIR:-$HOME/.local/bin}"
	DATA_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ask"
	HIST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/ask"
fi

# Remove the installed binary plus all persisted app data.
rm -f "$INSTALL_DIR/ask" "$INSTALL_DIR/ask.exe"
rm -rf "$DATA_DIR"
if [ "${HIST_DIR:-}" != "" ] && [ "$HIST_DIR" != "$DATA_DIR" ]; then
	rm -rf "$HIST_DIR"
fi

echo "ask uninstalled"
