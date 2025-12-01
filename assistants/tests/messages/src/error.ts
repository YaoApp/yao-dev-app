// @ts-nocheck
import { Process, time } from "@yao/runtime";

/**
 * Error message types test - simulates various error scenarios
 */
export function error(ctx: agent.Context) {
  // Send complete header message
  ctx.Send({
    type: "text",
    props: {
      content:
        "# ⚠️ Error Message Types Test\n\nSimulating various error scenarios...",
    },
  });

  time.Sleep(500);

  // 1. Basic error message
  basic_error(ctx);
  time.Sleep(500);

  // 2. Error with code
  error_with_code(ctx);
  time.Sleep(500);

  // 3. Error with details
  error_with_details(ctx);
  time.Sleep(500);

  // 4. Streaming error recovery scenario
  streaming_error_recovery(ctx);
  time.Sleep(500);

  // 5. Multiple errors in sequence
  multiple_errors(ctx);
  time.Sleep(500);

  // Send complete summary message
  ctx.Send({
    type: "text",
    props: {
      content: "\n✅ **All error message tests completed!**",
    },
  });
}

/**
 * Basic error message - simple error with message only
 */
function basic_error(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  // Send explanatory text
  ctx.Send(
    {
      type: "text",
      props: {
        content: "## 🔴 Basic Error\n\nSimple error message:\n\n",
      },
    },
    block_id
  );

  time.Sleep(300);

  // Send error message
  ctx.Send(
    {
      type: "error",
      props: {
        message: "Connection timeout",
      },
    },
    block_id
  );

  ctx.EndBlock(block_id);
}

/**
 * Error with code - error message with error code
 */
function error_with_code(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  ctx.Send(
    {
      type: "text",
      props: {
        content: "## 🔴 Error with Code\n\nError message with error code:\n\n",
      },
    },
    block_id
  );

  time.Sleep(300);

  ctx.Send(
    {
      type: "error",
      props: {
        message: "Failed to authenticate user",
        code: "AUTH_FAILED",
      },
    },
    block_id
  );

  ctx.EndBlock(block_id);
}

/**
 * Error with details - complete error with message, code, and details
 */
function error_with_details(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  ctx.Send(
    {
      type: "text",
      props: {
        content:
          "## 🔴 Error with Details\n\nComplete error with message, code, and details:\n\n",
      },
    },
    block_id
  );

  time.Sleep(300);

  ctx.Send(
    {
      type: "error",
      props: {
        message: "Database connection failed",
        code: "DB_CONNECTION_ERROR",
        details:
          "Failed to connect to database after 30 seconds. Check network connectivity and database credentials.",
      },
    },
    block_id
  );

  ctx.EndBlock(block_id);
}

/**
 * Streaming error recovery scenario - demonstrates error handling during streaming
 */
function streaming_error_recovery(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  ctx.Send(
    {
      type: "text",
      props: {
        content:
          "## 🔄 Error Recovery Scenario\n\nSimulating error during processing with recovery:\n\n",
      },
    },
    block_id
  );

  time.Sleep(300);

  // Show processing
  const loading_id = ctx.Send(
    {
      type: "loading",
      props: {
        message: "Processing request...",
      },
    },
    block_id
  );

  time.Sleep(1000);

  // Update loading
  ctx.Replace(loading_id, {
    type: "loading",
    props: {
      message: "Connecting to database...",
    },
  });

  time.Sleep(1000);

  // Error occurs
  ctx.Replace(loading_id, {
    type: "error",
    props: {
      message: "Connection timeout",
      code: "TIMEOUT",
      details: "Database connection timeout after 5 seconds",
    },
  });

  time.Sleep(1500);

  // Show retry
  ctx.Send(
    {
      type: "text",
      props: {
        content: "\n**Retrying with fallback database...**\n\n",
      },
    },
    block_id
  );

  time.Sleep(300);

  const retry_loading = ctx.Send(
    {
      type: "loading",
      props: {
        message: "Connecting to fallback database...",
      },
    },
    block_id
  );

  time.Sleep(1000);

  // Success
  ctx.Replace(retry_loading, {
    type: "text",
    props: {
      content: "✅ Successfully connected to fallback database!",
    },
  });

  ctx.EndBlock(block_id);
}

/**
 * Multiple errors - demonstrates different error types in sequence
 */
function multiple_errors(ctx: agent.Context) {
  const block_id = ctx.BlockID();

  ctx.Send(
    {
      type: "text",
      props: {
        content:
          "## 🚨 Multiple Error Types\n\nDemonstrating various error scenarios:\n\n",
      },
    },
    block_id
  );

  time.Sleep(300);

  // Network error
  ctx.Send(
    {
      type: "text",
      props: {
        content: "### Network Error\n",
      },
    },
    block_id
  );

  ctx.Send(
    {
      type: "error",
      props: {
        message: "Network request failed",
        code: "NETWORK_ERROR",
        details: "Unable to reach external API endpoint",
      },
    },
    block_id
  );

  time.Sleep(800);

  // Validation error
  ctx.Send(
    {
      type: "text",
      props: {
        content: "\n### Validation Error\n",
      },
    },
    block_id
  );

  ctx.Send(
    {
      type: "error",
      props: {
        message: "Invalid input parameters",
        code: "VALIDATION_ERROR",
        details: "Required field 'email' is missing or invalid format",
      },
    },
    block_id
  );

  time.Sleep(800);

  // Permission error
  ctx.Send(
    {
      type: "text",
      props: {
        content: "\n### Permission Error\n",
      },
    },
    block_id
  );

  ctx.Send(
    {
      type: "error",
      props: {
        message: "Access denied",
        code: "PERMISSION_DENIED",
        details: "User does not have sufficient permissions to access this resource",
      },
    },
    block_id
  );

  time.Sleep(800);

  // Rate limit error
  ctx.Send(
    {
      type: "text",
      props: {
        content: "\n### Rate Limit Error\n",
      },
    },
    block_id
  );

  ctx.Send(
    {
      type: "error",
      props: {
        message: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        details: "Too many requests. Please try again in 60 seconds.",
      },
    },
    block_id
  );

  ctx.EndBlock(block_id);
}

