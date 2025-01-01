import { io, neo, Process } from "@yao/runtime";

/**
 * Send the string message to the writer
 * @param writer
 * @param message
 */
export function SendString(writer: io.ResponseWriter, message: string) {
  const response: neo.Response = { text: message };
  try {
    Process("neo.Write", writer, [response]);
  } catch (error) {
    console.log("Error in sending response", error);
  }
}

/**
 * Send the response to the writer
 * @param writer
 * @param response
 */
export function Send(writer: io.ResponseWriter, response: neo.Response) {
  try {
    Process("neo.Write", writer, [response]);
  } catch (error) {
    console.log("Error in sending response", error);
  }
}
