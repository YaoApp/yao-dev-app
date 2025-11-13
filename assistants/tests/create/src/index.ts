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
 * - default: returns basic response
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  // Get the first message content to determine test scenario
  const content = messages[0]?.content || "";

  // Test scenario: return null
  if (content === "return_null") {
    return null;
  }

  // Test scenario: return undefined
  if (content === "return_undefined") {
    return undefined;
  }

  // Test scenario: return empty object
  if (content === "return_empty") {
    return {};
  }

  // Test scenario: return full response
  if (content === "return_full") {
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

  // Test scenario: return partial response
  if (content === "return_partial") {
    return {
      messages: [{ role: "user", content: "Partial test" }],
      temperature: 0.5,
    };
  }

  // Test scenario: call process and add to messages
  if (content === "return_process") {
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
          content: `Role: ${role.name || "unknown"}, ID: ${
            role.id || "unknown"
          }`,
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

  // Default: return basic response
  return {
    messages: [{ role: "user", content: content }],
  };
}
