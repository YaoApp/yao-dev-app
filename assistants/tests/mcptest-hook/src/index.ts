// @ts-nocheck
/**
 * Create hook for mcptest-hook
 * Always returns MCP servers that override default (only ping, not echo)
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  return {
    mcp_servers: [
      {
        server_id: "echo",
        tools: ["ping"], // Only ping, filter out echo
      },
    ],
  };
}
