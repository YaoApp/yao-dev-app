// @ts-nocheck
/**
 * Next Hook Test
 * Tests various Next Hook scenarios for validation
 */

function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  // Get the completion response (use lowercase to match JSON tags)
  const completion = payload.completion;
  const messages = payload.messages;
  const tools = payload.tools;
  const error = payload.error;

  // Get the last user message to determine test scenario
  const testScenario = getTestScenario(messages);

  // Route to appropriate scenario handler
  switch (testScenario) {
    case "return_null":
      return scenarioReturnNull();

    case "return_undefined":
      return scenarioReturnUndefined();

    case "return_empty":
      return scenarioReturnEmpty();

    case "return_custom_data":
      return scenarioReturnCustomData();

    case "return_data_with_metadata":
      return scenarioReturnDataWithMetadata();

    case "return_delegate":
      return scenarioReturnDelegate();

    case "verify_payload":
      return scenarioVerifyPayload(messages, completion, tools, error);

    case "verify_tools":
      return scenarioVerifyTools(tools);

    case "conditional_delegate":
      return scenarioConditionalDelegate(completion);

    case "handle_error":
      return scenarioHandleError(error);

    default:
      return scenarioDefault(testScenario, completion, messages, tools);
  }
}

/**
 * Extract test scenario from messages
 */
function getTestScenario(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return "default";
  }

  // Find the last user message (use lowercase field names to match JSON tags)
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user" && msg.content && typeof msg.content === "string") {
      return msg.content.toLowerCase().trim();
    }
  }

  return "default";
}

/**
 * Scenario: Return null - should use standard response
 */
function scenarioReturnNull(): null {
  return null;
}

/**
 * Scenario: Return undefined - should use standard response
 */
function scenarioReturnUndefined(): undefined {
  return undefined;
}

/**
 * Scenario: Return empty object - should use standard response
 */
function scenarioReturnEmpty(): agent.NextHookResponse {
  return {};
}

/**
 * Scenario: Return custom data
 */
function scenarioReturnCustomData(): agent.NextHookResponse {
  return {
    data: {
      message: "Custom response from Next Hook",
      test: true,
      timestamp: Date.now(),
    },
  };
}

/**
 * Scenario: Return custom data with metadata
 */
function scenarioReturnDataWithMetadata(): agent.NextHookResponse {
  return {
    data: {
      result: "success",
      value: 42,
    },
    metadata: {
      hook: "next",
      processed: true,
    },
  };
}

/**
 * Scenario: Delegate to another agent
 */
function scenarioReturnDelegate(): agent.NextHookResponse {
  return {
    delegate: {
      agent_id: "tests.create",
      messages: [
        {
          role: "user",
          content: "Hello from delegated agent",
        },
      ],
    },
  };
}

/**
 * Scenario: Verify payload structure
 */
function scenarioVerifyPayload(
  messages: any[],
  completion: any,
  tools: any[],
  error: string
): agent.NextHookResponse {
  const checks = [];

  // Check Messages
  if (messages && Array.isArray(messages)) {
    checks.push(`Messages: ${messages.length} messages`);
  } else {
    checks.push("Messages: MISSING or INVALID");
  }

  // Check Completion
  if (completion) {
    checks.push(
      `Completion: ${completion.content ? "has content" : "no content"}`
    );
    checks.push(
      `Completion.Usage: ${completion.usage ? "present" : "missing"}`
    );
  } else {
    checks.push("Completion: MISSING");
  }

  // Check Tools
  if (tools && Array.isArray(tools)) {
    checks.push(`Tools: ${tools.length} tool calls`);
    tools.forEach((tool, idx) => {
      checks.push(
        `  Tool[${idx}]: ${tool.server}.${tool.tool} - ${
          tool.error ? "ERROR" : "SUCCESS"
        }`
      );
    });
  } else {
    checks.push("Tools: none or INVALID");
  }

  // Check Error
  if (error) {
    checks.push(`Error: ${error}`);
  } else {
    checks.push("Error: none");
  }

  return {
    data: {
      validation: "success",
      checks: checks,
    },
  };
}

/**
 * Scenario: Test with tool call results
 */
function scenarioVerifyTools(tools: any[]): agent.NextHookResponse {
  if (!tools || tools.length === 0) {
    return {
      data: {
        message: "No tool calls to verify",
      },
    };
  }

  const toolResults = tools.map((tool) => ({
    tool_call_id: tool.toolcall_id,
    server: tool.server,
    tool: tool.tool,
    has_result: !!tool.result,
    has_error: !!tool.error,
    error_message: tool.error || null,
  }));

  return {
    data: {
      message: "Tool calls processed",
      tools: toolResults,
      total_tools: tools.length,
      successful: tools.filter((t) => !t.error).length,
      failed: tools.filter((t) => t.error).length,
    },
  };
}

/**
 * Scenario: Test conditional delegate based on completion
 */
function scenarioConditionalDelegate(completion: any): agent.NextHookResponse {
  // Delegate if completion contains certain keywords
  if (completion && completion.content) {
    const content = completion.content.toLowerCase();
    if (content.includes("delegate") || content.includes("forward")) {
      return {
        delegate: {
          agent_id: "tests.create",
          messages: [
            {
              role: "user",
              content: "Delegated due to keyword match",
            },
          ],
        },
      };
    }
  }

  // Otherwise return custom data
  return {
    data: {
      message: "No delegation needed",
      reason: "No matching keywords in completion",
    },
  };
}

/**
 * Scenario: Test error handling
 */
function scenarioHandleError(error: string): agent.NextHookResponse {
  if (error) {
    return {
      data: {
        message: "Error was handled by Next Hook",
        error: error,
        recovered: true,
      },
    };
  }

  return {
    data: {
      message: "No error to handle",
    },
  };
}

/**
 * Scenario: Default - return custom data with completion info
 */
function scenarioDefault(
  testScenario: string,
  completion: any,
  messages: any[],
  tools: any[]
): agent.NextHookResponse {
  return {
    data: {
      message: "Next Hook executed successfully",
      scenario: testScenario,
      completion_content: completion ? completion.content : null,
      message_count: messages ? messages.length : 0,
      tool_count: tools ? tools.length : 0,
    },
    metadata: {
      hook: "next",
      test: "default",
    },
  };
}
