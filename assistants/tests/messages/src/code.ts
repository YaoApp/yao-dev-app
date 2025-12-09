// @ts-nocheck
import { Process, time } from "@yao/runtime";

/**
 * Code block test - demonstrates complete vs streaming code output
 */
export function code(ctx: agent.Context) {
  // Send complete header message
  ctx.Send({
    type: "text",
    props: {
      content:
        "# 💻 Code Block Test\n\nTesting complete vs streaming code blocks...",
    },
  });

  time.Sleep(500);

  // 1. Complete code block (sent all at once)
  complete_code_block(ctx);
  time.Sleep(800);

  // 2. Streaming code block (token by token)
  streaming_code_block(ctx);
  time.Sleep(500);

  // Send complete summary message
  ctx.Send({
    type: "text",
    props: {
      content: "\n✅ **All code block tests completed!**",
    },
  });
}

/**
 * Complete code block - sent as a complete message (not streamed)
 */
function complete_code_block(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  ctx.Send(
    {
      type: "text",
      props: {
        content: `## 📦 Complete Code Block

This code block is sent as a **complete message** (not streamed):

\`\`\`typescript
function fetchUser(id: string) {
  const url = \`/api/users/\${id}\`;
  return fetch(url).then(res => res.json());
}

const user = await fetchUser('123');
console.log(user.name);
\`\`\`

The entire code appears instantly.`,
      },
    },
    block_id
  );

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
          "## 🌊 Streaming Code Block\n\nThis code block is generated **line by line** (streaming):\n\n```python\n",
      },
    },
    block_id
  );

  // Stream code line by line
  const code_lines = [
    "def calculate_total(items):\n",
    "    total = 0\n",
    "    for item in items:\n",
    "        total += item['price']\n",
    "    return total\n",
    "\n",
    "# Example usage\n",
    "items = [{'price': 10}, {'price': 20}]\n",
    "print(calculate_total(items))  # Output: 30\n",
    "```\n",
  ];

  for (const line of code_lines) {
    ctx.Append(message_id, line);
    time.Sleep(100);
  }

  // Add explanation after code
  ctx.Append(
    message_id,
    "\n\nEach line appears gradually, simulating LLM code generation."
  );

  // End the streaming message
  ctx.End(message_id);
  ctx.EndBlock(block_id);
}
