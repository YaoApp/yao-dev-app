function Create(
  ctx: Context,
  messages: Message[],
  options: CreateOptions
): CreateResponse | null {
  log.Info("[V2 Hooks Only] Create hook started");

  if (!ctx.sandbox) {
    log.Warn("[V2 Hooks Only] ctx.sandbox not available");
    return { messages };
  }

  const loadingId = ctx.SendStream({
    type: "loading",
    props: { message: "Hook executing in V2 sandbox..." }
  });

  try {
    // Test sandbox API: write, read, exec, list
    ctx.sandbox.WriteFile("v2-hook-test.txt", "Created by V2 hooks-only mode");

    const content = ctx.sandbox.ReadFile("v2-hook-test.txt");
    if (!content.includes("Created by V2 hooks-only mode")) {
      throw new Error(`Content mismatch: ${content}`);
    }

    const output = ctx.sandbox.Exec(["echo", "v2-hook-executed"]);
    log.Info("[V2 Hooks Only] Exec output:", output);

    const files = ctx.sandbox.ListDir(".");
    log.Info("[V2 Hooks Only] Files:", JSON.stringify(files));

    ctx.Replace(loadingId, {
      type: "text",
      props: {
        text: `V2 hooks-only test passed.\nFiles: ${files.map((f: any) => f.name).join(", ")}\nExec: ${output}`
      }
    });
    ctx.End(loadingId);
  } catch (e) {
    log.Error("[V2 Hooks Only] Test failed:", e);
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
  log.Info("[V2 Hooks Only] Complete hook called");
  return null;
}
