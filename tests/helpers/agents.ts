import * as v1 from "@agentclientprotocol/sdk";
import * as v2 from "@agentclientprotocol/sdk/experimental/v2";
import type {
  AcpConnector,
  AcpProtocolVersion,
  AcpWireStream,
  ContentBlock,
} from "../../src/core/index.js";

interface AppLike {
  connect(stream: never): {
    close(error?: unknown): void;
    closed: Promise<void>;
  };
}

export interface FakeAgentHarness {
  readonly connector: AcpConnector;
  readonly attempts: readonly {
    protocol: AcpProtocolVersion;
    attempt: number;
  }[];
  readonly prompts: readonly {
    sessionId: string;
    prompt: readonly ContentBlock[];
  }[];
  readonly permissionResponses: readonly unknown[];
  readonly elicitationResponses: readonly unknown[];
  readonly listSessionCursors: readonly (string | undefined)[];
  readonly modeUpdates: readonly { sessionId: string; value: string }[];
  readonly configUpdates: readonly {
    sessionId: string;
    id: string;
    value: string | boolean;
  }[];
  readonly newSessionRequests: number;
  readonly loadSessionRequests: number;
  readonly closedConnections: number;
  readonly abortedAttempts: number;
  requestStandaloneElicitation(): Promise<unknown>;
  disconnect(): Promise<void>;
  close(): Promise<void>;
}

export interface FakeAgentHarnessOptions {
  readonly afterThoughtDelayMs?: number | undefined;
  readonly afterSubagentDelayMs?: number | undefined;
  readonly beforeInitialize?: (() => Promise<void>) | undefined;
  readonly beforeNewSession?: ((ordinal: number) => Promise<void>) | undefined;
  readonly beforeListSessions?:
    ((ordinal: number) => Promise<void>) | undefined;
  readonly beforeLoadSession?:
    ((sessionId: string) => Promise<void>) | undefined;
  readonly beforeCloseSession?:
    ((sessionId: string) => Promise<void>) | undefined;
  readonly beforePromptAck?: (() => Promise<void>) | undefined;
  readonly permissionSessionId?: string | undefined;
  readonly beforeElicitationComplete?: (() => Promise<void>) | undefined;
  readonly loadOnly?: boolean | undefined;
  readonly noSessionReopen?: boolean | undefined;
  readonly idleBeforePromptAck?: boolean | undefined;
  readonly omitIdleAfterPrompt?: boolean | undefined;
  readonly cancelWithoutIdle?: boolean | undefined;
  readonly cancelIdleDelayMs?: number | undefined;
  readonly authenticationRequired?: boolean | undefined;
  readonly authenticationFailure?: boolean | undefined;
  readonly closeSessionFailure?: boolean | undefined;
  readonly logoutFailure?: boolean | undefined;
  readonly paginatedSessions?: boolean | undefined;
  readonly modeOnlySessionOrdinals?: readonly number[] | undefined;
  readonly usage?: { readonly used: number; readonly size: number } | undefined;
}

export function createV1Harness(
  options: FakeAgentHarnessOptions = {},
): FakeAgentHarness {
  const prompts: { sessionId: string; prompt: readonly ContentBlock[] }[] = [];
  const permissionResponses: unknown[] = [];
  const elicitationResponses: unknown[] = [];
  const listSessionCursors: (string | undefined)[] = [];
  const modeUpdates: { sessionId: string; value: string }[] = [];
  const configUpdates: {
    sessionId: string;
    id: string;
    value: string | boolean;
  }[] = [];
  const sessions = new Map<
    string,
    {
      cwd: string;
      title: string;
      prompts: ContentBlock[][];
      replayText?: string | undefined;
    }
  >();
  let sessionCounter = 0;
  let newSessionRequests = 0;
  let loadSessionRequests = 0;
  let authenticated = !options.authenticationRequired;
  let standaloneElicitation: (() => Promise<unknown>) | undefined;
  const app = v1
    .agent({ name: "pretty-aui-test-v1" })
    .onRequest(v1.methods.agent.initialize, async () => {
      await options.beforeInitialize?.();
      return {
        protocolVersion: 1,
        agentInfo: {
          name: "fixture-agent",
          title: "Fixture Agent",
          version: "1.0.0",
        },
        agentCapabilities: {
          loadSession: !options.noSessionReopen,
          promptCapabilities: {
            image: true,
            audio: true,
            embeddedContext: true,
          },
          mcpCapabilities: { http: true, sse: true },
          sessionCapabilities: {
            list: {},
            delete: {},
            ...(options.loadOnly || options.noSessionReopen
              ? {}
              : { resume: {} }),
            close: {},
            additionalDirectories: {},
          },
        },
        ...(options.authenticationRequired
          ? { authMethods: [{ id: "login", name: "Sign in" }] }
          : {}),
      };
    })
    .onRequest(v1.methods.agent.session.new, async ({ params, client }) => {
      newSessionRequests += 1;
      await options.beforeNewSession?.(newSessionRequests);
      if (!authenticated)
        throw new v1.RequestError(-32000, "Fixture credentials are needed");
      const sessionId = `v1-session-${++sessionCounter}`;
      sessions.set(sessionId, {
        cwd: params.cwd,
        title: `Conversation ${sessionCounter}`,
        prompts: [],
      });
      standaloneElicitation = () =>
        client.request(v1.methods.client.elicitation.create, {
          sessionId,
          mode: "url",
          message: "Finish the standalone request",
          elicitationId: `standalone-${sessionId}`,
          url: "https://example.com/finish",
        });
      const modeOnly =
        options.modeOnlySessionOrdinals?.includes(sessionCounter);
      return {
        sessionId,
        ...(modeOnly
          ? {
              modes: {
                currentModeId: "balanced",
                availableModes: [
                  { id: "fast", name: "Fast" },
                  { id: "balanced", name: "Balanced" },
                ],
              },
            }
          : {
              configOptions: [
                {
                  id: "model",
                  name: "Model",
                  type: "select" as const,
                  currentValue: "balanced",
                  options: [
                    { value: "fast", name: "Fast" },
                    { value: "balanced", name: "Balanced" },
                  ],
                },
              ],
            }),
      };
    })
    .onRequest(v1.methods.agent.authenticate, () => {
      if (options.authenticationFailure) {
        throw v1.RequestError.internalError(
          undefined,
          "Fixture authentication failed",
        );
      }
      authenticated = true;
      return {};
    })
    .onRequest(v1.methods.agent.logout, () => {
      if (options.logoutFailure) {
        throw v1.RequestError.internalError(undefined, "Fixture logout failed");
      }
      return {};
    })
    .onRequest(v1.methods.agent.session.list, async ({ params }) => {
      listSessionCursors.push(params.cursor ?? undefined);
      await options.beforeListSessions?.(listSessionCursors.length);
      if (options.paginatedSessions) {
        const cwd = params.cwd ?? "/workspace";
        return params.cursor === "page-2"
          ? {
              sessions: [
                { sessionId: "listed-1", cwd },
                { sessionId: "listed-2", cwd },
              ],
            }
          : {
              sessions: [{ sessionId: "listed-1", cwd }],
              nextCursor: "page-2",
            };
      }
      return {
        sessions: [...sessions]
          .filter(([, session]) => !params.cwd || session.cwd === params.cwd)
          .map(([sessionId, session]) => ({
            sessionId,
            cwd: session.cwd,
            title: session.title,
            updatedAt: "2026-08-24T12:00:00Z",
          })),
      };
    })
    .onRequest(v1.methods.agent.session.load, async ({ params, client }) => {
      loadSessionRequests += 1;
      await options.beforeLoadSession?.(params.sessionId);
      const stored = sessions.get(params.sessionId);
      if (stored) {
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "session_info_update",
            title: stored.title,
          },
        });
      }
      for (const [promptIndex, prompt] of (stored?.prompts ?? []).entries()) {
        for (const content of prompt) {
          await client.notify(v1.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "user_message_chunk",
              messageId: `replay-user-${promptIndex}`,
              content,
            },
          });
        }
      }
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "agent_message_chunk",
          messageId: "replay",
          content: {
            type: "text",
            text: stored?.replayText ?? "Replayed history",
          },
        },
      });
      return {
        configOptions: [
          {
            id: "model",
            name: "Model",
            type: "select" as const,
            currentValue: "loaded",
            options: [{ value: "loaded", name: "Loaded" }],
          },
        ],
      };
    })
    .onRequest(v1.methods.agent.session.resume, () => ({}))
    .onRequest(v1.methods.agent.session.close, async ({ params }) => {
      await options.beforeCloseSession?.(params.sessionId);
      if (options.closeSessionFailure) {
        throw v1.RequestError.internalError(
          undefined,
          "Fixture session close failed",
        );
      }
    })
    .onRequest(v1.methods.agent.session.delete, ({ params }) => {
      sessions.delete(params.sessionId);
    })
    .onRequest(v1.methods.agent.session.setMode, ({ params }) => {
      modeUpdates.push({ sessionId: params.sessionId, value: params.modeId });
      return {};
    })
    .onRequest(v1.methods.agent.session.setConfigOption, ({ params }) => {
      configUpdates.push({
        sessionId: params.sessionId,
        id: params.configId,
        value: params.value,
      });
      return {
        configOptions: [
          {
            id: params.configId,
            name: "Model",
            type: "select" as const,
            currentValue: String(params.value),
            options: [
              { value: String(params.value), name: String(params.value) },
            ],
          },
        ],
      };
    })
    .onRequest(v1.methods.agent.session.prompt, async ({ params, client }) => {
      const prompt = params.prompt as ContentBlock[];
      prompts.push({
        sessionId: params.sessionId,
        prompt,
      });
      const session = sessions.get(params.sessionId);
      session?.prompts.push([...prompt]);
      if (session) {
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "session_info_update",
            title: session.title,
          },
        });
      }
      if (options.usage) {
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "usage_update",
            used: options.usage.used,
            size: options.usage.size,
          },
        });
      }
      const text = promptText(params.prompt);
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "available_commands_update",
          availableCommands: [
            {
              name: "review",
              description: "Review the current page",
              input: { hint: "focus" },
            },
          ],
        },
      });
      if (text.includes("subagent")) {
        const childSessionId = `${params.sessionId}-child`;
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "tool_call",
            toolCallId: "task-1",
            title: "Inspect the client packages",
            kind: "think",
            status: "in_progress",
            rawInput: {
              description: "Inspect the client packages",
              prompt: "Inspect the client package and report its structure.",
              subagent_type: "explore",
            },
          },
        });
        if (options.afterSubagentDelayMs) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.afterSubagentDelayMs),
          );
        }
        sessions.set(childSessionId, {
          cwd: session?.cwd ?? "/workspace",
          title: "Explore client package architecture and ownership",
          prompts: [],
          replayText:
            "Child agent inspected the client package and reported its structure.",
        });
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "tool_call_update",
            toolCallId: "task-1",
            status: "completed",
            rawOutput: {
              output: "Exploration complete",
              metadata: {
                sessionId: childSessionId,
                background: false,
              },
            },
          },
        });
      }
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "agent_thought_chunk",
          messageId: "response-1",
          content: {
            type: "text",
            text: text.includes("streaming tail")
              ? "Opening context\n"
              : "Checking the request ",
          },
        },
      });
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "agent_thought_chunk",
          messageId: "response-1",
          content: {
            type: "text",
            text: text.includes("streaming tail")
              ? "The newest live reasoning fragment stays visible at the trailing edge while more tokens arrive, keeping the live tail anchored without wrapping or replacing the expanded reasoning body."
              : "against the workspace.",
          },
        },
      });
      if (options.afterThoughtDelayMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, options.afterThoughtDelayMs),
        );
      }
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "plan",
          entries: [
            {
              content: "Inspect context",
              priority: "high",
              status: "completed",
            },
            {
              content: "Prepare response",
              priority: "medium",
              status: "in_progress",
            },
          ],
        },
      });
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "tool_call",
          toolCallId: "tool-1",
          title: "Read project notes",
          kind: "read",
          status: "in_progress",
        },
      });
      if (text.includes("permission")) {
        permissionResponses.push(
          await client.request(v1.methods.client.session.requestPermission, {
            sessionId: options.permissionSessionId ?? params.sessionId,
            toolCall: { toolCallId: "tool-1", title: "Read project notes" },
            options: [
              {
                optionId: "allow-once",
                name: "Allow once",
                kind: "allow_once",
              },
              {
                optionId: "reject-once",
                name: "Reject",
                kind: "reject_once",
              },
            ],
          }),
        );
      }
      if (text.includes("url elicitation")) {
        const response = client.request(v1.methods.client.elicitation.create, {
          sessionId: params.sessionId,
          mode: "url",
          message: "Finish in the browser",
          elicitationId: "agent-url-1",
          url: "https://example.com/finish",
        });
        await options.beforeElicitationComplete?.();
        await client.notify(v1.methods.client.elicitation.complete, {
          elicitationId: "agent-url-1",
        });
        elicitationResponses.push(await response);
      }
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "tool_call_update",
          toolCallId: "tool-1",
          status: "completed",
          content: [
            {
              type: "content",
              content: { type: "text", text: "Found 3 relevant notes." },
            },
          ],
        },
      });
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "agent_message_chunk",
          messageId: "response-1",
          content: {
            type: "text",
            text: text.includes("xss")
              ? "Safe <img src=x onerror=alert(1)> "
              : "## Ready\n\n",
          },
        },
      });
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "agent_message_chunk",
          messageId: "response-1",
          content: {
            type: "text",
            text: text.includes("xss")
              ? "**answer**"
              : "The fixture agent completed the request.",
          },
        },
      });
      return { stopReason: "end_turn" };
    })
    .onNotification(v1.methods.agent.session.cancel, () => undefined);
  return harnessFor(app as unknown as AppLike, prompts, {
    permissionResponses,
    elicitationResponses,
    listSessionCursors,
    modeUpdates,
    configUpdates,
    get newSessionRequests() {
      return newSessionRequests;
    },
    get loadSessionRequests() {
      return loadSessionRequests;
    },
    requestStandaloneElicitation: () => {
      if (!standaloneElicitation)
        throw new Error("No active fixture session for elicitation");
      return standaloneElicitation();
    },
  });
}

export function createV2Harness(
  delay = 20,
  options: Pick<
    FakeAgentHarnessOptions,
    | "beforeElicitationComplete"
    | "beforeListSessions"
    | "beforePromptAck"
    | "cancelIdleDelayMs"
    | "cancelWithoutIdle"
    | "idleBeforePromptAck"
    | "omitIdleAfterPrompt"
    | "paginatedSessions"
  > = {},
): FakeAgentHarness {
  const prompts: { sessionId: string; prompt: readonly ContentBlock[] }[] = [];
  const elicitationResponses: unknown[] = [];
  const listSessionCursors: (string | undefined)[] = [];
  const sessions = new Map<string, { cwd: v2.AbsolutePath }>();
  let sessionCounter = 0;
  const app = v2
    .agent({ name: "pretty-aui-test-v2" })
    .onRequest(v2.methods.agent.initialize, () => ({
      protocolVersion: 2,
      info: { name: "fixture-v2", title: "Fixture Agent v2", version: "2.0.0" },
      capabilities: {
        session: {
          delete: {},
          additionalDirectories: {},
          prompt: { image: {}, audio: {}, embeddedContext: {} },
          mcp: { stdio: {}, http: {} },
        },
      },
    }))
    .onRequest(v2.methods.agent.auth.logout, () => undefined)
    .onRequest(v2.methods.agent.session.new, ({ params }) => {
      const sessionId = `v2-session-${++sessionCounter}`;
      sessions.set(sessionId, { cwd: params.cwd });
      return { sessionId };
    })
    .onRequest(v2.methods.agent.session.list, async ({ params }) => {
      listSessionCursors.push(params.cursor ?? undefined);
      await options.beforeListSessions?.(listSessionCursors.length);
      if (options.paginatedSessions) {
        const cwd = params.cwd ?? ("/workspace" as v2.AbsolutePath);
        return params.cursor === "page-2"
          ? {
              sessions: [
                { sessionId: "listed-1", cwd },
                { sessionId: "listed-2", cwd },
              ],
            }
          : {
              sessions: [{ sessionId: "listed-1", cwd }],
              nextCursor: "page-2",
            };
      }
      return {
        sessions: [...sessions]
          .filter(([, session]) => !params.cwd || session.cwd === params.cwd)
          .map(([sessionId, session]) => ({ sessionId, cwd: session.cwd })),
      };
    })
    .onRequest(v2.methods.agent.session.resume, async ({ params, client }) => {
      if (params.replayFrom?.type === "start") {
        await client.notify(v2.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "agent_message",
            messageId: "replay-v2",
            content: [{ type: "text", text: "V2 replay" }],
          },
        });
      }
      return {};
    })
    .onRequest(v2.methods.agent.session.close, () => undefined)
    .onRequest(v2.methods.agent.session.delete, ({ params }) => {
      sessions.delete(params.sessionId);
    })
    .onRequest(v2.methods.agent.session.setConfigOption, ({ params }) => ({
      configOptions: [
        {
          configId: params.configId,
          name: "Option",
          type: params.type,
          currentValue: params.value,
        } as never,
      ],
    }))
    .onRequest(v2.methods.agent.session.prompt, async ({ params, client }) => {
      prompts.push({
        sessionId: params.sessionId,
        prompt: params.prompt as ContentBlock[],
      });
      await options.beforePromptAck?.();
      const text = promptText(params.prompt);
      if (text.includes("url elicitation")) {
        const response = client.request(v2.methods.client.elicitation.create, {
          sessionId: params.sessionId,
          mode: "url",
          message: "Finish in the browser",
          elicitationId: "agent-url-v2",
          url: "https://example.com/finish",
        });
        await options.beforeElicitationComplete?.();
        await client.notify(v2.methods.client.elicitation.complete, {
          elicitationId: "agent-url-v2",
        });
        elicitationResponses.push(await response);
      }
      if (options.idleBeforePromptAck) {
        await client.notify(v2.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "state_update",
            state: "idle",
            stopReason: "end_turn",
          },
        });
        return;
      }
      setTimeout(() => {
        void (async () => {
          await client.notify(v2.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "user_message",
              messageId: "canonical-user",
              content: params.prompt,
            },
          });
          await client.notify(v2.methods.client.session.update, {
            sessionId: params.sessionId,
            update: { sessionUpdate: "state_update", state: "running" },
          });
          await client.notify(v2.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "agent_message",
              messageId: "answer-v2",
              content: [{ type: "text", text: "Draft" }],
            },
          });
          await client.notify(v2.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "agent_message",
              messageId: "answer-v2",
              content: [{ type: "text", text: "Final" }],
            },
          });
          await client.notify(v2.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "agent_message_chunk",
              messageId: "answer-v2",
              content: { type: "text", text: " answer" },
            },
          });
          if (!options.omitIdleAfterPrompt) {
            await client.notify(v2.methods.client.session.update, {
              sessionId: params.sessionId,
              update: {
                sessionUpdate: "state_update",
                state: "idle",
                stopReason: "end_turn",
              },
            });
          }
        })();
      }, delay);
    })
    .onNotification(v2.methods.agent.session.cancel, ({ params, client }) => {
      if (options.cancelWithoutIdle) return;
      const notifyIdle = () =>
        client.notify(v2.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "state_update",
            state: "idle",
            stopReason: "cancelled",
          },
        });
      if (options.cancelIdleDelayMs !== undefined) {
        setTimeout(() => void notifyIdle(), options.cancelIdleDelayMs);
      } else {
        void notifyIdle();
      }
    });
  return harnessFor(app as unknown as AppLike, prompts, {
    elicitationResponses,
    listSessionCursors,
  });
}

function harnessFor(
  app: AppLike,
  prompts: { sessionId: string; prompt: readonly ContentBlock[] }[],
  observations: {
    readonly permissionResponses?: readonly unknown[];
    readonly elicitationResponses?: readonly unknown[];
    readonly listSessionCursors?: readonly (string | undefined)[];
    readonly modeUpdates?: readonly { sessionId: string; value: string }[];
    readonly configUpdates?: readonly {
      sessionId: string;
      id: string;
      value: string | boolean;
    }[];
    readonly newSessionRequests?: number;
    readonly loadSessionRequests?: number;
    readonly requestStandaloneElicitation?:
      (() => Promise<unknown>) | undefined;
  } = {},
): FakeAgentHarness {
  const attempts: { protocol: AcpProtocolVersion; attempt: number }[] = [];
  const connections: { close(error?: unknown): void; closed: Promise<void> }[] =
    [];
  const remoteWritables: WritableStream<unknown>[] = [];
  let closedConnections = 0;
  let abortedAttempts = 0;
  return {
    connector: {
      open({ protocol, attempt, signal }) {
        attempts.push({ protocol, attempt });
        signal.addEventListener(
          "abort",
          () => {
            abortedAttempts += 1;
          },
          { once: true },
        );
        const streams = streamPair();
        remoteWritables.push(streams.agent.writable);
        const connection = app.connect(streams.agent as never);
        connections.push(connection);
        void connection.closed.finally(() => {
          closedConnections += 1;
        });
        return streams.client;
      },
    },
    attempts,
    prompts,
    get permissionResponses() {
      return observations.permissionResponses ?? [];
    },
    get elicitationResponses() {
      return observations.elicitationResponses ?? [];
    },
    get listSessionCursors() {
      return observations.listSessionCursors ?? [];
    },
    get modeUpdates() {
      return observations.modeUpdates ?? [];
    },
    get configUpdates() {
      return observations.configUpdates ?? [];
    },
    get newSessionRequests() {
      return observations.newSessionRequests ?? 0;
    },
    get loadSessionRequests() {
      return observations.loadSessionRequests ?? 0;
    },
    get closedConnections() {
      return closedConnections;
    },
    get abortedAttempts() {
      return abortedAttempts;
    },
    requestStandaloneElicitation() {
      if (!observations.requestStandaloneElicitation)
        return Promise.reject(
          new Error("Fixture does not support standalone elicitations"),
        );
      return observations.requestStandaloneElicitation();
    },
    async disconnect() {
      await Promise.all(
        remoteWritables.map(async (writable) => {
          const writer = writable.getWriter();
          try {
            await writer.close();
          } finally {
            writer.releaseLock();
          }
        }),
      );
    },
    async close() {
      for (const connection of connections) connection.close();
      await Promise.allSettled(
        connections.map((connection) => connection.closed),
      );
    },
  };
}

function streamPair(): { client: AcpWireStream; agent: AcpWireStream } {
  const clientToAgent = new TransformStream<unknown, unknown>();
  const agentToClient = new TransformStream<unknown, unknown>();
  return {
    client: {
      writable: clientToAgent.writable,
      readable: agentToClient.readable,
    },
    agent: {
      writable: agentToClient.writable,
      readable: clientToAgent.readable,
    },
  };
}

function promptText(
  blocks: readonly { type: string; [key: string]: unknown }[],
): string {
  return blocks
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n");
}
