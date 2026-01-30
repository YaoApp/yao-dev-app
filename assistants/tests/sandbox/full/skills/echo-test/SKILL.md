---
name: echo-test
description: >
  A simple skill for testing sandbox skill integration.
  Use when the user asks to test echo functionality or verify sandbox skills work correctly.
license: Apache-2.0
compatibility: Requires bash
metadata:
  author: yao-team
  version: "1.0"
allowed-tools: Bash(echo:*)
---

# Echo Test

## When to use this skill

Use this skill when:
- Testing sandbox skill integration
- Verifying that skills are correctly loaded into the sandbox
- User asks for a simple echo test

## Steps

1. Accept a message from the user
2. Echo the message back with "ECHO: " prefix
3. Optionally write the result to a file for verification

## Example

```bash
echo "ECHO: Hello World"
```

## Scripts

The `scripts/echo.sh` script can be used to echo messages with timestamps.
