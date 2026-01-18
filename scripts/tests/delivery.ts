/**
 * Test scripts for Robot Delivery Process
 * Used by delivery_test.go
 */

interface DeliveryContent {
  summary: string;
  body: string;
  attachments?: DeliveryAttachment[];
}

interface DeliveryAttachment {
  title: string;
  description?: string;
  task_id?: string;
  file: string;
}

interface DeliveryContext {
  execution_id: string;
  member_id: string;
  team_id: string;
  trigger_type: string;
}

interface DeliveryPayload {
  content: DeliveryContent;
  context: DeliveryContext;
}

/**
 * Handle delivery content - simple echo handler
 * @param delivery - Delivery payload with content and context
 * @param arg1 - Optional first argument
 * @param arg2 - Optional second argument
 * @returns Result with received data
 */
function Handle(
  delivery: DeliveryPayload,
  arg1?: string,
  arg2?: string
): object {
  console.log(`[Delivery.Handle] Received delivery:`, JSON.stringify(delivery));

  if (!delivery || !delivery.content) {
    throw new Error("Invalid delivery: missing content");
  }

  return {
    success: true,
    received: {
      summary: delivery.content.summary,
      body_length: delivery.content.body?.length || 0,
      attachments_count: delivery.content.attachments?.length || 0,
      execution_id: delivery.context?.execution_id,
      member_id: delivery.context?.member_id,
      team_id: delivery.context?.team_id,
      trigger_type: delivery.context?.trigger_type,
    },
    args: {
      arg1: arg1 || null,
      arg2: arg2 || null,
    },
    processed_at: new Date().toISOString(),
  };
}

/**
 * Handle delivery with failure simulation
 * @param delivery - Delivery payload
 * @param shouldFail - If true, throws an error
 * @returns Result or throws error
 */
function HandleWithFailure(
  delivery: DeliveryPayload,
  shouldFail: boolean
): object {
  console.log(
    `[Delivery.HandleWithFailure] shouldFail=${shouldFail}`,
    JSON.stringify(delivery)
  );

  if (shouldFail) {
    throw new Error("Simulated process failure");
  }

  return {
    success: true,
    message: "Delivery processed successfully",
    execution_id: delivery.context?.execution_id,
  };
}

/**
 * Handle delivery with attachments processing
 * @param delivery - Delivery payload with attachments
 * @returns Result with attachment info
 */
function HandleAttachments(delivery: DeliveryPayload): object {
  console.log(`[Delivery.HandleAttachments]`, JSON.stringify(delivery));

  const attachments = delivery.content.attachments || [];
  const processed = attachments.map((att, idx) => ({
    index: idx,
    title: att.title,
    description: att.description,
    task_id: att.task_id,
    file: att.file,
    has_file: !!att.file,
  }));

  return {
    success: true,
    total_attachments: attachments.length,
    attachments: processed,
    execution_id: delivery.context?.execution_id,
  };
}

/**
 * Notify user about delivery (simulates notification)
 * @param delivery - Delivery payload
 * @param userId - User ID to notify
 * @param channel - Notification channel (push, in-app, etc.)
 * @returns Notification result
 */
function Notify(
  delivery: DeliveryPayload,
  userId: string,
  channel?: string
): object {
  console.log(
    `[Delivery.Notify] userId=${userId}, channel=${channel}`,
    JSON.stringify(delivery)
  );

  return {
    success: true,
    notified: {
      user_id: userId,
      channel: channel || "default",
      title: delivery.content.summary,
      sent_at: new Date().toISOString(),
    },
  };
}
