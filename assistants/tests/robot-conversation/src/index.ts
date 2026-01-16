// @ts-nocheck
/**
 * Robot Conversation Test - Next Hook
 * Tracks conversation state and returns structured data for multi-turn testing
 */

// Simulated state tracking (in real scenario, this would be in ctx.memory)
let conversationState: {
  turn: number;
  status: string;
  tasks: any[];
} = {
  turn: 0,
  status: "initial",
  tasks: [],
};

function Next(
  ctx: agent.Context,
  payload: agent.NextHookPayload
): agent.NextHookResponse | null {
  const messages = payload.messages;
  const userInput = getLastUserMessage(messages);
  const inputLower = userInput.toLowerCase();

  // Handle special commands
  if (inputLower === "reset") {
    conversationState = { turn: 0, status: "initial", tasks: [] };
    return {
      data: {
        turn: 0,
        status: "reset",
        message: "Conversation reset. Start with a new goal.",
        questions: [],
        tasks: [],
        completed: false,
      },
    };
  }

  if (inputLower === "skip") {
    return {
      data: {
        turn: 1,
        status: "completed",
        message: "Skipped to completion.",
        questions: [],
        tasks: [
          {
            id: "skip-t1",
            description: "Skipped task",
            executor: "skip.executor",
            status: "ready",
          },
        ],
        completed: true,
      },
    };
  }

  if (inputLower === "abort") {
    return {
      data: {
        turn: conversationState.turn,
        status: "aborted",
        message: "Conversation aborted.",
        questions: [],
        tasks: [],
        completed: true,
      },
    };
  }

  // Count user messages to determine turn
  const userMessageCount = countUserMessages(messages);

  // Progress through stages based on turn count
  if (userMessageCount === 1) {
    // Turn 1: Initial planning - needs clarification
    conversationState.turn = 1;
    conversationState.status = "needs_clarification";
    return {
      data: {
        turn: 1,
        status: "needs_clarification",
        message: `I'll help you with: "${userInput}". I need some clarification first.`,
        questions: [
          "What is the priority level?",
          "Are there any dependencies?",
          "What is the deadline?",
        ],
        tasks: [],
        completed: false,
      },
    };
  }

  if (userMessageCount === 2) {
    // Turn 2: Draft ready
    conversationState.turn = 2;
    conversationState.status = "draft_ready";
    conversationState.tasks = [
      {
        id: "t1",
        description: "Analyze requirements",
        executor: "analyzer.run",
      },
      { id: "t2", description: "Execute main task", executor: "executor.run" },
      { id: "t3", description: "Validate results", executor: "validator.run" },
    ];
    return {
      data: {
        turn: 2,
        status: "draft_ready",
        message: "Based on your clarification, here is the proposed plan:",
        questions: [],
        tasks: conversationState.tasks,
        completed: false,
      },
    };
  }

  if (userMessageCount >= 3) {
    // Turn 3+: Check for confirmation
    if (
      inputLower.includes("confirm") ||
      inputLower.includes("ok") ||
      inputLower.includes("proceed") ||
      inputLower.includes("yes")
    ) {
      conversationState.turn = userMessageCount;
      conversationState.status = "completed";
      return {
        data: {
          turn: userMessageCount,
          status: "completed",
          message: "Plan confirmed and finalized.",
          questions: [],
          tasks: conversationState.tasks.map((t) => ({
            ...t,
            status: "ready",
          })),
          completed: true,
        },
      };
    }

    // Still refining
    conversationState.turn = userMessageCount;
    return {
      data: {
        turn: userMessageCount,
        status: "refining",
        message: `Incorporating feedback: "${userInput}"`,
        questions: ["Do you want to confirm this plan?"],
        tasks: conversationState.tasks,
        completed: false,
      },
    };
  }

  // Fallback
  return null;
}

/**
 * Count user messages in conversation
 */
function countUserMessages(messages: any[]): number {
  if (!messages) return 0;
  return messages.filter((m) => m.role === "user").length;
}

/**
 * Extract last user message content
 */
function getLastUserMessage(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return "";
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user" && msg.content && typeof msg.content === "string") {
      return msg.content;
    }
  }

  return "";
}
