/**
 * TestProcessChatCompletions - Test the openai.chat.Completions Process
 */
function TestProcessChatCompletions() {
  let messages = [{ role: "user", content: "Hello" }];
  let connector = "gpt-3_5-turbo";
  let res = "";
  Process("openai.chat.Completions", connector, messages, null, (data) => {
    res = res + data;
    if (data == "data: [DONE]") {
      return 0;
    }
    return 1;
  });
  return res;
}
