// @ts-nocheck
import { agent, log, Process } from "@yao/runtime";

/**
 * Build a system message content that tells the Host Agent its identity
 * relative to the given robot, including the robot's bio and system_prompt.
 */
function buildRobotSystemPrompt(robot: any, robotId: string): string {
  const robotName = robot.display_name || robotId;
  const parts: string[] = [
    `## Your Identity`,
    `You are the task coordination assistant for **${robotName}**.`,
    `Your job is to help the user clarify their task goals, then confirm and hand off to ${robotName} for execution.`,
  ];
  if (robot.bio) {
    parts.push(`\n## About ${robotName}`);
    parts.push(robot.bio);
  }
  if (robot.system_prompt) {
    parts.push(`\n---\n`);
    parts.push(robot.system_prompt);
  }
  return parts.join("\n");
}

/**
 * Create Hook: Inject robot context into the conversation.
 * Reads robot_id from ctx.metadata and prepends a system message with robot identity.
 */
export function Create(
  ctx: agent.Context,
  messages: agent.Message[]
): agent.Create {
  const robotId = ctx.metadata?.robot_id;
  log.Trace(
    "[robot-host.Create] messages count=%d, roles=%s",
    messages.length,
    messages.map((m: any) => m.role).join(",")
  );
  if (robotId) {
    log.Trace("[robot-host.Create] robot_id=%s", robotId);
    try {
      const robot = Process("robot.Get", robotId);
      if (robot) {
        log.Trace(
          "[robot-host.Create] robot info: name=%s, has_bio=%v, has_system_prompt=%v",
          robot.display_name || robotId,
          !!robot.bio,
          !!robot.system_prompt
        );
        messages = [
          { role: "system", content: buildRobotSystemPrompt(robot, robotId) },
          ...messages,
        ];
        log.Trace("[robot-host.Create] prepended robot context as system message");
      } else {
        log.Trace("[robot-host.Create] robot.Get returned nil for robot_id=%s", robotId);
      }
    } catch (err) {
      log.Error("[robot-host.Create] failed to get robot info: %v", err);
    }
  }

  return { messages };
}

/**
 * Next Hook: Detect confirm_task tool call and send robot.execute Action.
 */
export function Next(
  ctx: agent.Context,
  payload: agent.Payload
): agent.Next | null {
  if (!payload.tools || payload.tools.length === 0) {
    return null;
  }

  const toolNames = payload.tools.map((t: any) => t.tool).join(", ");
  log.Trace("[robot-host.Next] tool calls: %s", toolNames);

  const confirmCall = payload.tools.find(
    (t: any) => t.tool === "confirm_task" ||
      (t.tool || "").endsWith("__confirm_task")
  );
  if (!confirmCall) {
    log.Trace("[robot-host.Next] confirm_task not found in tools, skipping");
    return null;
  }
  log.Trace("[robot-host.Next] confirm_task found: %s", confirmCall.tool);

  let args: any = {};
  try {
    args =
      typeof confirmCall.arguments === "string"
        ? JSON.parse(confirmCall.arguments)
        : confirmCall.arguments || {};
  } catch {
    log.Error("[robot-host.Next] failed to parse confirm_task arguments");
    return null;
  }

  const robotId = ctx.metadata?.robot_id;
  if (!robotId) {
    log.Error("[robot-host.Next] robot_id not found in metadata");
    return null;
  }

  log.Trace(
    "[robot-host.Next] Task confirmed for robot=%s, goals=%s",
    robotId,
    args.goals
  );

  // Write goals as chat title so history dropdown shows meaningful label
  if (args.goals && ctx.chat_id) {
    try {
      Process("robot.UpdateChatTitle", ctx.chat_id, args.goals);
      log.Trace("[robot-host.Next] Updated chat title: %s", args.goals);
    } catch (err) {
      log.Error("[robot-host.Next] Failed to update chat title: %v", err);
    }
  }

  ctx.Send({
    type: "action",
    props: {
      name: "robot.execute",
      payload: {
        robot_id: robotId,
        goals: args.goals,
        context: args.context || {},
        chat_id: ctx.chat_id,
      },
    },
  });

  return { data: { confirmed: true, robot_id: robotId, goals: args.goals } };
}
