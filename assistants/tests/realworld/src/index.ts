// @ts-nocheck
import { Process } from "@yao/runtime";

/**
 * Create Hook - Real World Scenario
 *
 * This hook simulates real production scenarios including:
 * 1. MCP resource/tool calls
 * 2. Trace logging for monitoring
 * 3. Database queries via Process
 * 4. Context field adjustments
 * 5. Resource management
 *
 * Scenarios:
 * - "simple": Simple response without external calls
 * - "mcp_health": Use MCP to check system health
 * - "mcp_tools": Call multiple MCP tools
 * - "database_query": Query database via Process
 * - "trace_intensive": Create many trace nodes
 * - "full_workflow": Complete workflow with MCP + DB + Trace
 * - "context_adjustment": Adjust context fields dynamically
 * - "resource_heavy": Simulate resource-intensive operations
 * - default: Standard response with MCP + Trace
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  const content = messages[0]?.content || "";

  // Route to scenario handlers
  switch (content) {
    case "simple":
      return scenarioSimple(ctx);

    case "mcp_health":
      return scenarioMCPHealth(ctx);

    case "mcp_tools":
      return scenarioMCPTools(ctx);

    case "database_query":
      return scenarioDatabaseQuery(ctx);

    case "trace_intensive":
      return scenarioTraceIntensive(ctx);

    case "full_workflow":
      return scenarioFullWorkflow(ctx);

    case "context_adjustment":
      return scenarioContextAdjustment(ctx);

    case "resource_heavy":
      return scenarioResourceHeavy(ctx);

    default:
      return scenarioDefault(ctx, content);
  }
}

/**
 * Scenario: Simple response (baseline)
 */
function scenarioSimple(ctx: agent.Context): agent.Create {
  return {
    messages: [
      {
        role: "system",
        content: "Simple response without external dependencies",
      },
      {
        role: "assistant",
        content: "I'm ready to help! This is a simple scenario.",
      },
    ],
    metadata: {
      scenario: "simple",
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Scenario: MCP Health Check
 * Simulates checking system health via MCP
 */
function scenarioMCPHealth(ctx: agent.Context): agent.Create {
  try {
    // Use Context MCP API to check health via status tool
    const tools = ctx.mcp.ListTools("echo", "");
    const statusResult = ctx.mcp.CallTool("echo", "status", {
      verbose: true,
    });

    return {
      messages: [
        {
          role: "system",
          content: "System health check completed via MCP",
        },
        {
          role: "assistant",
          content: `Health Status: ${JSON.stringify(statusResult)}
Available Tools: ${tools.tools.length}`,
        },
      ],
      metadata: {
        scenario: "mcp_health",
        tools_count: tools.tools.length,
        health_data: statusResult,
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "system",
          content: "MCP health check failed",
        },
        {
          role: "assistant",
          content: `Error: ${err.message}`,
        },
      ],
      metadata: {
        scenario: "mcp_health",
        error: err.message,
      },
    };
  }
}

/**
 * Scenario: Multiple MCP Tool Calls
 * Simulates calling multiple MCP tools
 */
function scenarioMCPTools(ctx: agent.Context): agent.Create {
  try {
    // List available tools
    const toolsList = ctx.mcp.ListTools("echo", "");

    // Call multiple tools (echo only has ping and status)
    const pingResult = ctx.mcp.CallTool("echo", "ping", { count: 3 });
    const statusResult = ctx.mcp.CallTool("echo", "status", {
      verbose: true,
    });

    return {
      messages: [
        {
          role: "system",
          content: "Multiple MCP tools executed successfully",
        },
        {
          role: "assistant",
          content: `Tools Available: ${toolsList.tools.length}
Ping Result: ${JSON.stringify(pingResult)}
Status Result: ${JSON.stringify(statusResult)}`,
        },
      ],
      metadata: {
        scenario: "mcp_tools",
        tools_count: toolsList.tools.length,
        operations: ["ping", "status"],
        ping_result: pingResult,
        status_result: statusResult,
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "assistant",
          content: `MCP tools execution error: ${err.message}`,
        },
      ],
      metadata: {
        scenario: "mcp_tools",
        error: err.message,
      },
    };
  }
}

/**
 * Scenario: Database Query
 * Simulates querying database via Process
 */
function scenarioDatabaseQuery(ctx: agent.Context): agent.Create {
  try {
    // Query database via Process (Yao model)
    const roles = Process("models.__yao.role.Get", {});

    const roleMessages: agent.Message[] = [
      {
        role: "system",
        content: "Database query completed successfully",
      },
    ];

    // Process query results
    if (roles && Array.isArray(roles)) {
      for (const role of roles) {
        roleMessages.push({
          role: "assistant",
          content: `Role: ${role.name || "unknown"}, ID: ${role.id || "N/A"}`,
        });
      }
    }

    return {
      messages: roleMessages,
      metadata: {
        scenario: "database_query",
        roles_count: roles?.length || 0,
        query_time: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "assistant",
          content: `Database query error: ${err.message}`,
        },
      ],
    };
  }
}

/**
 * Scenario: Trace Intensive
 * Simulates creating many trace nodes (tests trace management)
 */
function scenarioTraceIntensive(ctx: agent.Context): agent.Create {
  try {
    const trace = ctx.trace;
    const nodeCount = 10;
    const nodes = [];

    // Create multiple trace nodes
    for (let i = 0; i < nodeCount; i++) {
      const node = trace.Add(
        { step: i, type: "processing" },
        { label: `Step ${i + 1}` }
      );

      // Add logs to each node
      node.Info(`Processing step ${i + 1}`);
      node.Debug(`Step ${i + 1} details`);

      // Create child nodes
      const childNode = node.Add(
        { parent: i, type: "validation" },
        { label: `Validation ${i + 1}` }
      );
      childNode.Info(`Validating step ${i + 1}`);
      childNode.Complete({ valid: true });

      // Complete parent node
      node.Complete({ result: `step_${i}_completed` });
      nodes.push(node);
    }

    return {
      messages: [
        {
          role: "system",
          content: "Trace intensive scenario completed",
        },
        {
          role: "assistant",
          content: `Created ${nodeCount} trace nodes with ${
            nodeCount * 2
          } total nodes (including children)`,
        },
      ],
      metadata: {
        scenario: "trace_intensive",
        nodes_created: nodeCount * 2,
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "assistant",
          content: `Trace intensive error: ${err.message}`,
        },
      ],
    };
  }
}

/**
 * Scenario: Full Workflow
 * Combines MCP + Database + Trace (real production pattern)
 */
function scenarioFullWorkflow(ctx: agent.Context): agent.Create {
  try {
    const trace = ctx.trace;

    // Step 1: Initialize
    const initNode = trace.Add(
      { phase: "init" },
      { label: "Workflow Initialization" }
    );
    initNode.Info("Starting full workflow");

    // Step 2: MCP Operations
    const mcpNode = trace.Add({ phase: "mcp" }, { label: "MCP Operations" });
    mcpNode.Info("Checking MCP tools");

    const tools = ctx.mcp.ListTools("echo", "");

    mcpNode.Complete({ tools_count: tools.tools.length });

    // Step 3: Database Query
    const dbNode = trace.Add(
      { phase: "database" },
      { label: "Database Query" }
    );
    dbNode.Info("Querying database");

    const roles = Process("models.__yao.role.Get", {});

    dbNode.Complete({ roles_count: roles?.length || 0 });

    // Step 4: MCP Tool Execution
    const toolNode = trace.Add({ phase: "tools" }, { label: "MCP Tools" });
    toolNode.Info("Executing MCP tools");

    const pingResult = ctx.mcp.CallTool("echo", "ping", { count: 1 });
    const statusResult = ctx.mcp.CallTool("echo", "status", {
      verbose: false,
    });

    toolNode.Complete({ ping: pingResult, status: statusResult });

    // Step 5: Finalization
    initNode.Complete({ workflow: "completed", phases: 4 });

    return {
      messages: [
        {
          role: "system",
          content: "Full workflow completed successfully",
        },
        {
          role: "assistant",
          content: `Workflow Results:
- MCP Tools: ${tools.tools.length}
- Database Roles: ${roles?.length || 0}
- Tools Executed: ping, status`,
        },
      ],
      metadata: {
        scenario: "full_workflow",
        phases_completed: 4,
        mcp_tools: tools.tools.length,
        db_records: roles?.length || 0,
        execution_time: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "assistant",
          content: `Full workflow error: ${err.message}`,
        },
      ],
      metadata: {
        scenario: "full_workflow",
        error: err.message,
      },
    };
  }
}

/**
 * Scenario: Context Adjustment
 * Tests dynamic context field adjustment
 */
function scenarioContextAdjustment(ctx: agent.Context): agent.Create {
  const originalAssistant = ctx.assistant_id;
  const originalLocale = ctx.locale;

  return {
    messages: [
      {
        role: "system",
        content: "Context fields adjusted dynamically",
      },
      {
        role: "assistant",
        content: `Original: ${originalAssistant} (${originalLocale})
Adjusted: production.assistant (zh-cn)`,
      },
    ],
    // Adjust context fields
    assistant_id: "production.assistant",
    locale: "zh-cn",
    theme: "dark",
    metadata: {
      scenario: "context_adjustment",
      original_assistant: originalAssistant,
      original_locale: originalLocale,
      adjusted: true,
    },
  };
}

/**
 * Scenario: Resource Heavy
 * Simulates resource-intensive operations
 */
function scenarioResourceHeavy(ctx: agent.Context): agent.Create {
  try {
    const trace = ctx.trace;
    const operations = [];

    // Multiple MCP operations
    for (let i = 0; i < 5; i++) {
      const node = trace.Add({ op: i }, { label: `Operation ${i + 1}` });

      const tools = ctx.mcp.ListTools("echo", "");
      const ping = ctx.mcp.CallTool("echo", "ping", { count: 1 });
      const status = ctx.mcp.CallTool("echo", "status", { verbose: false });

      node.Complete({
        tools: tools.tools.length,
        ping: ping,
        status: status,
      });
      operations.push({
        iteration: i,
        tools: tools.tools.length,
      });
    }

    // Database queries
    const dbNode = trace.Add({ phase: "db" }, { label: "Database Operations" });
    const roles = Process("models.__yao.role.Get", {});
    dbNode.Complete({ count: roles?.length || 0 });

    return {
      messages: [
        {
          role: "system",
          content: "Resource-heavy scenario completed",
        },
        {
          role: "assistant",
          content: `Completed ${
            operations.length
          } MCP iterations and 1 database query
Total trace nodes: ${operations.length + 1}`,
        },
      ],
      metadata: {
        scenario: "resource_heavy",
        mcp_iterations: operations.length,
        total_operations: operations.length * 3 + 1, // 3 MCP ops per iteration + 1 DB
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "assistant",
          content: `Resource heavy error: ${err.message}`,
        },
      ],
      metadata: {
        scenario: "resource_heavy",
        error: err.message,
      },
    };
  }
}

/**
 * Scenario: Default
 * Standard response with basic MCP and Trace usage
 */
function scenarioDefault(ctx: agent.Context, content: string): agent.Create {
  try {
    const trace = ctx.trace;

    // Add trace node
    const node = trace.Add({ type: "default" }, { label: "Default Handler" });
    node.Info(`Processing: ${content}`);

    // Simple MCP call
    const tools = ctx.mcp.ListTools("echo", "");

    node.Complete({ tools_available: tools.tools.length });

    return {
      messages: [
        {
          role: "system",
          content: "Processing your request",
        },
        {
          role: "assistant",
          content: `Received: "${content}"
Available MCP tools: ${tools.tools.length}`,
        },
      ],
      metadata: {
        scenario: "default",
        user_input: content,
        tools_count: tools.tools.length,
      },
    };
  } catch (err) {
    return {
      messages: [
        {
          role: "assistant",
          content: `Error: ${err.message}`,
        },
      ],
    };
  }
}
