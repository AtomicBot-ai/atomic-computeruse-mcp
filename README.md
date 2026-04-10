# @atomicbotai/computer-use-mcp

**MCP server for desktop automation — plug computer-use into Claude, Cursor, or any MCP client.**

A ready-to-run [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes full desktop control as a single `computer` tool. Screenshot, click, type, scroll, OCR — all through the standard MCP stdio transport.

[![npm](https://img.shields.io/npm/v/@atomicbotai/computer-use-mcp)](https://www.npmjs.com/package/@atomicbotai/computer-use-mcp)
[![license](https://img.shields.io/npm/l/@atomicbotai/computer-use-mcp)](./LICENSE)
![node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)

---

## Quick Start

### Run directly with npx

```bash
npx @atomicbotai/computer-use-mcp
```

### Or install globally

```bash
npm install -g @atomicbotai/computer-use-mcp
computer-use-mcp
```

## Connect to Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "computer-use": {
      "command": "npx",
      "args": ["@atomicbotai/computer-use-mcp"],
      "env": {
        "COMPUTER_USE_OVERLAY_ENABLED": "1",
        "COMPUTER_USE_OVERLAY_LABEL": "Claude"
      }
    }
  }
}
```

## Connect to Cursor

Add this to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "computer-use": {
      "command": "npx",
      "args": ["@atomicbotai/computer-use-mcp"],
      "env": {
        "COMPUTER_USE_OVERLAY_ENABLED": "1",
        "COMPUTER_USE_OVERLAY_LABEL": "Cursor"
      }
    }
  }
}
```

## Configuration

All configuration is done via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `COMPUTER_USE_OVERLAY_ENABLED` | `1` | Set to `0` to disable the "agent active" overlay |
| `COMPUTER_USE_OVERLAY_COLOR` | `AEFF00` | Overlay color (hex without `#`) |
| `COMPUTER_USE_OVERLAY_LABEL` | `Atomic bot` | Text shown on the overlay |
| `COMPUTER_USE_DEBUG_ARTIFACTS` | `0` | Set to `1` to save screenshots, OCR, and results per action |
| `COMPUTER_USE_DEBUG_DIR` | `./computer-use-debug` | Directory for debug output |
| `COMPUTER_USE_LOCK_DIR` | `~/.atomic-computeruse` | Directory for session lock file |

## Available Tool

The server exposes a single MCP tool called **`computer`** with 19 actions:

| Action | What it does |
|--------|-------------|
| `screenshot` | Capture screen (auto-downscaled with grid) |
| `screenshot_full` | Full-resolution capture + OCR text anchors |
| `click` / `double_click` / `triple_click` | Click at coordinates |
| `type` | Insert literal text |
| `press` | Keyboard shortcuts (`cmd+s`, `enter`, etc.) |
| `submit_input` | Press Enter to submit |
| `scroll` | Scroll in any direction |
| `cursor_position` | Get cursor location |
| `mouse_move` | Move cursor |
| `drag` | Drag and drop |
| `wait` | Pause (max 30s) |
| `hold_key` | Hold key combo (max 10s) |
| `display_list` | List connected displays |
| `read_clipboard` / `write_clipboard` | Clipboard access |
| `open_app` / `switch_app` | Launch or focus apps by name |

Coordinates are automatically mapped from screenshot image space to real screen points.

## Programmatic Usage

```typescript
import { createServer } from "@atomicbotai/computer-use-mcp";

const server = createServer();
// Connect your own transport
```

## Platform Support

- **macOS** — full support (Vision OCR, Swift overlay, native drag)
- **Windows** — full support (Media OCR, PowerShell overlay, native drag)
- **Linux** — core actions work (no OCR or overlay)

## Built on

- [`@atomicbotai/computer-use`](https://www.npmjs.com/package/@atomicbotai/computer-use) — the core desktop automation library
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — official MCP SDK

## License

MIT
