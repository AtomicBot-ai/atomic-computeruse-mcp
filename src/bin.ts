#!/usr/bin/env node
import { startServer } from "./index.js";

startServer().catch((err) => {
  console.error("Failed to start computer-use MCP server:", err);
  process.exit(1);
});
