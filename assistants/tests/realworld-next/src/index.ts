// @ts-nocheck
import { Process } from "@yao/runtime";

/**
 * Next Hook - Real World Scenario
 *
 * This hook simulates real production Next Hook scenarios including:
 * 1. Standard response (nil return)
 * 2. Custom data response
 * 3. Agent delegation
 * 4. Tool result processing
 * 5. Error handling
 * 6. Conditional logic based on completion
 *
 * Scenarios:
 * - "standard": Return null for standard response
 * - "custom_data": Return custom structured data
 * - "delegate": Delegate to another agent
 * - "process_tools": Process tool results and return custom data
 * - "error_recovery": Handle errors and recover
 * - "conditional": Make decisions based on completion content
 * - default: Return null for standard response
 */
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  const completion = payload.completion;
  const messages = payload.messages;
  const tools = payload.tools;
  const error = payload.error;

  // Extract scenario from the last user message
  const scenario = extractScenario(messages);

  // Route to scenario handlers
  switch (scenario) {
    case "standard":
      return scenarioStandard();

    case "custom_data":
      return scenarioCustomData(completion, messages);

    case "delegate":
      return scenarioDelegate(completion);

    case "process_tools":
      return scenarioProcessTools(tools);

    case "error_recovery":
      return scenarioErrorRecovery(error);

    case "conditional":
      return scenarioConditional(completion);

    // Sub-scenario: conditional_success - always return success data, never delegate
    // This is used by integration tests to avoid LLM response unpredictability
    case "conditional_success":
      return scenarioConditionalSuccess(completion);

    // Sub-scenario: conditional_delegate - always delegate
    case "conditional_delegate":
      return scenarioConditionalDelegate();

    default:
      // Default: return null for standard response
      return null;
  }
}

/**
 * Extract scenario from messages
 * Supports sub-scenarios like "conditional_success" or "conditional_delegate"
 */
function extractScenario(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return "default";
  }

  // Look for scenario marker in last user message
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user" && msg.content && typeof msg.content === "string") {
      const content = msg.content.toLowerCase();
      if (content.includes("scenario:")) {
        // Support sub-scenarios like "conditional_success" or "conditional_delegate"
        const match = content.match(/scenario:\s*([\w_]+)/);
        if (match) {
          return match[1];
        }
      }
    }
  }

  return "default";
}

/**
 * Scenario: Standard response
 * Return null to use the standard LLM response
 */
function scenarioStandard(): null {
  return null;
}

/**
 * Scenario: Custom data response
 * Return custom structured data instead of LLM response
 */
function scenarioCustomData(
  completion: any,
  messages: any[]
): agent.NextHookResponse {
  return {
    data: {
      type: "custom_response",
      message: "This is a custom response from Next Hook",
      completion_summary: completion
        ? `LLM said: ${completion.content?.substring(0, 100)}...`
        : "No completion",
      message_count: messages ? messages.length : 0,
      timestamp: new Date().toISOString(),
    },
    metadata: {
      scenario: "custom_data",
      processed_by: "next_hook",
    },
  };
}

/**
 * Scenario: Delegate to another agent
 * Forward the request to a different agent
 */
function scenarioDelegate(completion: any): agent.NextHookResponse {
  // Check if completion suggests delegation
  const shouldDelegate =
    completion &&
    completion.content &&
    (completion.content.toLowerCase().includes("delegate") ||
      completion.content.toLowerCase().includes("transfer"));

  if (shouldDelegate) {
    return {
      delegate: {
        agent_id: "tests.create",
        messages: [
          {
            role: "user",
            content: "Please handle this delegated request",
          },
        ],
      },
      metadata: {
        scenario: "delegate",
        reason: "Completion suggested delegation",
      },
    };
  }

  // No delegation needed
  return {
    data: {
      message: "No delegation needed",
      reason: "Completion did not suggest delegation",
    },
  };
}

/**
 * Scenario: Process tool results
 * Analyze tool call results and return summary
 */
function scenarioProcessTools(tools: any[]): agent.NextHookResponse {
  if (!tools || tools.length === 0) {
    return {
      data: {
        message: "No tools were called",
        tool_count: 0,
      },
    };
  }

  // Analyze tool results
  const successful = tools.filter((t) => !t.error);
  const failed = tools.filter((t) => t.error);

  const summary = {
    total: tools.length,
    successful: successful.length,
    failed: failed.length,
    tools: tools.map((t) => ({
      server: t.server,
      tool: t.tool,
      success: !t.error,
      error: t.error || null,
    })),
  };

  return {
    data: {
      message: "Tool execution summary",
      summary: summary,
      timestamp: new Date().toISOString(),
    },
    metadata: {
      scenario: "process_tools",
      has_failures: failed.length > 0,
    },
  };
}

/**
 * Scenario: Error recovery
 * Handle errors and provide recovery information
 */
function scenarioErrorRecovery(error: string): agent.NextHookResponse {
  if (!error) {
    return {
      data: {
        message: "No error to recover from",
        status: "ok",
      },
    };
  }

  // Log error for monitoring (in real scenario, would send to logging service)
  console.log(`[Next Hook] Error detected: ${error}`);

  return {
    data: {
      message: "Error was handled by Next Hook",
      error: error,
      recovery_action: "Logged error and returned graceful response",
      user_message: "We encountered an issue but have handled it gracefully.",
      timestamp: new Date().toISOString(),
    },
    metadata: {
      scenario: "error_recovery",
      error_handled: true,
    },
  };
}

/**
 * Sub-scenario: Conditional success (deterministic)
 * Always returns success data without delegation - for integration tests
 */
function scenarioConditionalSuccess(completion: any): agent.NextHookResponse {
  const content = completion?.content?.toLowerCase() || "";

  const conditions = {
    hasQuestion: content.includes("?"),
    hasError: content.includes("error") || content.includes("fail"),
    hasSuccess: content.includes("success") || content.includes("complete"),
    isLong: content.length > 500,
    mentions_delegate: false, // Always false to prevent delegation
  };

  return {
    data: {
      message: "Conditional analysis complete",
      action: conditions.hasSuccess ? "confirm_success" : "continue",
      reason: conditions.hasSuccess
        ? "Completion indicates success"
        : "Standard completion",
      conditions: conditions,
      completion_preview: content.substring(0, 100) + "...",
    },
    metadata: {
      scenario: "conditional_success",
      action_taken: conditions.hasSuccess ? "confirm_success" : "continue",
    },
  };
}

/**
 * Sub-scenario: Conditional delegate (deterministic)
 * Always delegates - for integration tests
 */
function scenarioConditionalDelegate(): agent.NextHookResponse {
  return {
    delegate: {
      agent_id: "tests.create",
      messages: [
        {
          role: "user",
          content: "Delegated based on conditional analysis",
        },
      ],
    },
    metadata: {
      scenario: "conditional_delegate",
      action: "delegate",
      reason: "Explicit delegation requested",
    },
  };
}

/**
 * Scenario: Conditional logic
 * Make decisions based on completion content
 */
function scenarioConditional(completion: any): agent.NextHookResponse {
  if (!completion || !completion.content) {
    return {
      data: {
        message: "No completion to analyze",
      },
    };
  }

  const content = completion.content.toLowerCase();

  // Check for various conditions
  const conditions = {
    hasQuestion: content.includes("?"),
    hasError: content.includes("error") || content.includes("fail"),
    hasSuccess: content.includes("success") || content.includes("complete"),
    isLong: content.length > 500,
    mentions_delegate:
      content.includes("delegate") || content.includes("forward"),
  };

  // Make decision based on conditions
  let action = "continue";
  let reason = "Standard completion";

  if (conditions.mentions_delegate) {
    // Delegate if completion mentions it
    return {
      delegate: {
        agent_id: "tests.create",
        messages: [
          {
            role: "user",
            content: "Delegated based on conditional analysis",
          },
        ],
      },
      metadata: {
        scenario: "conditional",
        action: "delegate",
        reason: "Completion mentioned delegation",
      },
    };
  }

  if (conditions.hasError) {
    action = "flag_for_review";
    reason = "Completion contains error indicators";
  } else if (conditions.hasSuccess) {
    action = "confirm_success";
    reason = "Completion indicates success";
  } else if (conditions.isLong) {
    action = "summarize";
    reason = "Completion is long, consider summarizing";
  }

  return {
    data: {
      message: "Conditional analysis complete",
      action: action,
      reason: reason,
      conditions: conditions,
      completion_preview: content.substring(0, 100) + "...",
    },
    metadata: {
      scenario: "conditional",
      action_taken: action,
    },
  };
}
