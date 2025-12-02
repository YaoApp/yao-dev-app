// @ts-nocheck
import { Process } from "@yao/runtime";

/**
 * Full Fields Test Hook
 * Tests all hook functionality with complete field coverage
 *
 * Hook Types:
 * - Create: Called before chat creation, returns HookCreateResponse
 * - Next: Called after completion, returns NextHookResponse
 */

/**
 * Create hook - called before chat creation
 * @param ctx - Context object with assistant_id, chat_id, locale, theme, etc.
 * @param messages - Array of messages from the user
 * @returns HookCreateResponse with messages and optional overrides
 */
function Create(ctx: Context, messages: Message[]): HookCreateResponse {
  const content = messages[0]?.content || "";

  // Test different scenarios based on content
  if (content === "test_override") {
    return {
      messages: messages,
      temperature: 0.9,
      max_tokens: 1500,
      metadata: {
        hook: "create",
        test: true,
      },
    };
  }

  // Default: pass through messages
  return {
    messages: messages,
  };
}

/**
 * Next hook - called after completion
 * @param ctx - Context object
 * @param payload - Contains messages, completion, tools, error
 * @returns NextHookResponse with delegate or data
 */
function Next(ctx: Context, payload: NextHookPayload): NextHookResponse {
  const { messages, completion, tools, error } = payload;

  // Test delegate scenario
  if (completion?.text?.includes("delegate_to_other")) {
    return {
      delegate: {
        agent_id: "other-agent",
        messages: messages,
      },
    };
  }

  // Test custom data scenario
  if (completion?.text?.includes("custom_response")) {
    return {
      data: {
        custom: true,
        result: completion.text,
      },
      metadata: {
        processed_by: "next_hook",
      },
    };
  }

  // Default: return standard completion (null response)
  return null;
}

// Type definitions for reference
interface Context {
  assistant_id: string;
  chat_id: string;
  locale?: string;
  theme?: string;
  route?: string;
  metadata?: Record<string, any>;
}

interface Message {
  role: string;
  content: string;
  name?: string;
}

interface HookCreateResponse {
  messages?: Message[];
  audio?: { voice?: string; format?: string };
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  mcp_servers?: Array<{ server_id: string; tools?: string[] }>;
  assistant_id?: string;
  connector?: string;
  locale?: string;
  theme?: string;
  route?: string;
  metadata?: Record<string, any>;
}

interface NextHookPayload {
  messages?: Message[];
  completion?: { text?: string; finish_reason?: string };
  tools?: Array<{
    toolcall_id: string;
    server: string;
    tool: string;
    result?: any;
    error?: string;
  }>;
  error?: string;
}

interface NextHookResponse {
  delegate?: { agent_id: string; messages: Message[] };
  data?: any;
  metadata?: Record<string, any>;
}
