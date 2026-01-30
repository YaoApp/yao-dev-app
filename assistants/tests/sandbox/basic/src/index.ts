/**
 * Basic sandbox test - minimal hooks for testing sandbox execution
 */

function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("Sandbox basic test: Create hook called");
  return { messages };
}

function Next(
  ctx: Context,
  payload: any,
  options: NextOptions
): NextResponse | null {
  log.Info("Sandbox basic test: Next hook called");
  return null;
}
