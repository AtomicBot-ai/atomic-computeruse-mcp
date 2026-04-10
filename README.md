# @atomicbotai/computer-use-mcp

**Give your AI agent real eyes — not just blurry screenshots.**

An MCP server that turns any MCP-compatible client (Claude, Cursor, Windsurf, custom agents) into a desktop operator — with native OCR that actually reads what's on screen.

[![npm](https://img.shields.io/npm/v/@atomicbotai/computer-use-mcp)](https://www.npmjs.com/package/@atomicbotai/computer-use-mcp)
[![license](https://img.shields.io/npm/l/@atomicbotai/computer-use-mcp)](./LICENSE)
![node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)

---

## Why not just screenshots?

Most computer-use tools send a downscaled screenshot to the model and hope it figures out where to click. That works for large buttons. It fails everywhere else.

**The problem:** when a 2560×1600 screen is downscaled to fit a model's context window, small text becomes unreadable. Button labels, menu items, form placeholders, status bar text — all of it blurs into noise. The agent guesses coordinates and misses. It clicks the wrong button, types in the wrong field, or loops retrying the same failed action.

**The solution:** this server pairs every screenshot with **native OCR** that extracts text with pixel-precise coordinates. Instead of guessing, the agent gets a structured map of the UI:

```
Full-resolution screenshot captured (2560×1600) with grid overlay.
OCR anchors: "Send" at (1450, 890); "Cancel" at (1300, 890); "Subject" at (200, 145)
OCR layout: [e1 "Send" center=(1450, 890) box=(1400, 875, 100x30)] ...
```

The agent knows exactly where "Send" is. No guessing. No retries. No wasted tokens on failed clicks.

### Screenshot-only vs Screenshot + OCR

| | Screenshot only | Screenshot + OCR |
|---|---|---|
| Small text (12px labels) | Unreadable after downscale | Extracted with exact coordinates |
| Click accuracy | ~60-70% on complex UIs | ~95%+ with anchor-guided clicks |
| Retry loops | Common (3-5 attempts per action) | Rare |
| Token cost | High (retries burn tokens) | Low (first-attempt success) |
| Complex forms | Struggles with similar-looking fields | Identifies each field by label text |
| Status/error text | Misses or hallucinates content | Reads actual text with confidence scores |

## How OCR works under the hood

The `screenshot_full` action:

1. Takes a **full-resolution** screenshot (no downscaling)
2. Runs OCR via **native platform engine** — zero dependencies, no API keys, fully offline
3. Deduplicates and sorts text elements by reading order (top→bottom, left→right)
4. Returns anchor points with coordinates in screenshot-image space
5. Generates a structured prompt the model can act on immediately

| Platform | OCR Engine | Setup required |
|----------|-----------|----------------|
| **macOS** | Apple Vision framework | None — uses `xcrun swift` |
| **Windows** | Windows.Media.Ocr | None — built-in UWP API |
| **Linux** | — | Not available yet (graceful no-op) |

All processing is **local and offline**. No data leaves the machine.

---

## Quick start

### Run with npx (zero install)

```bash
npx @atomicbotai/computer-use-mcp
```

### Or install globally

```bash
npm install -g @atomicbotai/computer-use-mcp
computer-use-mcp
```

## Connect to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Add to `.cursor/mcp.json`:

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

## All 19 actions

The server exposes a single MCP tool called **`computer`**:

| Action | What it does |
|--------|-------------|
| `screenshot` | Capture screen (auto-downscaled with grid overlay) |
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

Coordinates are automatically mapped from screenshot image space to real screen points — the agent works in screenshot coordinates, the library handles the translation.

## Configuration

All configuration via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `COMPUTER_USE_OVERLAY_ENABLED` | `1` | Set to `0` to disable the "agent active" overlay |
| `COMPUTER_USE_OVERLAY_COLOR` | `AEFF00` | Overlay color (hex without `#`) |
| `COMPUTER_USE_OVERLAY_LABEL` | `Atomic bot` | Text shown on the overlay |
| `COMPUTER_USE_DEBUG_ARTIFACTS` | `0` | Set to `1` to save screenshots, OCR, and results per action |
| `COMPUTER_USE_DEBUG_DIR` | `./computer-use-debug` | Directory for debug output |
| `COMPUTER_USE_LOCK_DIR` | `~/.atomic-computeruse` | Directory for session lock file |

## Safety features

- **Session lock** — prevents two agents from controlling the desktop simultaneously
- **Visual overlay** — native "agent active" indicator so you always know when automation is running
- **Guardrails** — blocks misclicks in system dock/launcher and dangerous submit zones
- **Debug artifacts** — save every screenshot, OCR result, and action output for post-mortem analysis

## Programmatic usage

```typescript
import { createServer } from "@atomicbotai/computer-use-mcp";

const server = createServer();
// Connect your own MCP transport
```

## Platform support

| Feature | macOS | Windows | Linux |
|---------|:-----:|:-------:|:-----:|
| Screenshot + actions | ✅ | ✅ | ✅ |
| OCR | ✅ Vision | ✅ Media OCR | — |
| Overlay | ✅ Swift | ✅ PowerShell | — |
| Drag (native) | ✅ | ✅ | ✅ fallback |

## Built on

- [`@atomicbotai/computer-use`](https://www.npmjs.com/package/@atomicbotai/computer-use) — the core desktop automation library with standalone OCR, actions, overlay, and more
- [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — official MCP SDK

## License

MIT
