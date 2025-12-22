# Yao Agent Testing Reference

## Overview

The Yao Agent Test Framework provides comprehensive testing capabilities for agents and their scripts, including assertions, stability analysis, and CI integration.

## Quick Start

### Agent Tests

```bash
# Test with direct message (auto-detect agent from current directory)
cd assistants/keyword
yao agent test -i "Extract keywords from: AI and machine learning"

# Test with JSONL file
yao agent test -i tests/inputs.jsonl

# Generate HTML report
yao agent test -i tests/inputs.jsonl -o report.html
```

### Script Tests

```bash
# Test agent handler scripts (hooks, tools, setup functions)
yao agent test -i scripts.expense.setup -v

# Run specific tests with regex filter
yao agent test -i scripts.expense.setup --run "TestSystemReady" -v

# Run with custom context
yao agent test -i scripts.expense.setup --ctx tests/context.json -v
```

## Input Modes

| Mode    | Description              | Example                                      |
| ------- | ------------------------ | -------------------------------------------- |
| File    | Load from JSONL file     | `-i tests/inputs.jsonl`                      |
| Message | Direct message string    | `-i "Hello world"`                           |
| Script  | Test handler scripts     | `-i scripts.expense.setup`                   |

## Writing Script Tests

Test scripts should be placed alongside source files with `_test.ts` suffix:

```
assistants/expense/src/
├── setup.ts           # Source file
├── setup_test.ts      # Test file
├── tools.ts
└── tools_test.ts
```

### Test Function Signature

```typescript
// Test function must start with "Test" and accept (t: testing.T, ctx: agent.Context)
export function TestSystemReady(t: testing.T, ctx: agent.Context) {
  const result = SystemReady(ctx);

  // Use t.assert for assertions
  t.assert.True(result.success, "SystemReady should succeed");
  t.assert.Equal(result.status, "ready", "Status should be ready");
  t.assert.NotNil(result.data, "Data should not be nil");
}
```

### Available Assertions

| Method                           | Description                    |
| -------------------------------- | ------------------------------ |
| `t.assert.True(value, msg)`      | Assert value is true           |
| `t.assert.False(value, msg)`     | Assert value is false          |
| `t.assert.Equal(a, b, msg)`      | Assert a equals b              |
| `t.assert.NotEqual(a, b, msg)`   | Assert a not equals b          |
| `t.assert.Nil(value, msg)`       | Assert value is null/undefined |
| `t.assert.NotNil(value, msg)`    | Assert value is not nil        |
| `t.assert.Contains(s, sub, msg)` | Assert string contains substr  |
| `t.assert.Len(arr, n, msg)`      | Assert array/string length     |

### Test Control Methods

| Method         | Description                  |
| -------------- | ---------------------------- |
| `t.Log(msg)`   | Log a message                |
| `t.Error(msg)` | Mark test as failed with msg |
| `t.Fatal(msg)` | Mark failed and stop test    |
| `t.Skip(msg)`  | Skip this test               |

## Input Format (JSONL)

Each line is a JSON object:

```jsonl
{"id": "T001", "input": "Simple text"}
{"id": "T002", "input": {"role": "user", "content": "Message with role"}}
{"id": "T003", "input": [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello"}]}
{"id": "T004", "input": "Test", "assert": {"type": "json_path", "path": "field", "value": true}}
{"id": "T005", "input": "Skip this", "skip": true}
```

### Test Case Fields

| Field      | Type                           | Required | Description                   |
| ---------- | ------------------------------ | -------- | ----------------------------- |
| `id`       | string                         | Yes      | Test case ID                  |
| `input`    | string \| Message \| []Message | Yes      | Test input                    |
| `assert`   | Assertion \| []Assertion       | No       | Assertion rules               |
| `expected` | any                            | No       | Expected output (exact match) |
| `user`     | string                         | No       | Override user ID              |
| `team`     | string                         | No       | Override team ID              |
| `options`  | Options                        | No       | Context options               |
| `timeout`  | string                         | No       | Override timeout              |
| `skip`     | bool                           | No       | Skip this test                |

### Options

```jsonl
{
  "id": "T001",
  "input": "Query users",
  "options": {
    "connector": "deepseek.v3",
    "metadata": { "scenario": "filter" },
    "skip": { "trace": true, "search": true }
  }
}
```

## Assertion Types

| Type           | Description                   | Example                                                   |
| -------------- | ----------------------------- | --------------------------------------------------------- |
| `equals`       | Exact match                   | `{"type": "equals", "value": {"key": "val"}}`             |
| `contains`     | Output contains value         | `{"type": "contains", "value": "keyword"}`                |
| `not_contains` | Output does not contain       | `{"type": "not_contains", "value": "error"}`              |
| `json_path`    | Extract JSON path and compare | `{"type": "json_path", "path": "$.field", "value": true}` |
| `regex`        | Match regex pattern           | `{"type": "regex", "value": "\\d+"}`                      |
| `type`         | Check output type             | `{"type": "type", "value": "object"}`                     |
| `script`       | Run custom assertion script   | `{"type": "script", "script": "scripts.test.Check"}`      |

### JSON Path Examples

```jsonl
{"assert": {"type": "json_path", "path": "wheres[0].like", "value": "%test%"}}
{"assert": {"type": "json_path", "path": "joins[0].from", "value": "users"}}
{"assert": {"type": "json_path", "path": "error", "value": ["missing_schema", "missing_query"]}}
```

## Command Line Options

| Flag          | Description                  | Default                    |
| ------------- | ---------------------------- | -------------------------- |
| `-i`          | Input (file, message, or ID) | (required)                 |
| `-o`          | Output file path             | `output-{timestamp}.jsonl` |
| `-n`          | Agent ID                     | auto-detect                |
| `-c`          | Override connector           | agent default              |
| `-u`          | Test user ID                 | `test-user`                |
| `-t`          | Test team ID                 | `test-team`                |
| `--ctx`       | Path to context JSON file    | -                          |
| `--runs`      | Runs per test (stability)    | 1                          |
| `--run`       | Regex pattern to filter      | -                          |
| `--timeout`   | Timeout per test             | 5m                         |
| `--parallel`  | Parallel test cases          | 1                          |
| `-v`          | Verbose output               | false                      |
| `--fail-fast` | Stop on first failure        | false                      |

## Custom Context File

Create a JSON file for custom authorization:

```json
{
  "authorized": {
    "user_id": "test-user-123",
    "team_id": "test-team-456",
    "constraints": {
      "owner_only": true,
      "extra": { "department": "engineering" }
    }
  },
  "metadata": {
    "mode": "test"
  }
}
```

Use with `--ctx`:

```bash
yao agent test -i scripts.expense.setup --ctx tests/context.json -v
```

## Stability Analysis

```bash
yao agent test -i tests/inputs.jsonl --runs 5 -o stability.json
```

| Pass Rate | Classification  |
| --------- | --------------- |
| 100%      | Stable          |
| 80-99%    | Mostly Stable   |
| 50-79%    | Unstable        |
| < 50%     | Highly Unstable |

## CI Integration

```yaml
- name: Run Agent Tests
  run: |
    yao agent test -i assistants/keyword/tests/inputs.jsonl \
      -u ci-user -t ci-team \
      --runs 3 \
      -o report.json

- name: Run Script Tests
  run: |
    yao agent test -i scripts.expense.setup -v --fail-fast
```

## Exit Codes

| Code | Description                                         |
| ---- | --------------------------------------------------- |
| 0    | All tests passed                                    |
| 1    | Tests failed, configuration error, or runtime error |

## See Also

- [Hooks Reference](./hooks-reference.md)
- [Assistant Structure](./assistant-structure.md)
- [Agent Context API](./agent-context-api.md)

