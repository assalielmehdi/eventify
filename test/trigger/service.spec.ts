import http from "http";
import { test } from "tap";
import { EventServer } from "../../src/server";
import { ActionService, Action } from "../../src/action";
import {
  ActionTrigger,
  CronTrigger,
  HttpTrigger,
  Trigger,
  TriggerService,
} from "../../src/trigger";

test("TriggerService", async (t) => {
  const actionService = new ActionService();
  const eventServer = new EventServer();
  const triggerService = new TriggerService(actionService, eventServer);

  t.test("validate()", async (t) => {
    t.test("validate cron trigger", async (t) => {
      t.test("should be valid", async (t) => {
        const trigger: CronTrigger = {
          _kind: "cron",
          id: "id",
          actionName: "actionName",
          expression: "0 */30 * * * *",
        };

        const isValid = triggerService.validate(trigger);

        t.ok(isValid);
      });

      t.test("should be valid: with @ symbol", async (t) => {
        const trigger: CronTrigger = {
          _kind: "cron",
          id: "id",
          actionName: "actionName",
          expression: "@yearly",
        };

        const isValid = triggerService.validate(trigger);

        t.ok(isValid);
      });

      t.test("should not be valid", async (t) => {
        const trigger: CronTrigger = {
          _kind: "cron",
          id: "id",
          actionName: "actionName",
          expression: "* * *",
        };

        const isValid = triggerService.validate(trigger);

        t.notOk(isValid);
      });
    });

    t.test("validate http trigger", async (t) => {
      //  [a-z0-9]+|[a-z0-9][a-z0-9\-]*[a-z0-9]
      t.test("should be valid", async (t) => {
        const trigger: HttpTrigger = {
          _kind: "http",
          id: "id",
          actionName: "actionName",
          endpoint: "a-valid-endpoint",
        };

        const isValid = triggerService.validate(trigger);

        t.ok(isValid);
      });

      t.test(
        "should not be valid: doesn't start w/ a an alphanum",
        async (t) => {
          const trigger: HttpTrigger = {
            _kind: "http",
            id: "id",
            actionName: "actionName",
            endpoint: "-not-a-valid-endpoint",
          };

          const isValid = triggerService.validate(trigger);

          t.notOk(isValid);
        }
      );

      t.test("should not be valid: doesn't end w/ a an alphanum", async (t) => {
        const trigger: HttpTrigger = {
          _kind: "http",
          id: "id",
          actionName: "actionName",
          endpoint: "not-a-valid-endpoint-",
        };

        const isValid = triggerService.validate(trigger);

        t.notOk(isValid);
      });

      t.test("should not be valid: contains special characters", async (t) => {
        const trigger: HttpTrigger = {
          _kind: "http",
          id: "id",
          actionName: "actionName",
          endpoint: "not-a-va_lid-endpoint",
        };

        const isValid = triggerService.validate(trigger);

        t.notOk(isValid);
      });
    });

    t.test("validate action trigger", async (t) => {
      t.test("should be valid", async (t) => {
        const actionName: string = "exists-action";
        const action: Action = {
          _kind: "trigger",
          name: actionName,
          triggerId: "triggerId",
          action: "action",
        };

        actionService.register(action);
        t.teardown(() => actionService.clean());

        const trigger: ActionTrigger = {
          _kind: "action",
          id: "id",
          actionName: "actionName",
          caller: actionName,
        };

        const isValid = triggerService.validate(trigger);

        t.ok(isValid);
      });

      t.test("should not be valid", async (t) => {
        const trigger: ActionTrigger = {
          _kind: "action",
          id: "id",
          actionName: "actionName",
          caller: "does-not-exist-action",
        };

        const isValid = triggerService.validate(trigger);

        t.notOk(isValid);
      });
    });
  });

  t.test("subscribe()", async (t) => {
    t.test("subscribe cron trigger", async (t) => {
      // TODO
      t.pass();
    });

    t.test("subscribe http trigger", async (t) => {
      const endpoint = "http-endpoint";

      const trigger: HttpTrigger = {
        _kind: "http",
        id: "id",
        actionName: "actionName",
        endpoint: endpoint,
      };

      triggerService.subscribe(trigger);

      const exists = eventServer.has(endpoint);

      t.ok(exists);
    });

    t.test("subscribe action trigger", async (t) => {
      const endpoint = "endpoint";

      let endpointCalled = false;

      const server = http.createServer((req, res) => {
        if (req.url === `/${endpoint}`) {
          endpointCalled = true;

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end();
        }
      });

      t.teardown(() => {
        server.close();
        actionService.clean();
      });

      server.listen(0, () => {
        const callerAction: Action = {
          _kind: "response",
          name: "caller",
          triggerId: "triggerId",
          payload: "payload",
          status: 200,
        };
        const trigger: ActionTrigger = {
          _kind: "action",
          id: "triggerId",
          actionName: "called",
          caller: "caller",
        };
        const calledAction: Action = {
          _kind: "request",
          name: "called",
          triggerId: "triggerId",
          method: "GET",
          url: `http://localhost:${(server.address() as any).port}/${endpoint}`,
          payload: "payload",
        };

        actionService.register(callerAction);
        actionService.register(calledAction);

        triggerService.subscribe(trigger);

        actionService.execute(callerAction.name);

        t.ok(endpointCalled);
      });
    });
  });
});
