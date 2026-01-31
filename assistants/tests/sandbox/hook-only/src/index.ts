/**
 * Hook-only sandbox test - no prompts/skills/mcp configured
 * This verifies that Claude CLI is skipped when no AI configuration exists
 * Hooks take full control of the sandbox execution
 */

function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("Hook-only test: Create hook started");

  // Check if sandbox is available
  if (!ctx.sandbox) {
    log.Warn("ctx.sandbox not available - not running in sandbox mode");
    return { messages };
  }

  // Send loading message
  const loadingId = ctx.SendStream({
    type: "loading",
    props: { message: "Hook executing in sandbox..." }
  });

  try {
    // Test 1: Write a file
    log.Info("Test 1: Writing test file...");
    ctx.sandbox.WriteFile("hook-test.txt", "Created by hook-only mode");

    // Test 2: Execute a command
    log.Info("Test 2: Executing command...");
    const output = ctx.sandbox.Exec(["echo", "hook-executed-successfully"]);
    log.Info(`Command output: ${output}`);

    // Test 3: Read the file back
    log.Info("Test 3: Reading test file...");
    const content = ctx.sandbox.ReadFile("hook-test.txt");
    if (!content.includes("Created by hook-only mode")) {
      throw new Error(`File content mismatch: ${content}`);
    }

    // Update loading message with success
    ctx.Replace(loadingId, {
      type: "text",
      props: { 
        text: `Hook-only mode executed successfully!\n\nFile created: hook-test.txt\nCommand output: ${output}` 
      }
    });
    ctx.End(loadingId);

    log.Info("Hook-only test: All tests passed");
  } catch (e) {
    log.Error(`Hook-only test failed: ${e}`);
    ctx.End(loadingId);
    throw e;
  }

  return { messages };
}

function Complete(
  ctx: Context,
  payload: any,
  options: CompleteOptions
): CompleteResponse | null {
  log.Info("Hook-only test: Complete hook called");

  // Send final message
  ctx.SendStream({
    type: "text",
    props: { text: "Hook-only mode test completed. Claude CLI was skipped." }
  });

  return null;
}
