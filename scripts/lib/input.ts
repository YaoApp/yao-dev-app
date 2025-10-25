import { agent, FS } from "@yao/runtime";
import { Model, RelatedModels } from "./model";
import { Excel } from "./excel";

/**
 * Input class for manipulating input
 */
export class Input {
  /**
   * Get the last message from the input
   * @param input the input of the user
   * @returns the last message
   */
  static Last(input: agent.Input) {
    if (input.length === 0) {
      throw new Error("Input is empty");
    }
    return input[input.length - 1];
  }

  /**
   * Get the attachments from the last message
   * @param input the input of the user
   * @returns the attachments
   */
  static Attachments(input: agent.Input) {
    return Input.Last(input).attachments || [];
  }

  /**
   * Iterate over the attachments
   * @param input the input of the user
   * @param callback the callback function
   */
  static EachAttachment(
    input: agent.Input,
    callback: (attachment: agent.Attachment) => void
  ) {
    const attachments = Input.Attachments(input);
    for (const attachment of attachments) {
      callback(attachment);
    }
  }

  /**
   * Get the assistant message before the last user message
   * @param input the input of the user
   * @returns the assistant message
   */
  static LastAssistant(input: agent.Input): string | undefined {
    for (let i = input.length - 1; i >= 0; i--) {
      if (input[i].role === "assistant") {
        return input[i].text || input[i].props?.text || undefined;
      }
    }
    return undefined;
  }

  /**
   * Keep only the last user message and all system messages
   * @param input the input of the user
   * @returns the filtered input
   */
  static KeepLast(input: agent.Input): agent.Input {
    let lastUserMessage = null;
    const result: agent.Input = [];

    for (let i = 0; i < input.length; i++) {
      if (input[i].role === "system") {
        result.push(input[i]);
      } else if (input[i].role === "user") {
        lastUserMessage = input[i];
      }
    }

    if (lastUserMessage) {
      result.push(lastUserMessage);
    }

    return result;
  }

  /**
   * Keep all system messages and the last N user/assistant messages
   * @param input the input of the user
   * @param n the number of user/assistant messages to keep
   * @returns the filtered input
   */
  static KeepLastN(input: agent.Input, n: number): agent.Input {
    const result: agent.Input = [];
    const userAssistantMessages: agent.Input = [];

    // First pass: collect all system messages and user/assistant messages
    for (let i = 0; i < input.length; i++) {
      if (input[i].role === "system") {
        result.push(input[i]);
      } else {
        userAssistantMessages.push(input[i]);
      }
    }

    // Second pass: add the last N user/assistant messages in original order
    const startIndex = Math.max(0, userAssistantMessages.length - n);
    for (let i = startIndex; i < userAssistantMessages.length; i++) {
      result.push(userAssistantMessages[i]);
    }

    return result;
  }

  /**
   * Append related models to the input
   * @param input the input of the user
   * @param context the context of the user
   * @param n the number of samples to append
   */
  static WithRelatedModels(
    input: agent.Input,
    context: agent.Context,
    n: number = 5
  ) {
    const relatedModels = RelatedModels(context);
    const models = Model.Summaries({ models: relatedModels });
    Input.Append(input, {
      role: "system",
      name: "Models",
      text: `系统中可用的数据模型信息 RelatedModels:\n${JSON.stringify(
        models
      )}`,
    });

    // 获取当前模型的前5条数据
    if (models && models.length > 0) {
      try {
        const samples = Model.GetSamples(models, n);
        Input.Append(input, {
          role: "system",
          name: "Samples",
          text: `系统中可用的数据模型 Samples:\n${JSON.stringify(samples)}`,
        });
      } catch (error) {
        console.log("--- Get Samples Error -----------------------------");
        console.error(error);
        console.log("--------------------------------");
      }
    }
  }

  /**
   * Filter out all system messages
   * @param input the input of the user
   * @returns the filtered input
   */
  static FilterSystem(input: agent.Input): agent.Input {
    return input.filter((msg) => msg.role !== "system");
  }

  /**
   * Keep only the system messages
   * @param input the input of the user
   * @returns the filtered input
   */
  static KeepSystem(input: agent.Input): agent.Input {
    return input.filter((msg) => msg.role === "system");
  }

  /**
   * Append a message to the input
   * @param input the input of the user
   * @param message the message to append
   */
  static Append(input: agent.Input, message: agent.InputMessage) {
    // Find the index of the last user message
    let lastUserIndex = -1;
    for (let i = input.length - 1; i >= 0; i--) {
      if (input[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) {
      // No user message found, append at the end
      input.push(message);
    } else {
      // Insert before the last user message
      input.splice(lastUserIndex, 0, message);
    }
  }

  /**
   * Read the attachments from the input
   * @param input the input of the user
   * @param vision whether to use vision to read the attachments
   * @returns each attachment as an input message
   */
  static OpenAttachments(
    input: agent.Input,
    vision: boolean = false
  ): agent.Input {
    const result: agent.Input = [];
    input?.forEach?.((message: agent.InputMessage) => {
      if (!message.attachments || message.attachments.length === 0) {
        return;
      }
      message.attachments.forEach((attachment) => {
        result.push(readAttachment(attachment, vision));
      });
      delete message.attachments;
    });
    return result;
  }
}

function readAttachment(
  attachment: agent.Attachment,
  vision: boolean
): agent.InputMessage {
  const type = attachment.type;
  const content_type = attachment.content_type;
  let content = "";
  if (type === "XLSX.SHEET") {
    content = readAttachmentExcelSheet(attachment, attachment.name);
  } else if (type === "XLSX") {
    content = readAttachmentExcel(attachment);
  } else if (type === "MODEL") {
    content = readAttachmentModel(attachment);
  } else if (content_type.startsWith("text/")) {
    content = readAttachmentText(attachment);
  }
  return {
    role: "system",
    name: `Attachment_${fmt(attachment.name)}_${fmt(attachment.file_id)}`,
    text: content,
  };
}

function fmt(str: string): string {
  return str.replace(/\s+|\.|\//g, "_");
}

function readAttachmentText(attachment: agent.Attachment): string {
  const fs = new FS("data");
  return fs.ReadFile(attachment.file_id);
}

function readAttachmentImage(attachment: agent.Attachment): agent.InputMessage {
  const fs = new FS("data");
  const content = fs.ReadFileBase64(attachment.file_id);
  return {
    role: "system",
    name: `Attachment_${fmt(attachment.name)}_${fmt(attachment.file_id)}`,
    text: content,
  };
}

function readAttachmentModel(attachment: agent.Attachment): string {
  const schema = Model.Get(attachment.name, {
    metadata: true,
    columns: true,
  });

  const samples = Model.GetSamples([attachment.name], 20);
  return `
  --- Model ${attachment.name} ---
  Model ID: ${attachment.name}
  Model ${attachment.name} Schema:
  ${JSON.stringify(schema)}
  Top 20 Samples:
  ${JSON.stringify(samples)}
  --- End of Model ${attachment.name} ---
  `;
}

function readAttachmentExcelSheet(
  attachment: agent.Attachment,
  sheet: string
): string {
  const excel = new Excel(attachment.file_id);
  const heads = excel.Heads(20, [sheet]);
  return `
  --- Excel ${attachment.file_id} ${sheet} ---
  Excel File: ${attachment.file_id}
  Excel Sheet: ${sheet}
  Top 20 Rows:
  ${JSON.stringify(heads)}
  --- End of Excel ${attachment.file_id} ${sheet} ---
  `;
}

function readAttachmentExcel(attachment: agent.Attachment): string {
  const excel = new Excel(attachment.file_id);
  const sheets = excel.Sheets();
  return sheets
    .map((sheet) => readAttachmentExcelSheet(attachment, sheet))
    .join("\n\n");
}
