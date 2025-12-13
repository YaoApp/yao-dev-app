/**
 * Test assistant for Agent-based reranking
 * Simulates semantic reranking by reversing item order and applying top_n
 */

/**
 * Next Hook - handles rerank requests
 * Returns reordered item IDs based on mock "semantic" analysis
 */
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  // Get the last user message (rerank request)
  const lastMessage = payload.messages?.[payload.messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return null;
  }

  // Parse request
  let request: {
    query?: string;
    items?: any[];
    top_n?: number;
    action?: string;
  } = {};

  try {
    if (typeof lastMessage.content === "string") {
      request = JSON.parse(lastMessage.content);
    }
  } catch (e) {
    return { data: { error: "Invalid JSON request" } };
  }

  // Validate action
  if (request.action !== "rerank") {
    return { data: { error: "Invalid action, expected 'rerank'" } };
  }

  // Validate items
  if (!request.items || request.items.length === 0) {
    return { data: { order: [] } };
  }

  // Mock semantic reranking: reverse order to simulate LLM analysis
  // In real implementation, this would use LLM to analyze relevance
  const reorderedItems = [...request.items].reverse();

  // Apply top_n
  const topN = request.top_n || reorderedItems.length;
  const finalItems = reorderedItems.slice(0, topN);

  // Return ordered citation IDs
  const order = finalItems.map((item: any) => item.citation_id);

  return {
    data: {
      order: order,
      query: request.query,
      total: request.items.length,
      returned: order.length,
    },
  };
}
