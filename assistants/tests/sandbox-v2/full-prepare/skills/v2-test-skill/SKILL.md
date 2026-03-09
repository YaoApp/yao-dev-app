---
name: v2-test-skill
description: >
  A simple skill for testing V2 sandbox skill copy via prepare steps.
license: Apache-2.0
metadata:
  author: yao-team
  version: "1.0"
allowed-tools: Bash(echo:*)
---

# V2 Test Skill

Use this skill to verify that prepare step `action=copy` correctly
copies skills into the sandbox container.

## Steps

1. Run the echo script to verify availability
2. Check that the script has correct permissions

## Scripts

```bash
./scripts/test.sh "hello from v2"
```
