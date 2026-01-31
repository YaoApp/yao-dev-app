/**
 * E2E Test Assistant Hooks
 * Used for validating sandbox + claude-proxy integration
 */

function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("E2E Test: Create hook started");

  // Verify sandbox is available
  if (!ctx.sandbox) {
    log.Error("E2E Test: ctx.sandbox not available!");
    return { messages };
  }

  log.Info("E2E Test: Sandbox is available");

  // Pre-setup: create a marker file for Claude to verify
  try {
    ctx.sandbox.WriteFile("e2e-marker.txt", "E2E_TEST_MARKER_12345");
    log.Info("E2E Test: Marker file created");
  } catch (e) {
    log.Error(`E2E Test: Failed to create marker file: ${e}`);
  }

  return { messages };
}

function Complete(
  ctx: Context,
  payload: any,
  options: CompleteOptions
): CompleteResponse | null {
  log.Info("E2E Test: Complete hook called");

  // Log the response for debugging
  if (payload && payload.content) {
    log.Info(`E2E Test: Response received (${payload.content.length} chars)`);
  }

  return null;
}
