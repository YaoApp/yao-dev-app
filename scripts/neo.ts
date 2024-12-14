import { io, neo } from "@yao/runtime";

/**
 * Return all available Assistants
 */
function Assistants(): neo.Assistant[] {
  return [{ assistant_id: "yao_neo_assistant", connector: "moapi:gpt-4o" }];
}

/**
 * AI Chat Lifecycle Hooks
 *
 * ┌───────────┐
 * │  Create   │ -> [Hook] Create(ctx, messages, writer)
 * └─────┬─────┘    Initial message processing, select an assistant, set model options, etc.
 *       │
 * ┌─────▼─────┐
 * │  Prepare  │ -> [Hook] Prepare(ctx, messages)
 * └─────┬─────┘    Message preprocessing before AI call, add system messages, etc.
 *       │
 * ┌─────▼─────┐
 * │   Call    │ -> [System] Start streaming from AI service
 * │  Stream   │
 * └─────┬─────┘
 *       │
 *       ├─ ─ ─ ┐ Stream chunk 1
 * ┌─────▼─────┐
 * │   Write   │ -> [Hook] Write(ctx, messages, response, content, writer)
 * └─────┬─────┘    Process and stream to client
 *       │
 *       ├─ ─ ─ ┐ Stream chunk 2
 * ┌─────▼─────┐
 * │   Write   │ -> [Hook] Write continues with new chunks
 * └─────┬─────┘
 *       ┊
 *       ┊ (More chunks...)
 *       │
 * ┌─────▼─────┐
 * │    End    │ -> [System] Complete chat session
 * └───────────┘
 *
 */

/**
 * Neo Create hook, when a new chat message is created
 */
function Create(
  ctx: neo.Context,
  messages: neo.Message[],
  writer: io.ResponseWriter
) {}

/**
 * Neo Prepare hook, when a request is made to the AI, before the AI is called
 */
function Prepare(ctx: neo.Context, messages: neo.Message[]): neo.Message[] {
  return messages;
}

/**
 * Neo Write hook, when a response is received from the AI
 */
function Write(
  ctx: neo.Context,
  messages: neo.Message[],
  response: neo.Response,
  content?: string,
  writer?: io.ResponseWriter
): neo.Response[] {
  return [response];
}

// assistants:
//   - name: GPT-3.5-Turbo
//     default: true
//     id: default_assistant
//     connector: gpt-3_5-turbo
//     option:
//       temperature: 1.2
//   - name: GPT-4o
//     default: true
//     id: code_assistant
//     connector: moapi:gpt-4o
//     option:
//       temperature: 1.2
//   - name: Claude-3.5-Sonnet
//     connector: moapi:claude-3.5-sonnet
//     id: claude_assistant
//     option:
//       temperature: 1.2
