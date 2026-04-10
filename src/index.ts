import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createComputerTool, type ComputerToolOptions } from "@atomicbotai/computer-use";

function readOptionsFromEnv(): ComputerToolOptions {
  const opts: ComputerToolOptions = {};

  const overlayEnabled = process.env.COMPUTER_USE_OVERLAY_ENABLED;
  const overlayColor = process.env.COMPUTER_USE_OVERLAY_COLOR;
  const overlayLabel = process.env.COMPUTER_USE_OVERLAY_LABEL;

  if (overlayEnabled !== undefined || overlayColor || overlayLabel) {
    opts.overlay = {
      ...(overlayEnabled !== undefined && { enabled: overlayEnabled !== "0" }),
      ...(overlayColor && { color: overlayColor }),
      ...(overlayLabel && { label: overlayLabel }),
    };
  }

  if (process.env.COMPUTER_USE_DEBUG_ARTIFACTS === "1") {
    opts.debugArtifacts = true;
    if (process.env.COMPUTER_USE_DEBUG_DIR) {
      opts.debugArtifactsDir = process.env.COMPUTER_USE_DEBUG_DIR;
    }
  }

  if (process.env.COMPUTER_USE_LOCK_DIR) {
    opts.lockDir = process.env.COMPUTER_USE_LOCK_DIR;
  }

  return opts;
}

export function createServer(): Server {
  const tool = createComputerTool(readOptionsFromEnv());

  const server = new Server(
    { name: "computer-use", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.schema as Record<string, unknown>,
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== tool.name) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    const args = (request.params.arguments ?? {}) as Record<string, unknown>;
    const toolCallId = `mcp-${Date.now()}`;

    const result = await tool.execute(toolCallId, args);

    return {
      content: result.content.map((item) => {
        if (item.type === "image") {
          return {
            type: "image" as const,
            data: item.data,
            mimeType: item.mimeType,
          };
        }
        return {
          type: "text" as const,
          text: item.text,
        };
      }),
    };
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
