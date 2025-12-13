// @ts-nocheck
/**
 * Search JSAPI Test Assistant
 * Tests ctx.search.Web/KB/DB/All/Any/Race methods
 * Returns search results directly via messages without LLM call
 */

/**
 * Create Hook - executes search and returns results via messages
 * No LLM call needed, just test the JSAPI functionality
 */
function Create(
  ctx: YaoAgent.Context,
  messages: YaoAgent.Message[],
  options?: YaoAgent.CreateOptions
): YaoAgent.CreateHookResponse {
  // Get the user message to determine which test to run
  const userMessage = messages.find((m) => m.role === "user");
  const content = (userMessage?.content as string) || "";

  // Parse test command from message
  // Format: "test:<method>" e.g., "test:web", "test:all", "test:any", "test:race"
  const testMatch = content.match(/^test:(\w+)(?:\s+(.*))?$/);
  if (!testMatch) {
    return {
      messages: [
        {
          role: "assistant",
          content:
            "Invalid test command. Use: test:web, test:kb, test:db, test:all, test:any, test:race",
        },
      ],
    };
  }

  const method = testMatch[1];
  const query = testMatch[2] || "Yao App Engine";

  try {
    let result: any;

    switch (method) {
      case "web":
        // Test ctx.search.Web()
        result = ctx.search.Web(query, { limit: 5 });
        break;

      case "web_sites":
        // Test ctx.search.Web() with site restriction
        result = ctx.search.Web(query, {
          limit: 5,
          sites: ["github.com", "yaoapps.com"],
        });
        break;

      case "kb":
        // Test ctx.search.KB() (skeleton)
        result = ctx.search.KB(query, { collections: ["docs"], limit: 5 });
        break;

      case "db":
        // Test ctx.search.DB() (skeleton)
        result = ctx.search.DB(query, { models: ["product"], limit: 5 });
        break;

      case "all":
        // Test ctx.search.All() - like Promise.all
        result = ctx.search.All([
          { type: "web", query: "golang programming", limit: 3 },
          { type: "web", query: "rust programming", limit: 3 },
        ]);
        break;

      case "any":
        // Test ctx.search.Any() - like Promise.any
        result = ctx.search.Any([
          { type: "web", query: "kubernetes containers", limit: 3 },
          { type: "web", query: "docker orchestration", limit: 3 },
        ]);
        break;

      case "race":
        // Test ctx.search.Race() - like Promise.race
        result = ctx.search.Race([
          { type: "web", query: "machine learning", limit: 3 },
          { type: "web", query: "deep learning", limit: 3 },
        ]);
        break;

      default:
        return {
          messages: [
            {
              role: "assistant",
              content:
                "Unknown test method: " +
                method +
                ". Use: web, web_sites, kb, db, all, any, race",
            },
          ],
        };
    }

    // Return the result as JSON in messages
    return {
      messages: [
        {
          role: "assistant",
          content: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      messages: [
        {
          role: "assistant",
          content: "Error: " + (error.message || error),
        },
      ],
    };
  }
}
