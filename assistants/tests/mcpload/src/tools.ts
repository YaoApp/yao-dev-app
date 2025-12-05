// @ts-nocheck

/**
 * Hello - Simple greeting tool
 * Process: agents.tests.mcpload.tools.Hello
 * @param params - The input parameters
 * @returns Greeting message
 */
function Hello(params: { name: string }): string {
  const name = params.name || "World";
  return `Hello, ${name}! This is a test from the mcpload assistant.`;
}

/**
 * Ping - Simple ping tool for nested MCP test
 * Process: agents.tests.mcpload.tools.Ping
 * @param params - The input parameters
 * @returns Echo message
 */
function Ping(params: { message: string }): object {
  return {
    message: params.message,
    echo: `Pong: ${params.message}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate - Simple calculator tool
 * Process: agents.tests.mcpload.tools.Calculate
 * @param params - The input parameters
 * @returns Result of the calculation
 */
function Calculate(params: {
  operation: "add" | "subtract" | "multiply" | "divide";
  a: number;
  b: number;
}): object {
  const { operation, a, b } = params;

  let result: number;
  switch (operation) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      if (b === 0) {
        return { error: "Cannot divide by zero" };
      }
      result = a / b;
      break;
    default:
      return { error: `Unknown operation: ${operation}` };
  }

  return {
    operation: operation,
    a: a,
    b: b,
    result: result,
    message: `${a} ${operation} ${b} = ${result}`,
  };
}
