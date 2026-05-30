/**
 * MCP Server — stdio transport
 *
 * Exposes sales/demand/outreach tools as typed MCP tools that Claude, Cursor,
 * Copilot, or any MCP host can discover and invoke.
 *
 * Usage:
 *   npx ts-node src/mcp/server.ts
 *
 * MCP client config (e.g. claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "sales": {
 *         "command": "npx",
 *         "args": ["ts-node", "src/mcp/server.ts"]
 *       }
 *     }
 *   }
 */

import * as readline from "readline";

interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: unknown;
}

const TOOLS = [
  {
    name: "analyze_call",
    description: "Ingest a sales call recording and extract sentiment, objections, talk ratios, and stage inference.",
    inputSchema: {
      type: "object" as const,
      properties: {
        call_id: { type: "string", description: "Unique call identifier" },
      },
      required: ["call_id"],
    },
  },
  {
    name: "update_pipeline",
    description: "Move a deal to a new stage in the CRM pipeline.",
    inputSchema: {
      type: "object" as const,
      properties: {
        deal_id: { type: "string" },
        stage: {
          type: "string",
          enum: ["Prospecting", "Qualification", "Proposal", "Closed-Won", "Closed-Lost"],
        },
        reason: { type: "string" },
      },
      required: ["deal_id", "stage"],
    },
  },
  {
    name: "draft_followup",
    description: "Generate a post-call follow-up email from conversation content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        call_id: { type: "string" },
        tone: { type: "string", enum: ["professional", "friendly", "urgent"], default: "professional" },
      },
      required: ["call_id"],
    },
  },
  {
    name: "get_benchmarks",
    description: "Get industry benchmark data for win rate, show rate, and cycle length.",
    inputSchema: {
      type: "object" as const,
      properties: {
        segment: { type: "string", description: "Industry segment (e.g. SaaS — Mid-Market)" },
      },
      required: ["segment"],
    },
  },
];

function send(msg: JsonRpcMessage) {
  const payload = JSON.stringify(msg);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(payload)}\r\n\r\n${payload}`);
}

function handleToolCall(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "analyze_call":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                call_id: args.call_id,
                sentiment: "Positive",
                stage_inferred: "Qualification",
                objections: ["Pricing", "Timeline"],
                talk_ratio: { rep: 0.42, prospect: 0.58 },
              },
              null,
              2
            ),
          },
        ],
        isError: false,
      };
    case "update_pipeline":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                deal_id: args.deal_id,
                previous_stage: "Prospecting",
                new_stage: args.stage,
                updated_at: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
        isError: false,
      };
    case "draft_followup":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                call_id: args.call_id,
                subject: "Great speaking with you today",
                body: "Hi there,\n\nThanks for the time today...",
                tone: args.tone ?? "professional",
              },
              null,
              2
            ),
          },
        ],
        isError: false,
      };
    case "get_benchmarks":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                segment: args.segment,
                win_rate: 0.38,
                show_rate: 0.72,
                avg_cycle_days: 42,
                your_team: { win_rate: 0.41, show_rate: 0.68, avg_cycle_days: 38 },
              },
              null,
              2
            ),
          },
        ],
        isError: false,
      };
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}

const rl = readline.createInterface({ input: process.stdin });

rl.on("line", (header: string) => {
  if (!header.startsWith("Content-Length: ")) return;
  const length = parseInt(header.slice("Content-Length: ".length).trim(), 10);
  rl.once("line", () => {
    // blank line
    rl.once("line", (payload: string) => {
      const msg = JSON.parse(payload.substring(0, length)) as JsonRpcMessage;

      if (msg.method === "initialize") {
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "mcp-server", version: "1.0.0" },
          },
        });
      } else if (msg.method === "tools/list") {
        send({ jsonrpc: "2.0", id: msg.id, result: { tools: TOOLS } });
      } else if (msg.method === "tools/call") {
        const params = (msg.params ?? {}) as { name: string; arguments: Record<string, unknown> };
        send({
          jsonrpc: "2.0",
          id: msg.id,
          result: handleToolCall(params.name, params.arguments),
        });
      }
    });
  });
});
