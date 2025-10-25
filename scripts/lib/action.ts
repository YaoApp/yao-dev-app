/**
 * Action Utils
 */

import { agent } from "@yao/runtime";

export declare interface ButtonProps {
  title: string;
  icon: string;
  style: "danger" | "primary" | "secondary" | "success" | "warning" | "info";
  namespace: string;
  primary: string;
  action: agent.Action[];
}

export class Action {
  context: agent.Context;
  actions: agent.Action[];

  /**
   * Constructor
   * @param context
   */
  constructor(context: agent.Context) {
    this.context = context;
    this.actions = [];
  }

  /**
   * Open a sidebar
   * @param url - The url of the sidebar
   * @param props - The props of the sidebar
   * @returns
   */
  OpenSidebar(url: string, props?: OpenSidebar): Action {
    const params: OpenSidebarParams = { path: url };
    if (props) {
      params.title = props.title;
      params.url = url;
      delete params.path;
    }

    const action = {
      name: "OpenSidebar",
      type: "Common.emitEvent",
      payload: { key: "app/openSidebar", value: params },
    };
    this.actions.push(action);
    return this;
  }

  /**
   * Confirm
   * @param title - The title of the confirm dialog
   * @param content - The content of the confirm dialog
   * @returns
   */
  Confirm(title: string, content: string) {
    const action = {
      name: "Confirm",
      type: "Common.confirm",
      payload: { title, content },
    };
    this.actions.push(action);
    return this;
  }

  /**
   * Execute a method
   * @param method - The method to execute
   * @param args - The arguments to pass to the method
   * @returns
   */
  Execute(method: string, args?: any[]) {
    const action = {
      name: "Execute",
      type: "Common.emitEvent",
      payload: { key: "app/neoExecute", value: { method, args: args || [] } },
    };
    this.actions.push(action);
    return this;
  }

  /**
   * Refetch the data
   * @param payload - The payload of the refetch
   * @returns
   */
  Refetch(payload?: Record<string, any>) {
    const action = {
      name: "Refetch",
      type: "Common.refetch",
      payload: { ...payload },
    };
    this.actions.push(action);
    return this;
  }

  /**
   * Show a message
   * @param type - The type of the message
   * @param content - The content of the message
   * @returns
   */
  ShowMessage(type: "success" | "error" | "warning" | "info", content: string) {
    const action = {
      name: "ShowMessage",
      type: "Common.showMessage",
      payload: { content, type },
    };
    this.actions.push(action);
    return this;
  }

  /**
   * Get the action props
   * @returns
   */
  Props(): ActionProps {
    return {
      action: this.actions,
      namespace: this.context.namespace,
      primary: "id",
    };
  }

  /**
   * Get the actions
   * @returns
   */
  Actions(): agent.Action[] {
    return this.actions;
  }

  /**
   * Clean the actions
   * @returns
   */
  Clean(): Action {
    this.actions = [];
    return this;
  }
}

declare type OpenSidebar = {
  title: string;
};

declare type OpenSidebarParams = {
  path?: string;
  url?: string;
  title?: string;
};

declare type ActionProps = {
  action: agent.Action[];
  namespace: string;
  primary: string;
};
