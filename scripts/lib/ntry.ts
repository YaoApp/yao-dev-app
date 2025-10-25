import { agent, Process } from "@yao/runtime";
import { AgentStore, BaseStore } from "./store";

type NtryError = {
  retry?: boolean;
  abort?: boolean;
  message: string;
};

export class Ntry {
  private times: number;
  private input: agent.Input;
  private fn: () => any;
  private store: BaseStore;
  private key: string;

  public result: any;
  public error: NtryError;
  public retry: boolean;
  public abort: boolean;
  public next: agent.NextAction;
  private repairPrompt?: string;

  constructor(times: number = 3, input: agent.Input, fn: () => any) {
    this.times = times;
    this.input = input;
    this.fn = fn;
    this.key = `RETRY_${Process("crypto.Hash", "MD5", fn.toString())}`;
  }

  public Bind(store: BaseStore) {
    this.store = store;
    return this;
  }

  public WithRepairPrompt(prompt: string) {
    this.repairPrompt = prompt;
    return this;
  }

  public parsePrompt(prompt: string, data?: Record<string, any>): string {
    const lastInput = this.input[this.input.length - 1];
    const errorMessage = this.error.message;

    // The last answer is wrong, please try again.
    //   Error:
    //   {{ error }}
    //   User Question:
    //   {{ lastInput }}

    data = { error: errorMessage, lastInput: lastInput.text, ...data };
    if (!prompt) {
      return "";
    }

    return prompt.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  public Next(): agent.NextAction {
    const assistant_id = this.store.AssistantID();
    const chat_id = this.store.ChatID();
    if (!this.repairPrompt || this.repairPrompt.length == 0) {
      this.repairPrompt = `The last answer is wrong, please try again.

      Error:
      {{ error }}
      
      User Question:
      {{ lastInput }}`;
    }

    const prompt = this.parsePrompt(this.repairPrompt);
    const lastInput = this.input[this.input.length - 1];
    const retryInput = { ...lastInput, text: prompt };

    return {
      action: "assistant",
      payload: { assistant_id, chat_id, input: retryInput, retry: true },
    };
  }

  public Run() {
    try {
      this.result = this.fn();
    } catch (error) {
      this.error = {
        abort: true,
        message: error.message || error || "Unknown error",
      };

      // Get retry Times from failed count
      const failedCount = this.store.Get(this.key) || 1;
      if (failedCount >= this.times) {
        this.abort = true;
        this.store.Del(this.key); // Clear the failed count
        return this;
      }

      this.retry = true;
      this.next = this.Next();
      this.store.Set(this.key, failedCount + 1);
      return this;
    }

    this.store.Del(this.key); // Clear the failed count
    return this;
  }
}
