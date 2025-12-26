// @ts-nocheck
/**
 * Hooks Test Agent - src/index.ts
 *
 * This agent is used for testing before/after hook functionality
 * in the Agent Test Framework V2.
 */

/**
 * Create hook - called when agent context is created
 */
export function Create(ctx: AgentContext) {
  // Log that we received context
  console.log("[hooks-test] Create hook called");

  // Store hook execution info in metadata
  ctx.metadata = ctx.metadata || {};
  ctx.metadata.create_hook_called = true;
  ctx.metadata.create_hook_time = new Date().toISOString();

  return ctx;
}

/**
 * Next hook - called after agent completion
 */
export function Next(
  ctx: AgentContext,
  messages: Message[],
  response: AgentResponse
) {
  console.log("[hooks-test] Next hook called");

  // Return custom data for testing
  return {
    data: {
      hook_type: "next",
      message_count: messages.length,
      has_response: !!response,
      metadata: ctx.metadata,
    },
  };
}
