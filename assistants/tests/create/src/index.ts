// @ts-nocheck

/**
 * Initialize the assistant session
 *
 * @param ctx Context
 */
function Create(ctx: agent.Context, messages: agent.Message[]): agent.Create {
  console.log("Create hook called");
  console.log(ctx);
  console.log(messages);
  return {
    assistant_id: "tests.create",
    chat_id: "chat-test-create-hook",
    input: ctx,
    options: messages,
  };
}
