# Agent Reference

A condensed reference for building Yao Agents. For detailed documentation, see the source: `yao/agent/docs/`.

## Directory Structure

```
assistants/<id>/
├── package.yao          # Configuration
├── prompts.yml          # System prompts
├── prompts/             # Prompt presets
│   ├── chat.yml
│   └── task.yml
├── locales/             # Translations
│   ├── en-us.yml
│   └── zh-cn.yml
├── src/                 # Hooks
│   └── index.ts
├── models/              # Database models
│   └── data.mod.yao
└── mcps/                # MCP servers
    └── tools.mcp.yao
```

## package.yao

```json
{
  "name": "{{ name }}",
  "type": "assistant",
  "avatar": "/assets/avatar.png",
  "connector": "gpt-4o",
  "connector_options": {
    "optional": true,
    "connectors": ["gpt-4o", "gpt-4o-mini"],
    "filters": ["tool_calls"]
  },
  "description": "{{ description }}",
  "options": { "temperature": 0.7 },
  "public": true,
  "share": "team",
  "placeholder": {
    "title": "{{ chat.title }}",
    "prompts": ["{{ chat.prompts.0 }}"]
  },
  "tags": ["Category"],
  "modes": ["chat", "task"],
  "default_mode": "chat",
  "mentionable": true,
  "mcp": {
    "servers": [{ "server_id": "tools", "tools": ["search"] }]
  },
  "kb": { "collections": ["docs"] },
  "db": { "models": ["model.name"] },
  "uses": { "search": "disabled" },
  "search": {
    "web": { "max_results": 10 },
    "kb": { "threshold": 0.7 },
    "citation": { "format": "[{index}]" }
  }
}
```

## prompts.yml

```yaml
- role: system
  content: |
    You are a helpful assistant.
    Current date: {{ $CTX.date }}
    User locale: {{ $CTX.locale }}
```

## Hooks (src/index.ts)

```typescript
import { agent } from "@yao/runtime";

function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  // Store data for Next hook
  ctx.memory.context.Set("start", Date.now());

  // Return null for default behavior
  return null;

  // Or return configuration
  return {
    messages,                    // Modified messages
    temperature: 0.7,            // Override temperature
    connector: "gpt-4o-mini",    // Override connector
    prompt_preset: "task",       // Select preset
    disable_global_prompts: true,// Skip global prompts
    mcp_servers: [{ server_id: "tools" }],
    uses: { search: "disabled" },
    search: false,               // Disable auto search
    locale: "zh-cn",
    metadata: { key: "value" },
  };

  // Or delegate to another agent
  return {
    delegate: {
      agent_id: "specialist",
      messages: messages
    }
  };
}

function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  const { messages, completion, tools, error } = payload;

  if (error) {
    return { data: { status: "error", message: error } };
  }

  // Process tool results
  if (tools?.length > 0) {
    return {
      data: {
        status: "success",
        results: tools.map(t => t.result)
      }
    };
  }

  // Delegate based on response
  if (completion?.content?.includes("transfer")) {
    return {
      delegate: { agent_id: "transfer", messages }
    };
  }

  // Return null for standard response
  return null;
}
```

## Context API

### Messaging

```typescript
// Complete message
ctx.Send({ type: "text", props: { content: "Hello!" } });
ctx.Send("Hello!");

// Streaming
const id = ctx.SendStream("Starting...");
ctx.Append(id, " processing...");
ctx.End(id);

// Update streaming
ctx.Replace(id, { type: "text", props: { content: "Done!" } });
ctx.Merge(id, { progress: 100 }, "props");
ctx.Set(id, "success", "props.status");

// Block grouping
const blockId = ctx.BlockID();
ctx.Send("Step 1", blockId);
ctx.Send("Step 2", blockId);
ctx.EndBlock(blockId);
```

### Memory

```typescript
// Scopes: user (persistent), team (persistent), chat (persistent), context (request)
ctx.memory.user.Set("pref", "value");
ctx.memory.user.Set("temp", "value", 300);  // With TTL
const pref = ctx.memory.user.Get("pref");
ctx.memory.user.Del("pref");
ctx.memory.user.Has("pref");

// Counters
ctx.memory.user.Incr("views");
ctx.memory.user.Decr("credits", 5);

// Lists
ctx.memory.chat.Push("history", [msg1, msg2]);
ctx.memory.chat.Pop("queue");

// Arrays
ctx.memory.chat.ArrayGet("messages", -1);
ctx.memory.chat.ArrayPage("messages", 1, 20);
```

### Trace

```typescript
const node = ctx.trace.Add(
  { query: "input" },
  { label: "Processing", type: "process", icon: "play" }
);
node.Info("Step completed");
node.SetOutput({ result: data });
node.Complete();
// or node.Fail("error");

ctx.trace.Info("Info message");
ctx.trace.Error("Error message");
```

### MCP

```typescript
ctx.mcp.ListTools("server-id");
ctx.mcp.CallTool("server-id", "tool-name", { arg: "value" });
ctx.mcp.CallToolsParallel("server-id", [
  { name: "tool1", arguments: {} },
  { name: "tool2", arguments: {} }
]);
ctx.mcp.ReadResource("server-id", "resource://uri");
```

### Search

```typescript
// Single search
ctx.search.Web("query", { limit: 10, sites: ["example.com"] });
ctx.search.KB("query", { collections: ["docs"], threshold: 0.7 });
ctx.search.DB("query", { models: ["articles"], limit: 20 });

// Parallel
ctx.search.All([
  { type: "web", query: "topic" },
  { type: "kb", query: "topic", collections: ["docs"] }
]);
```

## Locales (locales/en-us.yml)

```yaml
name: My Assistant
description: A helpful AI assistant
chat:
  title: New Chat
  prompts:
    - How can I help?
```

## MCP Server (mcps/tools.mcp.yao)

```json
{
  "name": "Tools",
  "description": "Custom tools",
  "transport": "process",
  "process": {
    "command": "node",
    "args": ["server.js"]
  }
}
```

## Model (models/data.mod.yao)

```json
{
  "name": "Data",
  "table": { "name": "agent_data" },
  "option": { "permission": true },
  "columns": [
    { "label": "ID", "name": "id", "type": "ID" },
    { "label": "Name", "name": "name", "type": "string", "length": 200 }
  ]
}
```

## Testing

```bash
# Test with direct message
yao agent test -i "Hello" -n assistants.my-assistant

# Test with JSONL file
yao agent test -i tests/inputs.jsonl

# Dynamic mode with simulator
yao agent test -i tests/dynamic.jsonl --simulator tests.simulator-agent -v

# Script testing
yao agent test -i scripts.my-assistant.setup -v
```

### JSONL Test Case

```jsonl
{"id": "T001", "input": "Hello", "assert": {"type": "contains", "value": "Hi"}}
{"id": "T002", "input": "Query", "assert": {"type": "agent", "use": "agents:tests.validator", "value": "Response should be helpful"}}
```

### Script Testing

```typescript
// src/setup_test.ts
export function TestSetup(t: TestingT, ctx: Context) {
  const result = Setup(ctx);
  t.assert.True(result.success, "Should succeed");
  t.assert.Equal(result.status, "ready");
  t.assert.Agent(result.message, "tests.validator", { criteria: "Clear confirmation" });
}
```

## API Endpoints

| Endpoint                        | Method | Description          |
| ------------------------------- | ------ | -------------------- |
| `/api/__yao/agent`              | POST   | Chat with assistant  |
| `/api/__yao/agent/history`      | GET    | Get chat history     |
| `/api/__yao/agent/chats`        | GET    | List chat sessions   |
| `/api/__yao/agent/assistants`   | GET    | List assistants      |
| `/api/__yao/agent/upload/:type` | POST   | Upload files         |
