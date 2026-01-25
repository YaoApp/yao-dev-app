import { Context, Response, Message } from "@yao/agent";

/**
 * Test agent for ctx.agent.* JSAPI methods
 * Tests: Call, All, Any, Race
 */
function Create(
  ctx: Context,
  messages: Message[]
): Response | void {
  const userMessage = messages[messages.length - 1];
  const content = typeof userMessage?.content === "string" ? userMessage.content : "";

  // Test ctx.agent.Call - single agent call
  if (content.toLowerCase().includes("call single")) {
    ctx.Send({ type: "text", props: { content: "Testing ctx.agent.Call()..." } });

    const result = ctx.agent.Call(
      "tests.simple-greeting",
      [{ role: "user", content: "Hello from agent caller!" }],
      { skip: { history: true } }
    );

    ctx.Send({
      type: "text",
      props: {
        content: `Call result:\n- Agent: ${result.agent_id}\n- Content: ${result.content || "N/A"}\n- Error: ${result.error || "None"}`,
      },
    });

    return { messages };
  }

  // Test ctx.agent.All - wait for all agents
  if (content.toLowerCase().includes("call all")) {
    ctx.Send({ type: "text", props: { content: "Testing ctx.agent.All()..." } });

    const results = ctx.agent.All([
      {
        agent: "tests.simple-greeting",
        messages: [{ role: "user", content: "Hello from All test - 1" }],
        options: { skip: { history: true } },
      },
      {
        agent: "tests.simple-greeting",
        messages: [{ role: "user", content: "Hello from All test - 2" }],
        options: { skip: { history: true } },
      },
    ]);

    let summary = "All results:\n";
    results.forEach((r, i) => {
      summary += `[${i}] Agent: ${r?.agent_id}, Content: ${r?.content?.substring(0, 50) || "N/A"}, Error: ${r?.error || "None"}\n`;
    });

    ctx.Send({ type: "text", props: { content: summary } });
    return { messages };
  }

  // Test ctx.agent.Any - first successful result
  if (content.toLowerCase().includes("call any")) {
    ctx.Send({ type: "text", props: { content: "Testing ctx.agent.Any()..." } });

    const results = ctx.agent.Any([
      {
        agent: "tests.simple-greeting",
        messages: [{ role: "user", content: "Hello from Any test - 1" }],
        options: { skip: { history: true } },
      },
      {
        agent: "tests.simple-greeting",
        messages: [{ role: "user", content: "Hello from Any test - 2" }],
        options: { skip: { history: true } },
      },
    ]);

    let summary = "Any results (first success wins):\n";
    let foundSuccess = false;
    results.forEach((r, i) => {
      if (r) {
        summary += `[${i}] Agent: ${r.agent_id}, Content: ${r.content?.substring(0, 50) || "N/A"}, Error: ${r.error || "None"}\n`;
        if (!r.error) foundSuccess = true;
      }
    });
    summary += `Found success: ${foundSuccess}`;

    ctx.Send({ type: "text", props: { content: summary } });
    return { messages };
  }

  // Test ctx.agent.Race - first to complete
  if (content.toLowerCase().includes("call race")) {
    ctx.Send({ type: "text", props: { content: "Testing ctx.agent.Race()..." } });

    const results = ctx.agent.Race([
      {
        agent: "tests.simple-greeting",
        messages: [{ role: "user", content: "Hello from Race test - 1" }],
        options: { skip: { history: true } },
      },
      {
        agent: "tests.simple-greeting",
        messages: [{ role: "user", content: "Hello from Race test - 2" }],
        options: { skip: { history: true } },
      },
    ]);

    let summary = "Race results (first to complete):\n";
    let completedCount = 0;
    results.forEach((r, i) => {
      if (r) {
        completedCount++;
        summary += `[${i}] Agent: ${r.agent_id}, Content: ${r.content?.substring(0, 50) || "N/A"}, Error: ${r.error || "None"}\n`;
      }
    });
    summary += `Completed count: ${completedCount}`;

    ctx.Send({ type: "text", props: { content: summary } });
    return { messages };
  }

  // Default: let LLM handle
  return;
}

export { Create };
