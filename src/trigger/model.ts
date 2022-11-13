export interface CronTrigger {
  _kind: "cron";
  id: string;
  actionName: string;
  expression: string;
}

export interface HttpTrigger {
  _kind: "http";
  id: string;
  actionName: string;
  endpoint: string;
}

export interface ActionTrigger {
  _kind: "action";
  id: string;
  actionName: string;
  caller: string;
}

export type Trigger = CronTrigger | HttpTrigger | ActionTrigger;
