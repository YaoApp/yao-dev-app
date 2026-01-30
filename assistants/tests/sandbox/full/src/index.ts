/**
 * Full Sandbox Test Assistant Hooks
 * Tests MCP, Skills, and Sandbox integration
 */

/**
 * Create Hook - Called before LLM execution
 * Tests ctx.sandbox availability and file operations
 */
function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("[Full Test] Create hook called");
  log.Info("[Full Test] Messages count:", messages.length);

  // Test sandbox availability
  if (ctx.sandbox) {
    log.Info("[Full Test] Sandbox is available");

    // Test workdir
    const workdir = ctx.sandbox.workdir;
    log.Info("[Full Test] Sandbox workdir:", workdir);

    // Test write file
    try {
      ctx.sandbox.WriteFile("create-hook-test.txt", "Created by Create hook");
      log.Info("[Full Test] WriteFile in Create hook succeeded");
    } catch (e) {
      log.Error("[Full Test] WriteFile in Create hook failed:", e);
    }

    // Test exec
    try {
      const result = ctx.sandbox.Exec(["echo", "Create hook executed"]);
      log.Info("[Full Test] Exec in Create hook result:", result);
    } catch (e) {
      log.Error("[Full Test] Exec in Create hook failed:", e);
    }
  } else {
    log.Warn("[Full Test] Sandbox is NOT available in Create hook");
  }

  return { messages };
}

/**
 * Next Hook - Called after LLM response
 */
function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("[Full Test] Next hook called");

  if (ctx.sandbox) {
    // Read the files we created
    try {
      const createContent = ctx.sandbox.ReadFile("create-hook-test.txt");
      log.Info("[Full Test] Create hook file content:", createContent);
    } catch (e) {
      log.Warn("[Full Test] Could not read create-hook-test.txt:", e);
    }

    // List workspace directory
    try {
      const files = ctx.sandbox.ListDir(".");
      log.Info("[Full Test] Workspace files:", JSON.stringify(files));
    } catch (e) {
      log.Error("[Full Test] ListDir failed:", e);
    }

    // Write completion marker
    try {
      ctx.sandbox.WriteFile("next-hook-complete.txt", "Test completed");
      log.Info("[Full Test] Next hook completion marker written");
    } catch (e) {
      log.Error("[Full Test] Next hook write failed:", e);
    }
  }

  return null;
}
