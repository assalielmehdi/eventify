import { EventServer } from "../server";
import { ActionService } from "../action";
import { CronTrigger, HttpTrigger, ActionTrigger, Trigger } from "./model";

export class TriggerService {
  private actionService: ActionService;
  private eventServer: EventServer;

  constructor(actionService: ActionService, eventServer: EventServer) {
    this.actionService = actionService;
    this.eventServer = eventServer;
  }

  validate(trigger: Trigger): boolean {
    if (this.isCronTrigger(trigger)) {
      const cronRegex =
        /^(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})$/gi;
      return cronRegex.test(trigger.expression);
    }

    if (this.isHttpTrigger(trigger)) {
      /** - Starts with an alphanum
       *  - Ends with an alphanum
       *  - Contains only alphanum or dash
       */
      const endpointRegex = /^([a-z0-9]+|[a-z0-9][a-z0-9\-]*[a-z0-9])$/gi;
      return endpointRegex.test(trigger.endpoint);
    }

    if (this.isActionTrigger(trigger)) {
      return this.actionService.has(trigger.caller);
    }

    return true;
  }

  subscribe(trigger: Trigger): void {
    if (this.isCronTrigger(trigger)) {
      // TODO
    }

    if (this.isHttpTrigger(trigger)) {
      this.eventServer.add(trigger.endpoint);
    }

    if (this.isActionTrigger(trigger)) {
      this.actionService.subscribe(trigger.caller, trigger.actionName);
    }
  }

  private isCronTrigger(trigger: Trigger): trigger is CronTrigger {
    return trigger._kind === "cron";
  }

  private isHttpTrigger(trigger: Trigger): trigger is HttpTrigger {
    return trigger._kind === "http";
  }

  private isActionTrigger(trigger: Trigger): trigger is ActionTrigger {
    return trigger._kind === "action";
  }
}
