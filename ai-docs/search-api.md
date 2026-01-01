# Yao Agent Search API Reference

## Overview

The Agent Search system provides automatic search capabilities across multiple sources: Web, Knowledge Base (KB), and Database (DB). Search can be triggered automatically based on user intent or controlled via hooks.

## Search Types

| Type  | Description                           | Use Case                        |
| ----- | ------------------------------------- | ------------------------------- |
| `web` | Internet search via configured engine | Current events, general queries |
| `kb`  | Knowledge base semantic search        | Internal documents, policies    |
| `db`  | Database query via QueryDSL           | Structured data, records        |

## Auto Search Flow

1. **Intent Detection**: `__yao.needsearch` agent analyzes user message
2. **Search Execution**: Based on intent, executes web/kb/db searches
3. **Context Injection**: Results are injected as system message before LLM call
4. **Citation**: LLM can cite search results using `[1]`, `[2]` format

## Controlling Search in Hooks

### Disable Search

```typescript
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  return {
    messages,
    search: false, // Disable auto search
  };
}
```

### Enable Specific Search Types

```typescript
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  return {
    messages,
    search: {
      need_search: true,
      search_types: ["kb", "db"], // Only KB and DB, no web
      confidence: 1.0,
      reason: "controlled by hook",
    },
  };
}
```

### Using Uses Configuration

```typescript
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  return {
    messages,
    uses: {
      search: "disabled", // Disable search completely
    },
  };
}
```

## Search Intent Structure

```typescript
interface SearchIntent {
  need_search: boolean; // Whether search is needed
  search_types: string[]; // ["web", "kb", "db"]
  confidence: number; // 0.0 - 1.0
  reason: string; // Explanation
}
```

## Assistant Search Configuration

### In package.yao

```json
{
  "search": {
    "web": {
      "provider": "bing",
      "max_results": 10
    },
    "kb": {
      "threshold": 0.7,
      "graph": true
    },
    "db": {
      "max_results": 20
    },
    "keyword": {
      "max_keywords": 5
    },
    "weights": {
      "user": 1.0,
      "hook": 0.8,
      "auto": 0.6
    },
    "citation": {
      "style": "numeric",
      "format": "[{index}]"
    }
  },

  "knowledge_base": {
    "collections": ["expense_policy", "travel_guidelines"]
  },

  "database": {
    "models": ["agents.expense.voucher", "agents.expense.expense"]
  }
}
```

## Uses Configuration

The `uses` field controls search-related tool usage:

| Field      | Values                              | Description               |
| ---------- | ----------------------------------- | ------------------------- |
| `search`   | `"disabled"`, `"<agent>"`, `"mcp:"` | Search tool configuration |
| `web`      | `"<provider>"`, `"mcp:"`            | Web search provider       |
| `keyword`  | `"builtin"`, `"<agent>"`, `"mcp:"`  | Keyword extraction        |
| `querydsl` | `"<agent>"`, `"mcp:"`               | QueryDSL generation       |
| `rerank`   | `"<agent>"`, `"mcp:"`               | Result reranking          |

## Search in Next Hook

Access search results in payload:

```typescript
function Next(ctx: agent.Context, payload: agent.Payload): agent.Next {
  // Search results are already injected into messages
  // LLM response may contain citations like [1], [2]

  const { completion } = payload;
  if (completion?.content) {
    // Process LLM response with citations
    console.log("Response:", completion.content);
  }

  return null;
}
```

## KB Collection Authorization

Collections are filtered by user authorization:

```typescript
// In search execution
const allowedCollections = FilterKBCollectionsByAuth(ctx, ast.KB.Collections);
```

This ensures users only search collections they have access to.

## DB Search Authorization

Database queries automatically include authorization filters:

```typescript
// Auth where clauses are added automatically
const authWheres = BuildDBAuthWheres(ctx);
// e.g., { column: "__yao_created_by", value: user_id }
```

## Search Result Reference

```typescript
interface Reference {
  id: string; // Citation ID ("1", "2", etc.)
  type: string; // "web", "kb", "db"
  title: string; // Result title
  url: string; // Source URL
  content: string; // Snippet/content
  weight: number; // Relevance weight
  score: number; // Search score
  source: string; // Source identifier
}
```

## Loading Messages

During search, loading messages are sent to UI:

1. **Intent Detection**: "Analyzing query..."
2. **Keyword Extraction**: "Extracting keywords..."
3. **Search Execution**: "Searching..."
4. **Results**: "Found X references"

These use the `loading` message type with `done: true` to close.

## Skip Options

In test cases or hooks, skip search-related operations:

```typescript
const opts = {
  skip: {
    search: true, // Skip auto search
    keyword: true, // Skip keyword extraction
  },
};
```

## Best Practices

1. **Configure collections** - Set up KB collections for domain knowledge
2. **Set thresholds** - Tune KB threshold for relevance
3. **Control via hooks** - Use Create hook to enable/disable search per request
4. **Handle citations** - LLM responses may include `[1]`, `[2]` references
5. **Test intent detection** - Verify `__yao.needsearch` works for your domain

## See Also

- [Knowledge Base API](./kb-api.md)
- [Hooks Reference](./hooks-reference.md)
- [Agent Context API](./agent-context-api.md)
