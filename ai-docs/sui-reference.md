# SUI Reference

> SUI (Simple User Interface) - Full-stack web framework for HTML/CSS/TypeScript without build tools.

## Directory Structure

```
/templates/<template>/
├── __document.html          # Global HTML wrapper (contains {{ __page }})
├── __data.json              # Global data
├── __assets/                # Static assets
├── __locales/<locale>/      # i18n files (.yml)
└── <route>/<page>/
    ├── <page>.html          # Template
    ├── <page>.css           # Styles (auto-scoped)
    ├── <page>.ts            # Frontend script
    ├── <page>.json          # Data config
    ├── <page>.config        # Page config (title, guard, cache)
    └── <page>.backend.ts    # Server-side script
```

**Agent SUI** (for AI assistants):

```
/agent/template/             # Global template
/assistants/<name>/pages/    # Assistant pages → /agents/<name>/<route>
```

## Template Syntax

### Data Binding

```html
{{ name }}                       <!-- Variable -->
{{ user.email }}                 <!-- Nested -->
{{ title ?? 'Default' }}         <!-- Default value -->
{{ price * quantity }}           <!-- Expression -->
{{ count > 0 ? 'Yes' : 'No' }}   <!-- Ternary -->
```

### Conditionals

```html
<div s:if="{{ isActive }}">Active</div>
<div s:elif="{{ isPending }}">Pending</div>
<div s:else>Unknown</div>
```

### Loops

```html
<li s:for="{{ items }}" s:for-item="item" s:for-index="i">
  {{ i }}: {{ item.name }}
</li>
```

### Attributes

```html
<button s:attr-disabled="{{ !isValid }}">Submit</button>
<div s:raw="true">{{ htmlContent }}</div>
<s:set name="total" value="{{ price * qty }}" />
```

### Expression Functions

SUI uses [Expr](https://expr-lang.org/) v1.17. Custom functions:

| Function   | Example                           |
| ---------- | --------------------------------- |
| `P_(...)`  | `{{ P_('models.user.Find', 1) }}` |
| `True(v)`  | `{{ True(user) }}`                |
| `False(v)` | `{{ False(error) }}`              |
| `Empty(v)` | `{{ Empty(items) }}`              |

Common Expr functions: `len()`, `filter()`, `map()`, `find()`, `count()`, `sum()`, `first()`, `last()`, `contains()`, `upper()`, `lower()`, `trim()`, `split()`, `join()`

## Components

**Every page is a component.** Use `is` attribute to embed:

```html
<!-- Direct usage -->
<div is="/card" title="My Card"><p>Content</p></div>

<!-- With import alias (case-sensitive!) -->
<import s:as="Card" s:from="/card" />
<Card title="My Card"><p>Content</p></Card>
```

### Slots

```html
<!-- Component: /modal/modal.html -->
<div class="modal">
  <slot name="header"></slot>
  <children></children>
  <slot name="footer"></slot>
</div>

<!-- Usage -->
<div is="/modal">
  <slot name="header"><h2>Title</h2></slot>
  <p>Body content</p>
  <slot name="footer"><button>OK</button></slot>
</div>
```

## Events

```html
<button s:on-click="HandleClick" s:data-id="{{ item.id }}" s:json-item="{{ item }}">
  Click
</button>
```

**Direct style** (simple pages):

```typescript
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#myForm") as HTMLFormElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Handle submission
  });
});
```

**Component style** (interactive pages):

```typescript
import { $Backend, Component, EventData } from "@yao/sui";

const self = this as Component;

self.HandleClick = async (event: Event, data: EventData) => {
  const id = data.id; // from s:data-id
  const item = data.item; // from s:json-item
  await $Backend().Call("ApiDelete", id);
};

// State watchers
self.watch = {
  count: (value: number) => {
    self.root.querySelector(".count")!.textContent = String(value);
  },
};
```

## Backend Script

**`<page>.backend.ts`**:

```typescript
// Constants available in frontend
const __sui_constants = { API_URL: "/api" };

// Helper functions exported to frontend
const __sui_helpers = ["formatDate"];
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString();
}

// Called before render (data merged with page data)
function BeforeRender(request: Request, props?: Record<string, any>): Record<string, any> {
  return {
    user: Process("session.Get", "user"),
    items: Process("models.item.Get", { limit: 10 }),
  };
}

// API methods (callable from frontend as this.backend.ApiXxx)
function ApiGetItems(page: number, request: Request): any {
  return Process("models.item.Paginate", { page, pageSize: 10 });
}
```

## Data Sources

### Built-in Variables

| Variable     | Description          |
| ------------ | -------------------- |
| `$query`     | URL query params     |
| `$param`     | Route params         |
| `$payload`   | POST body            |
| `$cookie`    | Cookies              |
| `$url`       | URL info (.path, .host, .domain, .scheme) |
| `$theme`     | Current theme        |
| `$locale`    | Current locale       |
| `$global`    | From `__data.json`   |
| `$auth`      | OAuth info (if guard="oauth") |

### Page Data (`<page>.json`)

```json
{
  "title": "Page Title",
  "$users": "models.user.Get",
  "$user": { "process": "models.user.Find", "args": ["$param.id"] }
}
```

## Frontend API

```typescript
import { $Backend, Component } from "@yao/sui";

const self = this as Component;

// Backend call
const users = await $Backend().Call("ApiGetUsers");

// Render target
await self.render("userList", { users });

// Component query
const card = $$("#my-card");
card.query(".title");
card.queryAll(".item");

// OpenAPI client
const api = new OpenAPI({ baseURL: "/api" });
const res = await api.Get<User[]>("/users");
if (api.IsError(res)) { console.error(res.error); }

// File upload
const fileApi = new FileAPI(api);
await fileApi.Upload(file, { path: "uploads" }, (p) => console.log(p.percentage));
```

## i18n

```html
<span s:trans>Hello World</span>
<span>{{ '::Welcome' }}</span>
```

**`__locales/zh-cn/<route>.yml`**:

```yaml
messages:
  Hello World: 你好世界
  Welcome: 欢迎
script_messages:
  "Confirm?": "确定吗？"
```

## CUI Integration

When SUI pages are embedded in CUI via `/web/` routes:

```typescript
// Helper: Send action to CUI parent
const sendAction = (name: string, payload?: any) => {
  window.parent.postMessage(
    { type: "action", message: { name, payload } },
    window.location.origin
  );
};

// Show notification
sendAction("notify.success", { message: "Done!" });

// Navigate
sendAction("navigate", { route: "/agents/my-app/detail", title: "Details" });

// Receive context from CUI
window.addEventListener("message", (e) => {
  if (e.origin !== window.location.origin) return;
  if (e.data.type === "setup") {
    const { theme, locale } = e.data.message;
    document.documentElement.setAttribute("data-theme", theme);
  }
});
```

**Actions:** `navigate`, `navigate.back`, `notify.success/error/warning/info`, `app.menu.reload`, `modal.open/close`, `table.search/refresh`, `form.submit/reset`, `event.emit`, `confirm`

## Commands

```bash
yao sui build <sui> [template]     # Build
yao sui build <sui> [template] -D  # Debug mode
yao sui watch <sui> [template]     # Watch
yao sui build agent                # Build Agent SUI
yao sui trans <sui> <template>     # Extract translations
```

## Quick Examples

### Simple Page

**`/home/home.html`**:

```html
<div class="home">
  <h1>{{ title }}</h1>
  <ul>
    <li s:for="{{ items }}" s:for-item="item">{{ item.name }}</li>
  </ul>
  <div s:if="{{ Empty(items) }}">No items</div>
</div>
```

**`/home/home.backend.ts`**:

```typescript
function BeforeRender(request: Request): Record<string, any> {
  return {
    title: "My Page",
    items: Process("models.item.Get", { limit: 10 }),
  };
}

function ApiAddItem(name: string, request: Request): any {
  return Process("models.item.Create", { name });
}
```

**`/home/home.ts`**:

```typescript
import { $Backend, Component } from "@yao/sui";

const self = this as Component;

self.AddItem = async (event: Event) => {
  const input = self.root.querySelector("input") as HTMLInputElement;
  await $Backend().Call("ApiAddItem", input.value);
  location.reload();
};
```

### Page Config

**`/home/home.config`**:

```json
{
  "title": "Home",
  "guard": "bearer-jwt",
  "cache": 3600,
  "dataCache": 60
}
```
