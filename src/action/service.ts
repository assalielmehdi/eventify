import { fetch } from "undici";
import {
  Action,
  HttpRequestAction,
  HttpResponseAction,
  TriggerAction,
} from "./model";

export class ActionService {
  private actions: Map<string, Action>;
  private notifications: Map<string, () => Promise<void>>;

  constructor() {
    this.actions = new Map();
    this.notifications = new Map();
  }

  register(action: Action): void {
    this.actions.set(action.name, action);
  }

  has(actionName: string): boolean {
    return this.actions.has(actionName);
  }

  /**
   * When the action w/ callerActionName is finished,
   * the acion w/ calledActionName is called.
   */
  subscribe(callerActionName: string, calledActionName: string): void {
    if (!this.notifications.has(callerActionName)) {
      this.notifications.set(callerActionName, async () => {
        await this.execute(calledActionName);
      });
    }
  }

  async execute(actionName: string): Promise<void> {
    if (this.has(actionName)) {
      const action = this.actions.get(actionName) as Action;

      if (this.isHttpRequestAction(action)) {
        await fetch(action.url, {
          method: action.method,
          body: action.payload,
        });
      }

      if (this.isHttpResponseAction(action)) {
        // TODO
      }

      if (this.isTriggerAction(action)) {
        // TODO
      }

      this.notify(actionName);
    }
  }

  private async notify(actionName: string): Promise<void> {
    if (this.notifications.has(actionName)) {
      await this.notifications.get(actionName)!();
    }
  }

  clean(): void {
    this.actions = new Map();
    this.notifications = new Map();
  }

  private isHttpRequestAction(action: Action): action is HttpRequestAction {
    return action._kind === "request";
  }

  private isHttpResponseAction(action: Action): action is HttpResponseAction {
    return action._kind === "response";
  }

  private isTriggerAction(action: Action): action is TriggerAction {
    return action._kind === "trigger";
  }
}
