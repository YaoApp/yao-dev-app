import { UniqueID } from "@scripts/lib/utils";
import { agent, Exception, Process, time } from "@yao/runtime";

/**
 * Initialize the assistant session
 *
 * @param ctx Context
 */
function Create(input: agent.Input, options: agent.Options): agent.Create {
  const self = this as agent.This;
  const locale = self.context.locale;
  self.Send({ type: "loading" });

  const ctx = self.context as agent.Context;
  const params: Record<string, any> = {
    automated: true,
    select: ["assistant_id", "name", "description", "tags"],
  };

  let res = Process("neo.assistant.search", params, locale);
  let asts = res.data;
  const selfAssistantId = ctx.assistant_id || "neo";
  asts = asts.filter((ast) => ast.assistant_id !== selfAssistantId);

  // Insert a system prompt before the last user message
  if (asts.length > 0) {
    const lastUserMessage = input[input.length - 1];
    if (lastUserMessage.role === "user") {
      input.splice(input.length - 1, 0, {
        role: "system",
        text: `${JSON.stringify(asts)}`,
        name: "Assistants_List",
      });
    }
  }

  return { assistant_id: ctx.assistant_id, chat_id: ctx.chat_id, input };
}

/**
 * Process completion of assistant response
 * @param ctx Context
 */
function Done(input: agent.Input, output: agent.Output): agent.Done {
  // No output, do nothing
  if (!output || output.length === 0) {
    return;
  }

  // Handle the function call
  for (const data of output) {
    if (data.type === "tool" && data.props) {
      const { function: func, arguments: args, error: err } = data.props;
      if (err) {
        throw new Exception(err, 400);
      }

      if (func !== "select_assistant") {
        throw new Exception("the function must be select_assistant", 400);
      }

      const { assistant_id } = args || {};
      if (!assistant_id) {
        throw new Exception("the assistant_id argument is required", 400);
      }

      const lastInput = input[input.length - 1]; // transfer the last input to the assistant

      // Validate the assistant_id exists
      const ast = Process("neo.assistant.find", assistant_id);

      // Send the progress message
      const self = this as agent.This;
      self.Send({
        type: "progress",
        props: { id: UniqueID(), title: "呼叫 " + ast.name },
        new: true,
      });

      return {
        next: {
          action: "assistant",
          payload: { assistant_id: ast.assistant_id, input: lastInput },
        },
      };
    }
  }
}

/**
 * Retry hook, generate the retry prompt
 * @param input
 * @param output
 * @returns
 */
function Retry(lastInput: string, output: agent.Output, err: string): string {
  const self = this as agent.This;
  const { retry_times } = self.context;
  if (retry_times >= 3) {
    throw new Exception("Maximum retry times reached", 400);
  }

  const lastOutput = output[output.length - 1];
  const outputText = lastOutput.text || "";
  const prompt = `{{ input }}\n## assistant answer is not expected, please fix it. \n\n ## Error Message:\n{{ error }}\n\n## assistant last answer:\n{{ output }}`;
  const data = {
    error: err,
    input: lastInput.trim(),
    output: outputText.trim(),
  };
  const replaced = self.Replace(prompt, data);
  return replaced;
}

/**
 * Filter and limit conversation messages
 * @param messages Input messages array
 * @param limit Maximum number of assistant messages to keep
 * @returns Filtered messages array
 */
function filterConversationMessages(
  messages: agent.Input,
  limit: number = 10
): agent.Input {
  // Filter out tool messages
  const filteredMessages = messages.filter((msg) => {
    if (msg.role === "system" || msg.role === "user") return true;
    if (msg.role === "assistant" && msg.type === "tool") return false;
    return true;
  });

  // Separate messages by role
  const systemMessages = filteredMessages.filter(
    (msg) => msg.role === "system"
  );
  const userMessages = filteredMessages.filter((msg) => msg.role === "user");
  const assistantMessages = filteredMessages
    .filter((msg) => msg.role === "assistant")
    .slice(-limit); // Only limit assistant messages

  // Reconstruct the conversation maintaining chronological order
  const result: agent.Input = [];
  let userIndex = 0;
  let assistantIndex = 0;

  // First add all system messages
  result.push(...systemMessages);

  // Then interleave user and assistant messages maintaining order
  while (
    userIndex < userMessages.length ||
    assistantIndex < assistantMessages.length
  ) {
    if (userIndex < userMessages.length) {
      result.push(userMessages[userIndex]);
      userIndex++;
    }
    if (assistantIndex < assistantMessages.length) {
      result.push(assistantMessages[assistantIndex]);
      assistantIndex++;
    }
  }

  return result;
}
