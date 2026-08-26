import { spawn } from "node:child_process";
import { Readable, Writable } from "node:stream";
import { ndJsonStream } from "@agentclientprotocol/sdk";
import { createChat } from "../dist/core/index.js";

const cwd = process.env.PRETTY_AUI_LIVE_CWD ?? process.cwd();
const executable = process.env.PRETTY_AUI_OPENCODE ?? "opencode";
const requestedModel = process.env.PRETTY_AUI_LIVE_MODEL;
const inspectOnly = process.env.PRETTY_AUI_LIVE_INSPECT === "1";
const marker = "PRETTY_AUI_LIVE_OK";
let child;
let controller;
let stderr = "";
const events = [];

try {
  controller = createChat({
    protocol: 1,
    session: { cwd },
    clientInfo: { name: "pretty-aui-live-check", version: "0.1.0" },
    onEvent(event) {
      events.push(event);
    },
    connector: {
      open({ signal }) {
        child = spawn(executable, ["acp", "--pure", "--cwd", cwd], {
          cwd,
          stdio: ["pipe", "pipe", "pipe"],
        });
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", (chunk) => {
          stderr = (stderr + chunk).slice(-8_000);
        });
        signal.addEventListener("abort", () => child?.kill("SIGTERM"), {
          once: true,
        });
        return ndJsonStream(
          Writable.toWeb(child.stdin),
          Readable.toWeb(child.stdout),
        );
      },
    },
  });

  await withTimeout(controller.ready, 30_000, "OpenCode ACP initialization");
  const ready = controller.getSnapshot();
  if (
    ready.phase !== "idle" ||
    ready.protocolVersion !== 1 ||
    !ready.sessionId
  ) {
    throw new Error(
      `OpenCode ACP did not create a ready v1 session: ${JSON.stringify(ready)}`,
    );
  }
  if (inspectOnly) {
    console.log(
      JSON.stringify(
        {
          agent: ready.agentName,
          protocol: ready.protocolVersion,
          sessionId: ready.sessionId,
          configOptions: ready.configOptions,
        },
        null,
        2,
      ),
    );
    process.exitCode = 0;
  } else {
    if (requestedModel) {
      const modelOption = ready.configOptions.find(
        (option) => option.id === "model",
      );
      if (!modelOption)
        throw new Error("OpenCode ACP did not expose a model config option");
      await controller.setConfigOption(modelOption.id, requestedModel);
    }

    const result = await withTimeout(
      controller.send(
        `Reply with exactly ${marker} and nothing else. Do not use tools.`,
      ).done,
      180_000,
      "OpenCode ACP prompt",
    );
    const response = controller
      .getSnapshot()
      .activities.filter(
        (activity) =>
          activity.type === "message" && activity.role === "assistant",
      )
      .flatMap((activity) => activity.content)
      .filter(
        (block) => block.type === "text" && typeof block.text === "string",
      )
      .map((block) => block.text)
      .join("");
    if (!response.includes(marker)) {
      throw new Error(
        `OpenCode ACP response did not contain ${marker}: ${JSON.stringify(
          {
            response: response.slice(0, 500),
            stopReason: result.stopReason,
            snapshot: controller.getSnapshot(),
            events: events.slice(-30),
          },
          null,
          2,
        )}`,
      );
    }
    console.log(
      JSON.stringify(
        {
          agent: ready.agentName,
          protocol: ready.protocolVersion,
          sessionId: ready.sessionId,
          stopReason: result.stopReason,
          response,
        },
        null,
        2,
      ),
    );
  }
} catch (error) {
  if (stderr.trim()) console.error(stderr.trim());
  if (controller) {
    const snapshot = controller.getSnapshot();
    console.error(
      JSON.stringify(
        {
          phase: snapshot.phase,
          protocolVersion: snapshot.protocolVersion,
          agentName: snapshot.agentName,
          sessionId: snapshot.sessionId,
          activities: snapshot.activities,
          selectedConfig: snapshot.configOptions.map((option) => ({
            id: option.id,
            value: option.currentValue,
          })),
          error: snapshot.error,
        },
        null,
        2,
      ),
    );
  }
  throw error;
} finally {
  child?.kill("SIGTERM");
  await controller?.destroy().catch(() => undefined);
}

function withTimeout(promise, milliseconds, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${label} timed out after ${milliseconds}ms`)),
        milliseconds,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}
