// @ts-nocheck
import { time } from "@yao/runtime";

/**
 * Action message types test - tests CUI Action system
 */
export function action(ctx: agent.Context) {
  // Send complete message (header)
  ctx.Send({
    type: "text",
    props: {
      content:
        "# 🎯 Action Message Types Test\n\nTesting action messages...\n\n",
    },
  });

  time.Sleep(500);

  // 1. Navigate action tests
  navigate_tests(ctx);

  time.Sleep(500);

  // 2. App menu reload test
  app_menu_reload_test(ctx);

  time.Sleep(500);

  // 3. Notify action tests
  notify_tests(ctx);

  time.Sleep(500);

  // Send complete message (summary)
  ctx.Send({
    type: "text",
    props: {
      content: "\n✅ **All action tests completed!**",
    },
  });
}

/**
 * Navigate action tests
 */
function navigate_tests(ctx: agent.Context) {
  ctx.Send({
    type: "text",
    props: {
      content: "## 🧭 Navigate Actions\n\n",
    },
  });

  time.Sleep(500);

  // Test 1: Navigate to external URL in new tab
  ctx.Send({
    type: "text",
    props: {
      content:
        "**Test 1:** Navigate to external URL in new tab (`https://yaoapps.com`)\n\n",
    },
  });

  time.Sleep(500);

  ctx.Send({
    type: "action",
    props: {
      name: "navigate",
      payload: {
        route: "https://yaoapps.com",
        target: "_blank",
      },
    },
  });

  time.Sleep(3000);

  // Test 2: Navigate to CUI Dashboard page with query parameters
  ctx.Send({
    type: "text",
    props: {
      content:
        "**Test 2:** Navigate to CUI Dashboard page with query (`$dashboard/kb?id=123`)\n\n",
    },
  });

  time.Sleep(500);

  ctx.Send({
    type: "action",
    props: {
      name: "navigate",
      payload: {
        route: "$dashboard/kb",
        query: {
          id: "123",
        },
      },
    },
  });

  time.Sleep(3000);

  // Test 3: Navigate to SUI page (expense/setup)
  ctx.Send({
    type: "text",
    props: {
      content: "**Test 3:** Navigate to SUI page (`/expense/setup`)\n\n",
    },
  });

  time.Sleep(500);

  ctx.Send({
    type: "action",
    props: {
      name: "navigate",
      payload: {
        route: "/expense/setup",
        title: "Expense Setup",
      },
    },
  });

  time.Sleep(1000);

  ctx.Send({
    type: "text",
    props: {
      content: "\n---\n\n",
    },
  });
}

/**
 * App menu reload test
 */
function app_menu_reload_test(ctx: agent.Context) {
  ctx.Send({
    type: "text",
    props: {
      content: "## 🔄 App Menu Reload\n\n",
    },
  });

  time.Sleep(300);

  ctx.Send({
    type: "text",
    props: {
      content: "**Test:** Reload application menu\n",
    },
  });

  ctx.Send({
    type: "action",
    props: {
      name: "app.menu.reload",
    },
  });

  time.Sleep(500);

  ctx.Send({
    type: "text",
    props: {
      content: "\n---\n\n",
    },
  });
}

/**
 * Notify action tests
 */
function notify_tests(ctx: agent.Context) {
  ctx.Send({
    type: "text",
    props: {
      content: "## 🔔 Notify Actions\n\n",
    },
  });

  time.Sleep(300);

  // Test 1: Success notification
  ctx.Send({
    type: "text",
    props: {
      content: "**Test 1:** Success notification\n",
    },
  });

  ctx.Send({
    type: "action",
    props: {
      name: "notify.success",
      payload: {
        message: "Data saved successfully!",
      },
    },
  });

  time.Sleep(1500);

  // Test 2: Error notification
  ctx.Send({
    type: "text",
    props: {
      content: "**Test 2:** Error notification\n",
    },
  });

  ctx.Send({
    type: "action",
    props: {
      name: "notify.error",
      payload: {
        message: "Failed to save data. Please try again.",
      },
    },
  });

  time.Sleep(1500);

  // Test 3: Warning notification
  ctx.Send({
    type: "text",
    props: {
      content: "**Test 3:** Warning notification\n",
    },
  });

  ctx.Send({
    type: "action",
    props: {
      name: "notify.warning",
      payload: {
        message: "Your session will expire in 5 minutes.",
      },
    },
  });

  time.Sleep(1500);

  // Test 4: Info notification
  ctx.Send({
    type: "text",
    props: {
      content: "**Test 4:** Info notification\n",
    },
  });

  ctx.Send({
    type: "action",
    props: {
      name: "notify.info",
      payload: {
        message: "New updates are available.",
      },
    },
  });

  time.Sleep(1500);

  // Test 5: Notification with custom duration
  ctx.Send({
    type: "text",
    props: {
      content: "**Test 5:** Notification with 5s duration\n",
    },
  });

  ctx.Send({
    type: "action",
    props: {
      name: "notify.success",
      payload: {
        message: "This notification will stay for 5 seconds.",
        duration: 5,
      },
    },
  });

  time.Sleep(500);
}

