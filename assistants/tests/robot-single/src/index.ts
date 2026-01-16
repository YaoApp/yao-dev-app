// @ts-nocheck
/**
 * Robot Single Call Test - Next Hook
 * Returns structured data for testing GetJSON() and GetJSONArray()
 */

function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  const completion = payload.completion;
  const messages = payload.messages;

  // Get the last user message
  const userInput = getLastUserMessage(messages);
  const inputLower = userInput.toLowerCase();

  // Route based on input keywords
  if (inputLower.includes("next_hook")) {
    // Test Next hook data path
    return handleNextHookTest(inputLower);
  }

  if (inputLower.includes("array_test")) {
    // Test JSON array response
    return {
      data: [
        { id: 1, name: "Item 1", status: "active" },
        { id: 2, name: "Item 2", status: "pending" },
        { id: 3, name: "Item 3", status: "completed" },
      ],
    };
  }

  if (inputLower.includes("empty_test")) {
    // Test empty response (should fall back to completion)
    return null;
  }

  if (inputLower.includes("error_test")) {
    // Test error scenario
    throw new Error("Intentional test error from Next hook");
  }

  // Default: let completion content be used
  return null;
}

/**
 * Handle Next hook specific tests
 */
function handleNextHookTest(input: string): agent.NextHookResponse {
  if (input.includes("inspiration")) {
    return {
      data: {
        type: "inspiration",
        content: "Next hook inspiration response",
        confidence: 0.95,
        source: "next_hook",
      },
    };
  }

  if (input.includes("goals")) {
    return {
      data: {
        type: "goals",
        content: "Next hook goals response",
        goals: [
          { id: "ng1", description: "Next hook goal 1", priority: "high" },
          { id: "ng2", description: "Next hook goal 2", priority: "medium" },
        ],
        source: "next_hook",
      },
    };
  }

  if (input.includes("tasks")) {
    return {
      data: {
        type: "tasks",
        tasks: [
          {
            id: "nt1",
            goal_ref: "ng1",
            description: "Next hook task 1",
            executor_type: "test",
            executor_id: "test.executor",
          },
        ],
        source: "next_hook",
      },
    };
  }

  // Default next hook response
  return {
    data: {
      type: "next_hook_default",
      message: "Response from Next hook",
      input: input,
      timestamp: Date.now(),
    },
  };
}

/**
 * Extract last user message content
 */
function getLastUserMessage(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return "";
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user" && msg.content && typeof msg.content === "string") {
      return msg.content;
    }
  }

  return "";
}
