/**
 * QueryDSL Generation Agent - Next Hook
 * Simulates QueryDSL generation without LLM calls
 * Returns fixed QueryDSL structure for testing
 */

/**
 * Next hook - processes QueryDSL generation request and returns mock result
 */
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  // Get the last user message
  const lastMessage = payload.messages?.[payload.messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return null;
  }

  // Parse the request (content is JSON string)
  let request: {
    query?: string;
    models?: string[];
    limit?: number;
    allowed_fields?: string[];
  } = {};

  try {
    if (typeof lastMessage.content === "string") {
      request = JSON.parse(lastMessage.content);
    }
  } catch (e) {
    // If not JSON, treat content as the query
    request = { query: lastMessage.content as string };
  }

  const query = request.query || "";
  const limit = request.limit || 20;

  // Return fixed QueryDSL structure for testing
  // Note: Expression fields are strings, not objects
  // Must include 'from' field to pass linting
  return {
    data: {
      dsl: {
        select: ["id", "name", "status", "created_at"],
        from: "users",
        wheres: [
          {
            field: "status",
            op: "=",
            value: "active",
          },
        ],
        orders: [
          {
            field: "created_at",
            sort: "desc",
          },
        ],
        limit: limit,
      },
      explain: `Generated QueryDSL for: "${query}"`,
      warnings: [],
    },
  };
}
