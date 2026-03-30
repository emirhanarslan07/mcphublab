require('dotenv').config({ path: '.env.local' });
const { analyzeServerWithClaude } = require('../lib/scanner');

async function test() {
  console.log("Starting scanner test...");
  
  // Real world example code for a filesystem MCP server (shortened)
  const mockCode = `
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

const allowedDirectories = process.argv.slice(2).map((dir) => path.resolve(dir));

const server = new Server({ name: "filesystem", version: "0.1.0" });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "read_file", description: "Read a file from allowed directories", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "read_file") {
    const filePath = path.resolve(String(request.params.arguments?.path));
    // Vulnerability Check: Is filePath inside allowedDirectories?
    const isAllowed = allowedDirectories.some((dir) => filePath.startsWith(dir));
    if (!isAllowed) throw new McpError(ErrorCode.InvalidParams, "Access denied");
    
    const content = await fs.readFile(filePath, "utf-8");
    return { content: [{ type: "text", text: content }] };
  }
  throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
});
`;

  try {
    const result = await analyzeServerWithClaude(mockCode);
    console.log("====== SCAN RESULT ======");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Scanner failed:", error);
  }
}

test();
