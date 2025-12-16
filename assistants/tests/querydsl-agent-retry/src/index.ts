/**
 * QueryDSL Agent with Retry Simulation
 * Checks for lint_errors in retry context to determine if this is a retry request
 * - No lint_errors: return invalid DSL (missing 'from')
 * - Has lint_errors: return valid DSL (simulates fixing the error)
 */

/**
 * Next hook - intercepts agent calls and returns mock QueryDSL
 * Simulates LLM behavior: first attempt fails, retry with lint errors succeeds
 */
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  // Get the last user message
  const lastMessage = payload.messages?.[payload.messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return null;
  }

  // Parse the request
  let request: {
    query?: string;
    models?: string[];
    limit?: number;
    retry?: { attempt?: number; lint_errors?: string };
  } = {};

  try {
    if (typeof lastMessage.content === "string") {
      request = JSON.parse(lastMessage.content);
    }
  } catch (e) {
    request = { query: lastMessage.content as string };
  }

  // Check if this is a retry attempt by looking for lint_errors in retry context
  const hasLintErrors = request.retry && request.retry.lint_errors;

  // No lint_errors means first attempt: return invalid DSL
  if (!hasLintErrors) {
    return {
      data: {
        dsl: {
          select: ["id", "name", "status"],
          // Missing 'from' field - this will fail linting
          wheres: [
            {
              field: "status",
              op: "=",
              value: "active",
            },
          ],
          limit: request.limit || 20,
        },
        explain: `Mock QueryDSL (first attempt, intentionally invalid - missing 'from')`,
        warnings: ["Test: missing 'from' field to trigger retry"],
      },
    };
  }

  // Has lint_errors means retry: return valid DSL (fixed the error)
  const attempt = request.retry?.attempt || 2;
  return {
    data: {
      dsl: {
        select: ["id", "name", "status"],
        from: "users",
        wheres: [
          {
            field: "status",
            op: "=",
            value: "active",
          },
        ],
        orders: [
          {
            field: "created_at",
            sort: "desc",
          },
        ],
        limit: request.limit || 20,
      },
      explain: `Mock QueryDSL (attempt ${attempt}, fixed after receiving lint errors)`,
      warnings: [],
    },
  };
}

