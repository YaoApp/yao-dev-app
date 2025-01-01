import { neo, io } from "@yao/runtime";
import { SendString } from "./utils";

function Create(ctx: neo.Context, messages: neo.Message[]) {
  return { chat_id: "123" };
}

function Prepare(ctx: neo.Context, messages: neo.Message[]): neo.Message[] {
  return messages;
}

function Write(
  ctx: neo.Context,
  messages: neo.Message[],
  response: neo.Response,
  content?: string,
  writer?: io.ResponseWriter
): neo.Message[] {
  SendString(writer, content);
  return messages;
}
