import { Trigger } from "../trigger";
import { Action } from "../action";

export interface Event {
  id: string;
  trigger: Trigger;
  action: Action;
}
