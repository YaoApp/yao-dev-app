function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("[V2 Session CLI] Create hook called");

  if (ctx.sandbox) {
    log.Info("[V2 Session CLI] Sandbox available, workdir:", ctx.sandbox.workdir);

    // Write a counter file to verify session persistence across messages
    let count = 0;
    try {
      const prev = ctx.sandbox.ReadFile("session-counter.txt");
      count = parseInt(prev, 10) || 0;
    } catch (_) {
      // first message in session
    }
    count++;
    ctx.sandbox.WriteFile("session-counter.txt", String(count));
    log.Info("[V2 Session CLI] Session message count:", count);
  }

  return { messages };
}

function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("[V2 Session CLI] Next hook called");
  return null;
}
