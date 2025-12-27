# Yao Agent Hooks Reference

## Overview

Hooks are TypeScript functions that intercept and customize the agent execution flow. There are two hooks: `Create` (before LLM) and `Next` (after LLM).

## Execution Flow

```
User Input → Load History → Create Hook → [Delegate?] → LLM Call → Tool Execution → Next Hook → [Delegate?] → Response
```

```mermaid
flowchart TD
    A[User Input] --> B[Load History]
    B --> C{Create Hook?}
    C -->|Yes| D[Execute Create Hook]
    C -->|No| E{Has Prompts/MCP?}
    D --> D1{Delegate?}
    D1 -->|Yes| D2[Call Target Agent]
    D2 --> M
    D1 -->|No| E
    E -->|Yes| F[Build LLM Request]
    E -->|No| K
    F --> G[LLM Stream Call]
    G --> H{Tool Calls?}
    H -->|Yes| I[Execute Tools]
    I --> J{Tool Errors?}
    J -->|Yes, Retry| G
    J -->|No| K
    H -->|No| K
    K{Next Hook?}
    K -->|Yes| L[Execute Next Hook]
    K -->|No| M[Return Response]
    L --> N{Delegate?}
    N -->|Yes| O[Call Target Agent]
    O --> M
    N -->|No| M
    M --> P[End]
```

## Create Hook

Called at the beginning of agent execution, before any LLM call.

### Signature

```typescript
function Create(
  ctx: agent.Context,
  messages: agent.Message[],
  options?: Record<string, any>
): agent.Create | null;
```

### Parameters

- `ctx`: Agent context object with authorized info, memory, trace, mcp
- `messages`: Array of input messages (including history if enabled)
- `options`: Optional call-level options

### Return Value

```typescript
interface HookCreateResponse {
  // Messages to send to LLM (can modify/replace input)
  messages?: Message[];

  // Generation parameters
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;

  // MCP configuration
  mcp_servers?: MCPServerConfig[];

  // Prompt configuration
  prompt_preset?: string; // e.g., "chat", "task.analysis"
  disable_global_prompts?: boolean;

  // Context overrides
  connector?: string;
  locale?: string;
  theme?: string;
  route?: string;
  metadata?: Record<string, any>;

  // Capability wrappers
  uses?: UsesConfig;
  force_uses?: boolean;

  // Audio output
  audio?: AudioConfig;

  // Delegate to another agent (skip LLM call)
  delegate?: {
    agent_id: string;
    messages: Message[];
    options?: Record<string, any>;
  };
}
```

### Example

```typescript
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  // Store data for Next hook
  ctx.memory.context.Set("start_time", Date.now());

  // Check system readiness - delegate to setup agent if not ready
  if (!SystemReady(ctx)) {
    return {
      delegate: {
        agent_id: "myassistant.setup",
        messages: messages,
      },
    };
  }

  // Configure based on user intent
  const lastMessage = messages[messages.length - 1]?.content || "";
  const isQuery = lastMessage.toLowerCase().includes("search");

  return {
    messages,
    mcp_servers: [{ server_id: "agents.myassistant.tools" }],
    prompt_preset: isQuery ? "query" : "chat",
    temperature: isQuery ? 0.3 : 0.7,
  };
}
```

## Next Hook

Called after LLM response and tool calls (if any).

### Signature

```typescript
function Next(
  ctx: agent.Context,
  payload: agent.Payload,
  options?: Record<string, any>
): agent.Next | null;
```

### Payload Structure

```typescript
interface NextHookPayload {
  messages: Message[]; // Messages sent to LLM
  completion?: CompletionResponse; // LLM response
  tools?: ToolCallResponse[]; // Tool call results
  error?: string; // Error if LLM failed
}

interface CompletionResponse {
  content: string; // LLM text response
  tool_calls?: ToolCall[]; // Tool calls requested
  usage?: UsageInfo; // Token usage
}

interface ToolCallResponse {
  toolcall_id: string;
  server: string; // MCP server name
  tool: string; // Tool name
  arguments?: any; // Arguments passed
  result?: any; // Execution result
  error?: string; // Error if failed
}
```

### Return Value

```typescript
interface NextHookResponse {
  // Delegate to another agent
  delegate?: {
    agent_id: string;
    messages: Message[];
    options?: Record<string, any>;
  };

  // Custom response data
  data?: any;

  // Metadata for logging
  metadata?: Record<string, any>;
}
```

### Example

```typescript
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  const { completion, tools, error } = payload;

  // Handle errors
  if (error) {
    ctx.Send({
      type: "error",
      props: { message: "An error occurred", error },
    });
    return { data: { status: "error" } };
  }

  // Process tool results
  if (tools && tools.length > 0) {
    for (const tool of tools) {
      if (tool.result?.intent === "query") {
        // Delegate to query agent
        return {
          delegate: {
            agent_id: "query_agent",
            messages: payload.messages,
          },
        };
      }
    }
  }

  // Calculate duration
  const startTime = ctx.memory.context.Get("start_time");
  const duration = Date.now() - startTime;

  // Return custom data
  return {
    data: {
      status: "success",
      duration_ms: duration,
    },
  };
}
```

## Common Patterns

### 1. Early Delegation in Create Hook

Use `delegate` in Create hook to route to sub-agents before LLM call. This saves LLM tokens when the routing decision can be made without LLM.

```typescript
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  // Check system readiness - delegate to setup agent if not ready
  if (!SystemReady(ctx)) {
    return {
      delegate: {
        agent_id: "myassistant.setup",
        messages: messages,
      },
    };
  }

  // Check pending tasks - delegate to specific handler
  const pendingTask = GetPendingTask(ctx);
  if (pendingTask && pendingTask.type === "submission") {
    return {
      delegate: {
        agent_id: "myassistant.submission",
        messages: messages,
        options: { metadata: { pending_task: pendingTask } },
      },
    };
  }

  // No early delegation - proceed with LLM call
  return {
    mcp_servers: [{ server_id: "agents.myassistant.tools" }],
  };
}
```

### 2. System Initialization Check

```typescript
function SystemReady(ctx: agent.Context): boolean {
  const ownerID = ctx.authorized?.team_id || ctx.authorized?.user_id;
  if (!ownerID) return false;

  // Check database setting
  const records = Process("models.agents.myassistant.setting.Get", {
    wheres: [{ column: "user_id", value: ownerID }],
    limit: 1,
  });

  return Array.isArray(records) && records.length > 0;
}
```

### 3. Intent-Based Routing (Next Hook)

```typescript
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  const { tools } = payload;

  if (tools && tools.length > 0) {
    const intent = tools[0]?.result?.intent;

    switch (intent) {
      case "query":
        ctx.space.Set("choose_prompt", "query");
        return {
          delegate: { agent_id: "myassistant", messages: payload.messages },
        };

      case "analysis":
        return {
          delegate: { agent_id: "analysis_agent", messages: payload.messages },
        };
    }
  }

  return null; // Use standard response
}
```

### 4. Streaming Output

```typescript
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  const { tools } = payload;

  if (tools && tools.length > 0) {
    const msg_id = ctx.SendStream("## Processing Results\n\n");

    for (const tool of tools) {
      ctx.Append(msg_id, `**${tool.tool}**: `);
      ctx.Append(msg_id, JSON.stringify(tool.result) + "\n\n");
    }

    ctx.End(msg_id);
  }

  return null;
}
```

### 5. Error Recovery

```typescript
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  const { error, tools } = payload;

  if (error) {
    ctx.trace.Error(error);
    return {
      data: {
        status: "error",
        message: "Request failed",
        recovery: "Please try again",
      },
    };
  }

  // Check for tool errors
  const failedTools = tools?.filter((t) => t.error) || [];
  if (failedTools.length > 0) {
    ctx.trace.Warn(`${failedTools.length} tools failed`);
  }

  return null;
}
```

## Key Points

1. **Hooks are optional** - Agent works without them
2. **Return `null`** to use default behavior
3. **LLM call is optional** - Skipped if no prompts/MCP configured
4. **Use `ctx.memory.context`** to pass data between hooks
5. **Hooks can send messages** via `ctx.Send()`, `ctx.SendStream()`
6. **Delegation in both hooks** - Both Create and Next hooks support `delegate`
7. **Create hook delegate skips LLM** - Use for early routing decisions
8. **Next hook delegate after LLM** - Use for intent-based routing after tool calls

## See Also

- [Agent Context API](./agent-context-api.md)
- [Assistant Structure](./assistant-structure.md)
- [Process API](./process-api.md)
