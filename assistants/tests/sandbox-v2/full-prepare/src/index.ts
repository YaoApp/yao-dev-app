function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("[V2 Full Prepare] Create hook called");

  if (ctx.sandbox) {
    log.Info("[V2 Full Prepare] Sandbox workdir:", ctx.sandbox.workdir);

    // Verify prepare steps executed
    try {
      const prepLog = ctx.sandbox.ReadFile(".prepare-log");
      log.Info("[V2 Full Prepare] Prepare log:", prepLog);
    } catch (e) {
      log.Warn("[V2 Full Prepare] Prepare log not found");
    }

    // Verify skills were copied
    try {
      const skillContent = ctx.sandbox.Exec([
        "sh", "-c", "ls ~/.claude/skills/v2-test-skill/ 2>/dev/null || echo 'not-found'"
      ]);
      log.Info("[V2 Full Prepare] Skills dir:", skillContent);
    } catch (e) {
      log.Warn("[V2 Full Prepare] Skills check failed:", e);
    }

    // Verify env vars
    try {
      const envVal = ctx.sandbox.Exec(["sh", "-c", "echo $V2_PREPARE_TEST"]);
      log.Info("[V2 Full Prepare] V2_PREPARE_TEST:", envVal);
    } catch (e) {
      log.Warn("[V2 Full Prepare] Env check failed:", e);
    }

    ctx.sandbox.WriteFile("v2-full-marker.txt", "full-prepare-test");
  }

  return { messages };
}

function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("[V2 Full Prepare] Next hook called");
  return null;
}
