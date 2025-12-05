# MCP Load Test Assistant

This is a test assistant to verify that MCP clients can be loaded from the assistant's `mcps` directory.

## Structure

```
mcpload/
├── package.yao          # Assistant configuration
├── prompts.yml          # Assistant prompts
├── mcps/                # MCP definitions directory
│   ├── test.mcp.yao     # MCP client definition
│   └── mapping/
│       └── test/
│           └── tools/
│               └── schemes/
│                   ├── hello.in.yao      # Hello tool schema
│                   └── calculate.in.yao  # Calculate tool schema
└── README.md            # This file
```

## Expected Behavior

When the application loads, the MCP client should be registered as:
- **Client ID**: `agents.tests.mcpload.test`

This follows the pattern: `agents.<assistant_id>.<mcp_filename>`

## Tools

The MCP provides two simple test tools:

1. **hello** - A greeting tool
   - Input: `{ name: string }`
   - Output: Greeting message

2. **calculate** - A basic calculator
   - Input: `{ operation: string, a: number, b: number }`
   - Output: Calculation result

## Testing

To test the MCP loading:

```bash
yao run scripts.test_mcp_load.TestMCPLoad
```

Or use the Yao console:
```javascript
Process("mcp.client.Exists", "agents.tests.mcpload.test")
Process("mcp.client.Get", "agents.tests.mcpload.test")
Process("mcp.client.CallTool", "agents.tests.mcpload.test", "hello", { name: "World" })
```

