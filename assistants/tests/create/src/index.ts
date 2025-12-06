// @ts-nocheck
import { Process } from "@yao/runtime";

/**
 * Initialize the assistant session
 *
 * @param ctx Context
 * @param messages Messages
 *
 * Test scenarios based on message content:
 * - "return_null": returns null
 * - "return_undefined": returns undefined
 * - "return_empty": returns empty object {}
 * - "return_full": returns full HookCreateResponse with all fields
 * - "return_partial": returns partial HookCreateResponse
 * - "return_process": calls models.__yao.role.Get and adds to messages
 * - "verify_context": validates all ctx fields and returns validation results
 * - "adjust_context": tests context field adjustments
 * - "adjust_uses": tests uses configuration adjustments
 * - "adjust_uses_force": tests uses configuration with force_uses flag
 * - "nested_script_call": calls scripts.tests.create.GetRoles (script calls model)
 * - "deep_nested_call": calls scripts.tests.create.NestedCall (script calls script calls model)
 * - default: returns basic response
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  // Get the first message content to determine test scenario
  const content = messages[0]?.content || "";

  // Route to appropriate scenario handler
  switch (content) {
    case "return_null":
      return scenarioReturnNull();

    case "return_undefined":
      return scenarioReturnUndefined();

    case "return_empty":
      return scenarioReturnEmpty();

    case "return_full":
      return scenarioReturnFull();

    case "return_partial":
      return scenarioReturnPartial();

    case "return_process":
      return scenarioReturnProcess();

    case "verify_context":
      return scenarioVerifyContext(ctx);

    case "adjust_context":
      return scenarioAdjustContext(ctx);

    case "adjust_uses":
      return scenarioAdjustUses(ctx);

    case "adjust_uses_force":
      return scenarioAdjustUsesForce(ctx);

    case "nested_script_call":
      return scenarioNestedScriptCall();

    case "deep_nested_call":
      return scenarioDeepNestedCall();

    default:
      return scenarioDefault(content);
  }
}

/**
 * Test scenario: return null
 */
function scenarioReturnNull(): agent.Create {
  return null;
}

/**
 * Test scenario: return undefined
 */
function scenarioReturnUndefined(): agent.Create {
  return undefined;
}

/**
 * Test scenario: return empty object
 */
function scenarioReturnEmpty(): agent.Create {
  return {};
}

/**
 * Test scenario: return full response with all fields
 */
function scenarioReturnFull(): agent.Create {
  const temperature = 0.7;
  const maxTokens = 2000;
  const maxCompletionTokens = 1500;

  return {
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello!" },
    ],
    audio: { voice: "alloy", format: "mp3" },
    temperature: temperature,
    max_tokens: maxTokens,
    max_completion_tokens: maxCompletionTokens,
    metadata: { test: "full_response", user_id: "test_user_123" },
  };
}

/**
 * Test scenario: return partial response
 */
function scenarioReturnPartial(): agent.Create {
  return {
    messages: [{ role: "user", content: "Partial test" }],
    temperature: 0.5,
  };
}

/**
 * Test scenario: call process and add to messages
 */
function scenarioReturnProcess(): agent.Create {
  // Call the process to get roles
  const roles = Process("models.__yao.role.Get", {});

  // Build messages with role information
  const roleMessages: agent.Message[] = [
    {
      role: "system",
      content: "Here are the available roles in the system:",
    },
  ];

  // Add each role as a message
  if (roles && Array.isArray(roles)) {
    for (const role of roles) {
      roleMessages.push({
        role: "user",
        content: `Role: ${role.name || "unknown"}, ID: ${role.id || "unknown"}`,
      });
    }
  }

  return {
    messages: roleMessages,
    metadata: {
      test: "process_call",
      roles_count: String(roles?.length || 0),
    },
  };
}

/**
 * Validate a field and add result to validations array
 */
function validateField(
  validations: string[],
  fieldName: string,
  actual: any,
  expected: any
): boolean {
  if (actual === expected) {
    validations.push(`${fieldName}:true`);
    return true;
  } else {
    validations.push(`${fieldName}:false:${actual}`);
    return false;
  }
}

/**
 * Test scenario: verify all context fields
 */
function scenarioVerifyContext(ctx: agent.Context): agent.Create {
  const validations: string[] = [];
  let allValid = true;

  // Validate authorized
  if (ctx.authorized) {
    allValid =
      validateField(
        validations,
        "authorized.user_id",
        ctx.authorized.user_id,
        "test-user-123"
      ) && allValid;
    allValid =
      validateField(
        validations,
        "authorized.team_id",
        ctx.authorized.team_id,
        "test-team-456"
      ) && allValid;
    allValid =
      validateField(
        validations,
        "authorized.tenant_id",
        ctx.authorized.tenant_id,
        "test-tenant-789"
      ) && allValid;

    if (ctx.authorized.constraints) {
      allValid =
        validateField(
          validations,
          "authorized.constraints.team_only",
          ctx.authorized.constraints.team_only,
          true
        ) && allValid;

      if (ctx.authorized.constraints.extra) {
        allValid =
          validateField(
            validations,
            "authorized.constraints.extra.department",
            ctx.authorized.constraints.extra.department,
            "engineering"
          ) && allValid;
      } else {
        validations.push("authorized.constraints.extra:false:missing");
        allValid = false;
      }
    } else {
      validations.push("authorized.constraints:false:missing");
      allValid = false;
    }
  } else {
    validations.push("authorized:false:missing");
    allValid = false;
  }

  // Validate basic fields
  allValid =
    validateField(
      validations,
      "chat_id",
      ctx.chat_id,
      "chat-test-create-hook"
    ) && allValid;
  allValid =
    validateField(
      validations,
      "assistant_id",
      ctx.assistant_id,
      "tests.create"
    ) && allValid;
  allValid =
    validateField(validations, "locale", ctx.locale, "en-us") && allValid;
  allValid =
    validateField(validations, "theme", ctx.theme, "light") && allValid;

  // Validate client
  if (ctx.client) {
    allValid =
      validateField(validations, "client.type", ctx.client.type, "web") &&
      allValid;
    allValid =
      validateField(
        validations,
        "client.user_agent",
        ctx.client.user_agent,
        "TestAgent/1.0"
      ) && allValid;
    allValid =
      validateField(validations, "client.ip", ctx.client.ip, "127.0.0.1") &&
      allValid;
  } else {
    validations.push("client:false:missing");
    allValid = false;
  }

  // Validate request info
  allValid =
    validateField(validations, "referer", ctx.referer, "api") && allValid;
  allValid =
    validateField(validations, "accept", ctx.accept, "cui-web") && allValid;

  // Return validation results
  return {
    messages: [
      {
        role: "system",
        content: allValid
          ? "success:all_fields_validated"
          : "failure:validation_failed",
      },
      {
        role: "assistant",
        content: validations.join("\n"),
      },
    ],
  };
}

/**
 * Test scenario: adjust context fields
 */
function scenarioAdjustContext(ctx: agent.Context): agent.Create {
  return {
    messages: [
      {
        role: "system",
        content: "Context fields will be adjusted",
      },
    ],
    // Override context fields
    assistant_id: "adjusted.assistant",
    connector: "adjusted-connector",
    locale: "zh-cn",
    theme: "dark",
    route: "/adjusted/route",
    metadata: {
      adjusted: true,
      original_assistant: ctx.assistant_id,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Test scenario: adjust uses configuration
 */
function scenarioAdjustUses(ctx: agent.Context): agent.Create {
  return {
    messages: [
      {
        role: "system",
        content: "Uses configuration will be adjusted",
      },
    ],
    // Override uses configuration
    uses: {
      vision: "mcp:vision-server",
      audio: "mcp:audio-server",
      search: "agent",
      fetch: "mcp:fetch-server",
    },
    metadata: {
      uses_adjusted: true,
      chat_id: ctx.chat_id,
    },
  };
}

/**
 * Test scenario: adjust uses configuration with force_uses flag
 */
function scenarioAdjustUsesForce(ctx: agent.Context): agent.Create {
  return {
    messages: [
      {
        role: "system",
        content:
          "Uses configuration will be forced (ignore model capabilities)",
      },
    ],
    // Override uses configuration
    uses: {
      vision: "tests.vision-helper",
      audio: "mcp:audio-server",
    },
    // Force using the specified tools even if model supports multimodal
    force_uses: true,
    metadata: {
      uses_forced: true,
      chat_id: ctx.chat_id,
    },
  };
}

/**
 * Test scenario: nested script call (hook -> script -> model)
 * This tests V8 context sharing through Process("scripts.xxx")
 */
function scenarioNestedScriptCall(): agent.Create {
  // Call script which will call model - tests nested Process with shared context
  const roles = Process("scripts.tests.create.GetRoles");

  return {
    messages: [
      {
        role: "system",
        content: "Nested script call completed (hook -> script -> model)",
      },
      {
        role: "assistant",
        content: `Retrieved ${
          roles?.length || 0
        } roles through nested script call`,
      },
    ],
    metadata: {
      test: "nested_script_call",
      roles_count: String(roles?.length || 0),
    },
  };
}

/**
 * Test scenario: deep nested call (hook -> script -> script -> model)
 * This tests deep V8 context sharing through multiple Process calls
 */
function scenarioDeepNestedCall(): agent.Create {
  // Call script which calls another script which calls model
  const result = Process("scripts.tests.create.NestedCall");

  return {
    messages: [
      {
        role: "system",
        content:
          "Deep nested call completed (hook -> script -> script -> model)",
      },
      {
        role: "assistant",
        content: `Nested result: ${JSON.stringify(result)}`,
      },
    ],
    metadata: {
      test: "deep_nested_call",
      nested_result: result,
    },
  };
}

/**
 * Default scenario: return basic response
 */
function scenarioDefault(content: string): agent.Create {
  return {
    messages: [{ role: "user", content: content }],
  };
}
