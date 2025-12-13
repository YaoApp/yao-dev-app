/**
 * Create Hook - Disables search by returning uses.search = "disabled"
 */
function Create(
  ctx: YaoAgent.Context,
  messages: YaoAgent.Message[],
  options?: YaoAgent.CreateOptions
): YaoAgent.HookCreateResponse {
  return {
    uses: {
      search: "disabled", // Disable auto search from hook
    },
  };
}

