function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("[V2 Host Mode] Create hook called");

  if (ctx.sandbox) {
    log.Info("[V2 Host Mode] Sandbox workdir:", ctx.sandbox.workdir);

    // In host mode, we're running directly on the Tai host
    try {
      ctx.sandbox.WriteFile("v2-host-marker.txt", "host-mode-test");
      const content = ctx.sandbox.ReadFile("v2-host-marker.txt");
      log.Info("[V2 Host Mode] Host file write/read OK:", content);
    } catch (e) {
      log.Error("[V2 Host Mode] Host file ops failed:", e);
    }

    try {
      const output = ctx.sandbox.Exec(["uname", "-a"]);
      log.Info("[V2 Host Mode] Host uname:", output);
    } catch (e) {
      log.Error("[V2 Host Mode] Host exec failed:", e);
    }
  }

  return { messages };
}

function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("[V2 Host Mode] Next hook called");
  return null;
}
