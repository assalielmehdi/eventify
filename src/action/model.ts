import { BodyInit } from "undici";
import { HttpMethod } from "undici/types/dispatcher";

export interface HttpRequestAction {
  _kind: "request";
  name: string;
  triggerId: string;
  method: HttpMethod;
  url: string;
  payload?: BodyInit;
}

export interface HttpResponseAction {
  _kind: "response";
  name: string;
  triggerId: string;
  payload: string;
  status: number;
}

export interface TriggerAction {
  _kind: "trigger";
  name: string;
  triggerId: string;
  action: string;
}

export type Action = HttpRequestAction | HttpResponseAction | TriggerAction;
