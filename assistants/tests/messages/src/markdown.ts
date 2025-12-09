// @ts-nocheck
import { Process, time } from "@yao/runtime";

/**
 * Markdown rendering test - simulates real LLM streaming output
 */
export function markdown(ctx: agent.Context) {
  // Send complete header message
  ctx.Send({
    type: "text",
    props: {
      content:
        "# 📝 Markdown Rendering Test\n\nSimulating LLM streaming output with various Markdown features...",
    },
  });

  time.Sleep(500);

  // Most content uses streaming (simulates LLM output)
  // 1. Streaming headings and text formatting
  streaming_headings(ctx);
  time.Sleep(500);

  // 2. Streaming lists
  streaming_lists(ctx);
  time.Sleep(500);

  // 3. Streaming table
  streaming_table(ctx);
  time.Sleep(500);

  // 4. Streaming code block
  streaming_code_block(ctx);
  time.Sleep(500);

  // 5. Streaming mermaid diagram
  streaming_mermaid(ctx);
  time.Sleep(500);

  // 6. Complete document example (complete message for comparison)
  complete_document(ctx);
  time.Sleep(500);

  // Send complete summary message
  ctx.Send({
    type: "text",
    props: {
      content: "\n✅ **All Markdown streaming tests completed!**",
    },
  });
}

/**
 * Streaming headings and text formatting - simulates LLM output
 */
function streaming_headings(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  // Start streaming message
  const message_id = ctx.SendStream(
    {
      type: "text",
      props: {
        content: "## 📐 Headings & Text Formatting\n\n",
      },
    },
    block_id
  );

  // Stream content line by line
  const lines = [
    "# Heading 1\n",
    "## Heading 2\n",
    "### Heading 3\n",
    "#### Heading 4\n\n",
    "**Bold text** ",
    "and *italic text* ",
    "and ***bold italic***\n\n",
    "~~Strikethrough~~ ",
    "and `inline code`\n\n",
    "> Block quote with **formatted** text\n",
    "> Multiple lines supported",
  ];

  for (const line of lines) {
    ctx.Append(message_id, line);
    time.Sleep(80);
  }

  // End the streaming message
  ctx.End(message_id);
  ctx.EndBlock(block_id);
}

/**
 * Streaming lists - simulates LLM generating lists incrementally
 */
function streaming_lists(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  const message_id = ctx.SendStream(
    {
      type: "text",
      props: {
        content: "## 📋 Lists\n\n### Unordered List\n",
      },
    },
    block_id
  );

  // Stream list items
  const items = [
    "- Item 1\n",
    "- Item 2\n",
    "  - Nested item 2.1\n",
    "  - Nested item 2.2\n",
    "- Item 3\n\n",
    "### Ordered List\n",
    "1. First step\n",
    "2. Second step\n",
    "   1. Sub-step 2.1\n",
    "   2. Sub-step 2.2\n",
    "3. Third step\n\n",
    "### Task List\n",
    "- [x] Completed task\n",
    "- [ ] Pending task\n",
    "- [ ] Another pending task",
  ];

  for (const item of items) {
    ctx.Append(message_id, item);
    time.Sleep(100);
  }

  // End the streaming message
  ctx.End(message_id);
  ctx.EndBlock(block_id);
}

/**
 * Streaming table - simulates LLM building table row by row
 */
function streaming_table(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  const message_id = ctx.SendStream(
    {
      type: "text",
      props: {
        content: "## 📊 Table\n\n",
      },
    },
    block_id
  );

  // Stream table construction
  const rows = [
    "| Feature | Status | Priority | Notes |\n",
    "|---------|--------|----------|-------|\n",
    "| Auth | ✅ Done | High | Implemented OAuth |\n",
    "| Dashboard | 🚧 WIP | Medium | UI in progress |\n",
    "| API | ⏳ Planned | Low | Design phase |\n",
    "| Testing | ✅ Done | High | 80% coverage |\n",
    "| Docs | 📝 Writing | Medium | In progress |",
  ];

  for (const row of rows) {
    ctx.Append(message_id, row);
    time.Sleep(120);
  }

  // End the streaming message
  ctx.End(message_id);
  ctx.EndBlock(block_id);
}

/**
 * Streaming code block - simulates LLM generating code line by line
 */
function streaming_code_block(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  const message_id = ctx.SendStream(
    {
      type: "text",
      props: {
        content:
          "## 💻 Code Example\n\nGenerating TypeScript code...\n\n```typescript\n",
      },
    },
    block_id
  );

  // Stream code line by line (simulates LLM code generation)
  const code_lines = [
    "interface User {\n",
    "  id: string;\n",
    "  name: string;\n",
    "  email: string;\n",
    "  created_at: Date;\n",
    "}\n\n",
    "async function fetchUser(id: string): Promise<User> {\n",
    "  const response = await fetch(`/api/users/${id}`);\n",
    "  \n",
    "  if (!response.ok) {\n",
    "    throw new Error('Failed to fetch user');\n",
    "  }\n",
    "  \n",
    "  return response.json();\n",
    "}\n\n",
    "// Example usage\n",
    "const user = await fetchUser('123');\n",
    "console.log(user.name);\n",
    "```\n",
  ];

  for (const line of code_lines) {
    ctx.Append(message_id, line);
    time.Sleep(80);
  }

  // End the streaming message
  ctx.End(message_id);
  ctx.EndBlock(block_id);
}

/**
 * Streaming mermaid diagram - simulates LLM generating diagram definition
 */
function streaming_mermaid(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  const message_id = ctx.SendStream(
    {
      type: "text",
      props: {
        content:
          "## 📈 Mermaid Diagram\n\nGenerating flowchart...\n\n```mermaid\n",
      },
    },
    block_id
  );

  // Stream mermaid diagram definition
  const diagram_lines = [
    "graph TD\n",
    "    A[User Request] --> B{Authenticated?}\n",
    "    B -->|Yes| C[Process Request]\n",
    "    B -->|No| D[Return 401]\n",
    "    C --> E{Valid Data?}\n",
    "    E -->|Yes| F[Save to DB]\n",
    "    E -->|No| G[Return 400]\n",
    "    F --> H[Return Success]\n",
    "    D --> I[End]\n",
    "    G --> I\n",
    "    H --> I\n",
    "```\n",
  ];

  for (const line of diagram_lines) {
    ctx.Append(message_id, line);
    time.Sleep(100);
  }

  // End the streaming message
  ctx.End(message_id);
  ctx.EndBlock(block_id);
}

/**
 * Complete document - sent as a complete message (for comparison)
 */
function complete_document(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  // This is sent as ONE complete message (not streamed)
  // For comparison with the streamed content above
  ctx.Send(
    {
      type: "text",
      props: {
        content: `## 📄 Complete Message Example

This entire message is sent at once (not streamed), for comparison.

### Quick Summary

| Metric | Value | Trend |
|--------|-------|-------|
| Response Time | 120ms | ⬇️ Improving |
| Success Rate | 99.5% | ⬆️ Up |
| Active Users | 1,250 | ⬆️ Growing |

### System Status

\`\`\`mermaid
pie title System Health
    "Healthy" : 85
    "Warning" : 10
    "Critical" : 5
\`\`\`

**Note**: This message demonstrates sending complete, pre-formatted content all at once, versus the streaming approach used in examples above.`,
      },
    },
    block_id
  );

  ctx.EndBlock(block_id);
}
