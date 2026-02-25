// @ts-nocheck
/**
 * Robot Need Input Test - Next Hook
 *
 * Always returns the V2 need_input signal so the robot executor
 * will suspend execution and wait for human input.
 */

export function Next(
  ctx: AgentContext,
  messages: Message[],
  response: AgentResponse
) {
  return {
    data: {
      status: "need_input",
      question: "What time range should I use for the analysis?",
    },
  };
}
