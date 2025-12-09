// @ts-nocheck
import { Process, time } from "@yao/runtime";

/**
 * Basic message types test - simulates real LLM streaming output
 */
export function basic(ctx: agent.Context) {
  // Send complete message (header)
  ctx.Send({
    type: "text",
    props: {
      content: "# 🧪 Basic Message Types Test\n\nTesting streaming output...",
    },
  });

  time.Sleep(500);

  // 1. Streaming text message (simulates LLM output)
  streaming_text(ctx);

  time.Sleep(500);

  // 2. Loading message with state changes
  loading(ctx);

  time.Sleep(500);

  // 3. Streaming markdown content
  streaming_markdown(ctx);

  time.Sleep(500);

  // 4. Image message (complete)
  image(ctx);

  time.Sleep(500);

  // Send complete message (summary)
  ctx.Send({
    type: "text",
    props: {
      content: "\n✅ **All basic tests completed!**",
    },
  });
}

/**
 * Streaming text message - simulates LLM token-by-token output
 */
function streaming_text(ctx: agent.Context) {
  // Start streaming message (no message_end until ctx.End())
  const message_id = ctx.SendStream({
    type: "text",
    props: {
      content: "## 📝 Streaming Text\n\n",
    },
  });

  // Simulate LLM streaming - append tokens gradually
  const tokens = [
    "This ",
    "is ",
    "a ",
    "simulated ",
    "LLM ",
    "streaming ",
    "output. ",
    "Each ",
    "word ",
    "is ",
    "appended ",
    "incrementally, ",
    "just ",
    "like ",
    "how ",
    "real ",
    "language ",
    "models ",
    "generate ",
    "text ",
    "token ",
    "by ",
    "token.",
  ];

  for (const token of tokens) {
    ctx.Append(message_id, token);
    time.Sleep(50); // Simulate network delay
  }

  // End the streaming message
  ctx.End(message_id);
}

/**
 * Loading message with state changes
 */
function loading(ctx: agent.Context) {
  // Initial loading
  const loading_id = ctx.Send({
    type: "loading",
    props: {
      message: "Processing...",
    },
  });

  time.Sleep(1000);

  // Update loading
  ctx.Replace(loading_id, {
    type: "loading",
    props: {
      message: "Almost done...",
    },
  });

  time.Sleep(1000);

  // Done
  ctx.Replace(loading_id, {
    type: "loading",
    props: {
      message: "Complete!",
      done: true,
    },
  });
}

/**
 * Streaming markdown content - simulates formatting output
 */
function streaming_markdown(ctx: agent.Context) {
  // Start streaming message
  const message_id = ctx.SendStream({
    type: "text",
    props: {
      content: "## 📋 Streaming Markdown\n\n",
    },
  });

  // Build markdown content incrementally
  const chunks = [
    "Here's a **bold** statement, ",
    "followed by *italic* text. ",
    "\n\nWe can also create:\n",
    "- Bullet point 1\n",
    "- Bullet point 2\n",
    "- Bullet point 3\n\n",
    "And even `inline code` ",
    "with ~~strikethrough~~.",
  ];

  for (const chunk of chunks) {
    ctx.Append(message_id, chunk);
    time.Sleep(100);
  }

  // End the streaming message
  ctx.End(message_id);
}

/**
 * Image message (complete message)
 */
function image(ctx: agent.Context) {
  ctx.Send({
    type: "image",
    props: {
      url: "https://picsum.photos/400/300",
      alt: "Test placeholder image",
      caption: "## 🖼️ Image Message\n\nComplete message sent at once.",
    },
  });
}
