// @ts-nocheck
/**
 * Test Create Hook for prompt_preset and disable_global_prompts
 *
 * Test cases:
 * 1. "use friendly" -> returns prompt_preset: "mode.friendly"
 * 2. "use professional" -> returns prompt_preset: "mode.professional"
 * 3. "disable global" -> returns disable_global_prompts: true
 * 4. "enable global" -> returns disable_global_prompts: false
 * 5. "friendly no global" -> returns both prompt_preset and disable_global_prompts
 * 6. "unknown preset" -> returns non-existent preset (should fallback to default)
 * 7. default -> returns null (use default prompts)
 */

/**
 * Create Hook - Select prompt preset based on user input
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  if (!messages || messages.length === 0) {
    return null;
  }

  const lastMessage = messages[messages.length - 1];
  const content = (lastMessage.content || "").toLowerCase();

  // Test case: friendly preset + disable global (check first as it's more specific)
  if (content.includes("friendly no global")) {
    return {
      prompt_preset: "mode.friendly",
      disable_global_prompts: true,
    };
  }

  // Test case: use friendly preset
  if (content.includes("use friendly")) {
    return {
      prompt_preset: "mode.friendly",
    };
  }

  // Test case: use professional preset
  if (content.includes("use professional")) {
    return {
      prompt_preset: "mode.professional",
    };
  }

  // Test case: disable global prompts
  if (content.includes("disable global")) {
    return {
      disable_global_prompts: true,
    };
  }

  // Test case: enable global prompts (override assistant config)
  if (content.includes("enable global")) {
    return {
      disable_global_prompts: false,
    };
  }

  // Test case: non-existent preset (should fallback to default)
  if (content.includes("unknown preset")) {
    return {
      prompt_preset: "non.existent.preset",
    };
  }

  // Default: no override
  return null;
}

