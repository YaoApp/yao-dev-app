# Yao Model Definition Reference

## Overview

Models in Yao define database table structures using JSON/JSONC format with `.mod.yao`, `.mod.json`, or `.mod.jsonc` extensions.

## File Location

### Application Models

Located in `models/` directory:

```
app/
├── models/
│   ├── user.mod.yao
│   ├── order.mod.yao
│   └── product/
│       └── item.mod.yao
```

### Assistant Models

Located in assistant's `models/` directory:

```
assistants/
└── expense/
    ├── package.yao
    ├── models/
    │   ├── setting.mod.yao
    │   ├── expense.mod.yao
    │   └── voucher.mod.yao
    └── src/
        └── index.ts
```

## Model Structure

```json
{
  "name": "Model Name",
  "label": "Display Label",
  "description": "Model description",
  "tags": ["tag1", "tag2"],
  "table": {
    "name": "table_name",
    "comment": "Table comment"
  },
  "columns": [...],
  "relations": {...},
  "indexes": [...],
  "option": {
    "timestamps": true,
    "soft_deletes": true,
    "permission": true
  }
}
```

## Column Types

| Type         | Description                |
| ------------ | -------------------------- |
| `ID`         | Auto-increment primary key |
| `string`     | VARCHAR field              |
| `text`       | TEXT field                 |
| `integer`    | INT field                  |
| `bigInteger` | BIGINT field               |
| `float`      | FLOAT field                |
| `decimal`    | DECIMAL field              |
| `boolean`    | BOOLEAN field              |
| `date`       | DATE field                 |
| `datetime`   | DATETIME field             |
| `timestamp`  | TIMESTAMP field            |
| `json`       | JSON field                 |
| `enum`       | ENUM field                 |

## Column Definition

```json
{
  "name": "field_name",
  "type": "string",
  "label": "Display Label",
  "comment": "Field description",
  "length": 255,
  "nullable": true,
  "default": "default_value",
  "unique": false,
  "index": true,
  "primary": false
}
```

## Example: Setting Model

```json
{
  "name": "Expense Setting",
  "label": "Expense Setting",
  "description": "Expense system configuration per user/team",
  "tags": ["expense", "setting", "config"],
  "table": {
    "name": "expense_setting",
    "comment": "Expense system configuration per user/team"
  },
  "columns": [
    {
      "name": "id",
      "type": "ID",
      "label": "ID",
      "comment": "Primary key identifier",
      "primary": true
    },
    {
      "name": "user_id",
      "type": "string",
      "label": "User ID",
      "comment": "Owner user ID (one setting per user/team)",
      "length": 255,
      "nullable": false,
      "unique": true,
      "index": true
    },
    {
      "name": "kb_collections",
      "type": "json",
      "label": "KB Collections",
      "comment": "Knowledge base collection IDs array",
      "nullable": true
    },
    {
      "name": "default_currency",
      "type": "string",
      "label": "Default Currency",
      "comment": "Default currency code (e.g., CNY, USD)",
      "length": 10,
      "default": "CNY",
      "nullable": false
    },
    {
      "name": "is_active",
      "type": "boolean",
      "label": "Is Active",
      "comment": "Whether this setting is active",
      "default": true,
      "nullable": false,
      "index": true
    }
  ],
  "relations": {},
  "indexes": [],
  "option": {
    "timestamps": true,
    "soft_deletes": true,
    "permission": true
  }
}
```

## Options

| Option         | Description                                    |
| -------------- | ---------------------------------------------- |
| `timestamps`   | Auto-add `created_at` and `updated_at` fields  |
| `soft_deletes` | Auto-add `deleted_at` field for soft delete    |
| `permission`   | Enable permission checking for CRUD operations |

## Model ID Convention

### Application Models

```
{relative_path_without_extension}
```

Examples:

- `models/user.mod.yao` → `user`
- `models/product/item.mod.yao` → `product.item`

### Assistant Models

```
agents.{assistant_id}.{model_name}
```

Examples:

- `assistants/expense/models/setting.mod.yao` → `agents.expense.setting`
- `assistants/expense/models/voucher.mod.yao` → `agents.expense.voucher`

## Table Name Prefix

Assistant models automatically get table name prefix:

| Assistant ID    | Original Table Name | Actual Table Name                |
| --------------- | ------------------- | -------------------------------- |
| `expense`       | `expense_setting`   | `agents_expense_expense_setting` |
| `tests.mcpload` | `foo`               | `agents_tests_mcpload_foo`       |

## See Also

- [Process API](./process-api.md)
- [Agent Context API](./agent-context-api.md)
- [Knowledge Base API](./kb-api.md)
