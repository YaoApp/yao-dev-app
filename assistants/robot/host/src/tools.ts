// @ts-nocheck
import { log } from "@yao/runtime";

/**
 * ConfirmTask: Receives confirmed task goals from the LLM.
 * The actual Action dispatch is handled by the Next hook in index.ts.
 * This function simply returns the confirmed data so the LLM gets a tool result.
 *
 * Process: agents.robot.host.tools.ConfirmTask
 */
export function ConfirmTask(params: {
  goals: string;
  context?: Record<string, any>;
}): { confirmed: boolean; goals: string } {
  log.Trace(
    "[robot-host.tools.ConfirmTask] goals=%s",
    params.goals || ""
  );
  return {
    confirmed: true,
    goals: params.goals || "",
  };
}
