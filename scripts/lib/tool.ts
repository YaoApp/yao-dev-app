import { agent, Exception } from "@yao/runtime";

/**
 * Function handler type
 */
export type FunctionHandler = (args: any, ...args2: any[]) => void;

/**
 * Tool class for handling single tool call
 */
export class Tool {
  function?: string;
  arguments?: any;
  error?: string;

  /**
   * Create a new Tool instance
   */
  constructor(props: { function?: string; arguments?: any; error?: string }) {
    this.function = props.function;
    this.arguments = props.arguments;
    this.error = props.error;

    // Auto-parse JSON arguments
    if (typeof this.arguments === "string") {
      try {
        this.arguments = JSON.parse(this.arguments);
      } catch (e) {
        // Keep original if parsing fails
      }
    }
  }

  /**
   * Check if this tool has the specified function name
   */
  hasFunction(name: string): boolean {
    return this.function === name;
  }

  /**
   * Execute handler when function name matches
   */
  When(functionName: string, handler: FunctionHandler, ...args: any[]): any {
    if (this.hasFunction(functionName)) {
      // Check for errors
      if (this.error) {
        throw new Error(this.error);
      }
      return handler(this.arguments, ...args);
    }
    return false;
  }
}

/**
 * Tools class for handling multiple tool calls
 */
export class Tools {
  tools: Tool[];

  static New(output: agent.Output) {
    return new Tools(output);
  }

  /**
   * Create a new Tools instance from agent output
   */
  constructor(output: agent.Output) {
    this.tools = [];

    if (!output || output.length === 0) {
      throw new Exception("无输出数据", 500);
    }

    // Convert output to Tool instances
    this.tools = output
      .filter?.((data) => data.type === "tool")
      .map(
        (item) =>
          new Tool({
            function: item.props?.function,
            arguments: item.props?.arguments,
            error: item.props?.error,
          })
      );
  }

  /**
   * Execute a handler when function is called
   */
  When(functionName: string, handler: FunctionHandler, ...args: any[]): any {
    let found = false;
    let res: any = false;
    for (const tool of this.tools) {
      res = tool.When(functionName, handler, ...args);
      if (res !== false) {
        found = true;
        break;
      }
    }
    return res;
  }

  /**
   * Execute callback for each tool
   */
  Each(callback: (tool: Tool, index: number) => void): void {
    this.tools.forEach(callback);
  }
}
