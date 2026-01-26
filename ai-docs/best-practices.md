# Best Practices

Patterns and solutions for common Agent development scenarios.

## Table of Contents

- [Multi-Turn Conversation in Next Hook](#multi-turn-conversation-in-next-hook)
- [Parallel Agent Calls with ctx.agent.All](#parallel-agent-calls-with-ctxagentall)

---

## Multi-Turn Conversation in Next Hook

### Problem

When an Agent's Next hook needs to trigger additional LLM calls to complete multi-phase tasks (e.g., writing → reviewing → image generation), returning `{ messages: [...] }` does NOT work:

```typescript
// ❌ WRONG: This will be IGNORED by the framework
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  if (phase === "writing") {
    return {
      messages: [{ role: "user", content: "Please review..." }]
    };
  }
}
```

The `messages` field in `NextHookResponse` is not supported. The Agent will end immediately without continuing the conversation.

### Why Not Supported?

1. **Prevent Infinite Loops**: The `delegate` mechanism was designed specifically to prevent infinite loops. Each delegate creates a new Stack, protected by Stack depth limits.
2. **Clear Call Boundaries**: Each delegate has explicit entry and exit points, making debugging and tracing easier.
3. **State Isolation**: State is passed through `ctx.memory.context`, avoiding accidental state pollution.

### Solution: Self-Delegation

Use `delegate` to call the same Agent again:

```typescript
// ✅ CORRECT: Use delegate for self-delegation
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  if (phase === "writing") {
    // Save state for next phase
    ctx.memory.context.Set("phase", "reviewing");
    ctx.memory.context.Set("section_data", { content, index, title });

    // Delegate to self to continue the conversation
    return {
      delegate: {
        agent_id: "yao.scribe.writer",  // Self-delegation
        messages: [
          { role: "user", content: "Please review..." }
        ],
        options: {
          skip: {
            history: true,  // Skip history, only process current message
            output: true    // IMPORTANT: Disable SSE output for delegated calls
          }
        }
      }
    };
  }

  if (phase === "reviewing") {
    // Final phase, return data to end execution
    return {
      data: { section_index, title, content, images }
    };
  }
}
```

### Key Points

1. **State Persistence**: Use `ctx.memory.context.Set/Get` to pass state between phases
2. **Skip History**: Add `options.skip.history = true` to avoid loading full conversation history
3. **Skip Output (CRITICAL)**: Add `options.skip.output = true` when the Agent is called via `ctx.agent.All/Any/Race` or any parallel context. Without this, delegated calls will write to the SSE stream, causing client disconnection and `context canceled` errors.
4. **Stack Depth Limit**: Framework has a default limit of 10 levels to prevent infinite recursion
5. **Unique Keys for Parallel Calls**: When called in parallel, use unique keys (e.g., `writer_phase_${sectionIdx}`)

### Return Value Rules

| Return Value | Behavior |
|-------------|----------|
| `{ data: {...} }` | Return custom data, **ends** execution |
| `{ delegate: {...} }` | Delegate to another Agent (or self), **continues** execution |
| `null` | Return standard response, **ends** execution |

---

## Parallel Agent Calls with ctx.agent.All

### Problem

When using `ctx.agent.All()` to call multiple Agents in parallel, you may encounter:

1. **Context Cancelled Error**: Multiple sub-agents writing to the same SSE stream
2. **State Collision**: Sub-agents sharing `ctx.memory.context` and overwriting each other's state

### Solution

The framework automatically handles these issues:

1. **SSE Output Disabled**: All sub-agent calls automatically have `skip.output = true` to prevent SSE conflicts
2. **Forked Context**: Each sub-agent gets a forked context with independent `ctx.memory.context`

### Best Practices

```typescript
// Use unique keys to isolate state in parallel calls
function getPhaseKey(sectionIdx: number): string {
  return `writer_phase_${sectionIdx}`;
}

function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  const sectionIdx = extractSectionIndex(messages);
  const phaseKey = getPhaseKey(sectionIdx);
  
  ctx.memory.context.Set(phaseKey, "writing");
  // ...
}
```

### Callback for Streaming Messages

If you need to receive streaming messages from sub-agents, use the handler variant:

```typescript
const results = ctx.agent.AllWithHandler(requests, (agentID, index, message) => {
  console.log(`[${agentID}] Message from agent ${index}:`, message);
});
```

---

## More Questions?

If you have questions not covered here, please check:

- [Agent Context API](./agent-context-api.md) - Full API reference
- [Hooks Reference](./hooks-reference.md) - Create/Next hook documentation
- [Testing Guide](./testing.md) - How to test Agents
