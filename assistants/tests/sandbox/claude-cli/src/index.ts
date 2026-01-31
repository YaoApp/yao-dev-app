/**
 * Claude CLI test - with prompts configured
 * This verifies that Claude CLI is executed when prompts exist
 */

function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("Claude CLI test: Create hook started");

  // Check if sandbox is available
  if (!ctx.sandbox) {
    log.Warn("ctx.sandbox not available");
    return { messages };
  }

  // Pre-setup: create a file for Claude to read
  log.Info("Pre-setup: Creating test file for Claude...");
  ctx.sandbox.WriteFile("readme.txt", "This file was created by the Create hook.\nClaude should be able to read this file using the Read tool.");

  return { messages };
}

function Complete(
  ctx: Context,
  payload: any,
  options: CompleteOptions
): CompleteResponse | null {
  log.Info("Claude CLI test: Complete hook called");
  log.Info(`Payload: ${JSON.stringify(payload)}`);

  // Verify Claude's response
  if (payload.content) {
    log.Info(`Claude response received: ${payload.content.substring(0, 200)}...`);
  }

  return null;
}
