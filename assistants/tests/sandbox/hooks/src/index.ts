/**
 * Sandbox hooks test - test ctx.sandbox API for hooks
 * 
 * This test verifies that hooks can access the sandbox via ctx.sandbox:
 * - WriteFile/ReadFile operations
 * - ListDir operation
 * - Exec command execution
 * - workdir property
 */

function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("Sandbox hooks test: Create hook started");

  // Check if sandbox is available
  if (!ctx.sandbox) {
    log.Warn("ctx.sandbox not available - not running in sandbox mode");
    return { messages };
  }

  // Send loading message
  const loadingId = ctx.SendStream({
    type: "loading",
    props: { message: "Preparing sandbox environment..." }
  });

  try {
    // Test 1: Write a file
    log.Info("Test 1: Writing test file...");
    ctx.sandbox.WriteFile("test.txt", "Hello from Create hook");

    // Test 2: Read the file back
    log.Info("Test 2: Reading test file...");
    const content = ctx.sandbox.ReadFile("test.txt");
    if (content !== "Hello from Create hook") {
      throw new Error(`WriteFile/ReadFile failed: expected 'Hello from Create hook', got '${content}'`);
    }
    log.Info("Test 2: File content matches");

    // Test 3: List directory
    log.Info("Test 3: Listing directory...");
    const files = ctx.sandbox.ListDir(".");
    log.Info(`Test 3: Found ${files.length} files: ${files.map(f => f.name).join(", ")}`);

    // Test 4: Execute command
    log.Info("Test 4: Executing command...");
    const output = ctx.sandbox.Exec(["echo", "test-output"]);
    if (!output.includes("test-output")) {
      throw new Error(`Exec failed: expected output to contain 'test-output', got '${output}'`);
    }
    log.Info("Test 4: Command execution successful");

    // Test 5: Check workdir
    log.Info(`Test 5: Workdir is ${ctx.sandbox.workdir}`);

    // Update loading message
    ctx.Replace(loadingId, {
      type: "text",
      props: { text: "Sandbox environment ready" }
    });
    ctx.End(loadingId);

    log.Info("Sandbox hooks test: Create hook completed successfully");
  } catch (e) {
    log.Error(`Sandbox hooks test failed: ${e}`);
    ctx.End(loadingId);
    throw e;
  }

  return { messages };
}

function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("Sandbox hooks test: Next hook called");

  // Check if sandbox is still available in Next hook
  if (!ctx.sandbox) {
    log.Warn("ctx.sandbox not available in Next hook");
    return null;
  }

  // Read the file written in Create hook
  try {
    const content = ctx.sandbox.ReadFile("test.txt");
    log.Info(`Next hook: File content is '${content}'`);
  } catch (e) {
    log.Debug(`Next hook: Could not read file: ${e}`);
  }

  return null;
}
