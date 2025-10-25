import { agent, Exception, Store, time } from "@yao/runtime";
import { Ntry } from "./ntry";

/**
 * Base Store interface for store classes
 */
export interface BaseStore {
  Get(key: string): any;
  Set(key: string, value: any): void;
  Del(key: string): void;
  ChatID(): string;
  AssistantID?(): string;
}

/**
 * Lock Manager
 */
class LockManager {
  private store: Store;
  private readonly prefix: string = "lock";

  constructor() {
    this.store = new Store("agent");
  }

  /**
   * Lock the global write
   */
  public Lock() {
    const name = `agent-lock-global-write`; // the global lock for write
    return this.store.Set(name, 1);
  }

  /**
   * Unlock the global write
   */
  public Unlock() {
    const name = `agent-lock-global-write`; // the global lock for write
    this.store.Del(name);
  }

  /**
   * Check if the global write is locked
   * @returns true if the global write is locked, false otherwise
   */
  public Locked() {
    const name = `agent-lock-global-write`; // the global lock for write
    return this.store.Get(name) === 1;
  }

  public Run(fn: () => any, maxWait = 1000) {
    const start = Date.now();
    while (this.Locked()) {
      if (Date.now() - start > maxWait) {
        throw new Exception("Global write is locked", 429);
      }
      time.Sleep(100);
    }

    this.Lock();
    try {
      this.Unlock();
      return fn();
    } catch (error) {
      this.Unlock();
      throw error;
    }
  }
}

export const Lock = new LockManager();

/**
 * Agent Store Manager
 */
export class AgentStore implements BaseStore {
  private assistant_id: string;
  private chat_id: string;
  private store: Store;
  private readonly prefix: string = "agent";

  constructor(assistant_id: string, chat_id: string) {
    this.assistant_id = assistant_id;
    this.chat_id = chat_id;
    this.store = new Store("agent");
  }

  /**
   * Lock the global write
   */
  public static Lock() {
    const store = new Store("agent");
    const name = `agent-lock-global-write`; // the global lock for write
    return store.Set(name, 1);
  }

  /**
   * Unlock the global write
   */
  public static Unlock() {
    const store = new Store("agent");
    const name = `agent-lock-global-write`; // the global lock for write
    store.Del(name);
  }

  /**
   * Check if the global write is locked
   * @returns true if the global write is locked, false otherwise
   */
  public static Locked() {
    const store = new Store("agent");
    const name = `agent-lock-global-write`; // the global lock for write
    return store.Get(name) === 1;
  }

  /**
   * Run an action with the global write lock
   * @param fn function to run
   * @param maxWait Maximum wait time in milliseconds
   * @returns
   */
  public RunWithLock(fn: () => any, maxWait = 1000) {
    const start = Date.now();
    while (AgentStore.Locked()) {
      if (Date.now() - start > maxWait) {
        throw new Exception("Global write is locked", 429);
      }
      time.Sleep(100);
    }

    AgentStore.Lock();
    try {
      AgentStore.Unlock();
      return fn();
    } catch (error) {
      AgentStore.Unlock();
      throw error;
    }
  }

  /**
   * Get a value from the store
   * @param key
   * @returns
   */
  public Get(key: string) {
    const name = `${this.prefix}-${this.chat_id}-${this.assistant_id}-${key}`;
    return this.store.Get(name);
  }

  /**
   * Set a value in the store
   * @param key
   * @param value
   */
  public Set(key: string, value: any) {
    const name = `${this.prefix}-${this.chat_id}-${this.assistant_id}-${key}`;
    this.store.Set(name, value);
  }

  /**
   * Delete a value from the store
   * @param key
   */
  public Del(key: string) {
    const name = `${this.prefix}-${this.chat_id}-${this.assistant_id}-${key}`;
    this.store.Del(name);
  }

  /**
   * Get the assistant ID
   * @returns Assistant ID
   */
  public AssistantID() {
    return this.assistant_id;
  }

  /**
   * Get the chat ID
   * @returns Chat ID
   */
  public ChatID() {
    return this.chat_id;
  }

  /**
   * Try an action
   * @param times
   * @param input
   * @param fn
   * @returns
   */
  public ntry(times: number, input: agent.Input, fn: () => any): Ntry {
    const ntry = new Ntry(times, input, fn).Bind(this);
    return ntry;
  }
}

/**
 * Chat Store Manager
 */
export class ChatStore implements BaseStore {
  private chat_id: string;
  private store: Store;
  private readonly prefix: string = "chat";

  constructor(chat_id: string) {
    this.chat_id = chat_id;
    this.store = new Store("agent");
  }

  /**
   * Lock the global write
   */
  public static Lock() {
    return AgentStore.Lock();
  }

  /**
   * Unlock the global write
   */
  public static Unlock() {
    AgentStore.Unlock();
  }

  /**
   * Check if the global write is locked
   * @returns true if the global write is locked, false otherwise
   */
  public static Locked() {
    return AgentStore.Locked();
  }

  /**
   * Run an action with the global write lock
   * @param fn function to run
   * @param maxWait Maximum wait time in milliseconds
   * @returns
   */
  public RunWithLock(fn: () => any, maxWait = 1000) {
    const start = Date.now();
    while (AgentStore.Locked()) {
      if (Date.now() - start > maxWait) {
        throw new Exception("Global write is locked", 429);
      }
      time.Sleep(100);
    }

    AgentStore.Lock();
    try {
      AgentStore.Unlock();
      return fn();
    } catch (error) {
      AgentStore.Unlock();
      throw error;
    }
  }

  /**
   * Get a value from the store
   * @param key
   * @returns
   */
  public Get(key: string) {
    const name = `${this.prefix}-${this.chat_id}-${key}`;
    return this.store.Get(name);
  }

  /**
   * Set a value in the store
   * @param key
   * @param value
   */
  public Set(key: string, value: any) {
    const name = `${this.prefix}-${this.chat_id}-${key}`;
    this.store.Set(name, value);
  }

  /**
   * Delete a value from the store
   * @param key
   */
  public Del(key: string) {
    const name = `${this.prefix}-${this.chat_id}-${key}`;
    this.store.Del(name);
  }

  /**
   * Get the chat ID
   * @returns Chat ID
   */
  public ChatID() {
    return this.chat_id;
  }

  /**
   * Placeholder for AssistantID to satisfy BaseStore interface
   * @returns empty string
   */
  public AssistantID() {
    return "";
  }

  /**
   * Try an action
   * @param times
   * @param input
   * @param fn
   * @returns
   */
  public ntry(times: number, input: agent.Input, fn: () => any): Ntry {
    const ntry = new Ntry(times, input, fn).Bind(this);
    return ntry;
  }
}
