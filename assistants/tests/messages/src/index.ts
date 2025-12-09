// @ts-nocheck
import { Process, time } from "@yao/runtime";
import { basic } from "./basic";
import { markdown } from "./markdown";
import { error } from "./error";
import { code } from "./code";

/**
 * Create hook - Route to different test scenarios
 * @param ctx - Agent context
 * @param messages - User messages
 * @returns Create response
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  // Get user input
  const user_input =
    messages[messages.length - 1]?.content?.toLowerCase() || "";

  // Determine test type
  let test_type = "menu";
  if (user_input.includes("basic")) {
    test_type = "basic";
  } else if (user_input.includes("markdown")) {
    test_type = "markdown";
  } else if (user_input.includes("error")) {
    test_type = "error";
  } else if (user_input.includes("code")) {
    test_type = "code";
  } else if (user_input.includes("delta")) {
    test_type = "delta";
  } else if (user_input.includes("grouping")) {
    test_type = "grouping";
  } else if (user_input.includes("scenario")) {
    test_type = "scenarios";
  }

  // Route to different tests
  switch (test_type) {
    case "basic":
      basic(ctx);
      break;

    case "markdown":
      markdown(ctx);
      break;

    case "error":
      error(ctx);
      break;

    case "code":
      code(ctx);
      break;

    case "delta":
      // delta(ctx);
      ctx.Send({
        type: "text",
        props: { content: "🚧 Delta tests coming soon..." },
      });
      break;

    case "grouping":
      // grouping(ctx);
      ctx.Send({
        type: "text",
        props: { content: "🚧 Grouping tests coming soon..." },
      });
      break;

    case "scenarios":
      // scenarios(ctx);
      ctx.Send({
        type: "text",
        props: { content: "🚧 Scenario tests coming soon..." },
      });
      break;

    default:
      // Show menu with streaming output
      const message_id = ctx.SendStream({
        type: "text",
        props: {
          content: "# 📋 Available Tests\n\n",
        },
      });

      // Stream menu content
      const chunks = [
        "Send one of these keywords to run tests:\n\n",
        "- **basic** - ",
        "Basic message types (text, loading, image, etc.)\n",
        "- **markdown** - ",
        "Markdown rendering (tables, code, mermaid, etc.)\n",
        "- **error** - ",
        "Error messages (basic, with code, with details, recovery)\n",
        "- **code** - ",
        "Code blocks (complete vs streaming)\n",
        "- **delta** - ",
        "Delta operations (replace, append, merge, set)\n",
        "- **grouping** - ",
        "Block and Thread ID grouping\n",
        "- **scenarios** - ",
        "Real-world scenarios (streaming, progress, etc.)\n\n",
        'Try: "show me code" or "test error"',
      ];

      for (const chunk of chunks) {
        ctx.Append(message_id, chunk);
        time.Sleep(50);
      }

      // End the streaming message
      ctx.End(message_id);
  }

  // Wait for 200ms
  time.Sleep(200);
  return { messages };
}
