function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("[V2 Longrunning CLI] Create hook called");

  if (ctx.sandbox) {
    log.Info("[V2 Longrunning CLI] Sandbox workdir:", ctx.sandbox.workdir);

    // Verify environment variables were injected
    try {
      const envCheck = ctx.sandbox.Exec(["sh", "-c", "echo $V2_TEST_MODE"]);
      log.Info("[V2 Longrunning CLI] V2_TEST_MODE:", envCheck);
    } catch (e) {
      log.Error("[V2 Longrunning CLI] env check failed:", e);
    }

    // Verify prepare steps ran
    try {
      const status = ctx.sandbox.ReadFile(".v2-status");
      log.Info("[V2 Longrunning CLI] Status file:", status);
    } catch (e) {
      log.Warn("[V2 Longrunning CLI] Status file not found (expected on first run)");
    }
  }

  return { messages };
}

function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("[V2 Longrunning CLI] Next hook called");
  return null;
}
