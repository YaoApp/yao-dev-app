// @ts-nocheck
/**
 * Web Reader Expert - Hook handlers
 * Uses fetch.ts utilities for web content fetching
 */
import { Fetch, ExtractURL, CompressContent } from "./fetch";

// Create hook - Pre-process before LLM call
// Extracts URL and fetches content, then injects into context
function Create(
  ctx: agent.Context,
  messages: agent.Message[]
): agent.HookCreateResponse | null {
  // Get the last user message
  const lastMessage = getLastUserMessage(messages);
  if (!lastMessage) {
    return null;
  }

  const content = typeof lastMessage.content === "string" ? lastMessage.content : "";

  // Extract URL from message
  const url = ExtractURL(content);
  if (!url) {
    // No URL found, let LLM handle as topic-based query
    return null;
  }

  // Fetch web content using fetch.ts utility
  const webContent = Fetch(url);
  if (!webContent.success) {
    // Inject error into context for LLM to handle
    return {
      context: {
        web_fetch_error: webContent.error,
        requested_url: url,
      },
      messages: [
        ...messages.slice(0, -1),
        {
          role: "user",
          content: "I tried to fetch content from " + url + " but encountered an error: " + webContent.error + "\n\nPlease provide guidance on how to proceed or suggest alternatives.",
        },
      ],
    };
  }

  // Compress content to fit within token limit
  const compressedContent = CompressContent(webContent.content, 8000);

  return {
    context: {
      web_content: {
        url: webContent.url,
        title: webContent.title,
        content_length: webContent.content.length,
        compressed_length: compressedContent.length,
        fetch_time: new Date().toISOString(),
      },
    },
    messages: [
      ...messages.slice(0, -1),
      {
        role: "user",
        content: "Analyze the following web content from: " + webContent.url + "\n\n## Page Title\n" + (webContent.title || "Unknown") + "\n\n## Content\n" + compressedContent + "\n\n## Original Request\n" + content + "\n\nPlease extract and structure the key information as requested.",
      },
    ],
  };
}

// Next hook - Post-process LLM response
function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  // Let LLM response pass through
  return null;
}

// Get last user message from messages array
function getLastUserMessage(messages: agent.Message[]): agent.Message | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return messages[i];
    }
  }
  return null;
}
