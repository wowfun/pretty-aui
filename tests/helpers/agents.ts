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
  readonly beforeSetConfigOption?: (() => Promise<void>) | undefined;
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
  readonly promptFailure?: boolean | undefined;
  readonly echoUserPromptAsText?: boolean | undefined;
  readonly replayPromptsAsText?: boolean | undefined;
  readonly omitReplayEnvelopeClose?: boolean | undefined;
  readonly omitReplayEnvelope?: boolean | undefined;
  readonly splitReplayTextChunks?: boolean | undefined;
  readonly closeSessionFailure?: boolean | undefined;
  readonly configOptionFailure?: boolean | undefined;
  readonly logoutFailure?: boolean | undefined;
  readonly paginatedSessions?: boolean | undefined;
  readonly listOnlySessionTitles?: boolean | undefined;
  readonly omitSessionTitleOnListOrdinals?: readonly number[] | undefined;
  readonly titleAfterPrompt?: string | undefined;
  readonly availableCommands?: readonly {
    readonly name: string;
    readonly description: string;
  }[];
  readonly modeOnlySessionOrdinals?: readonly number[] | undefined;
  readonly loadedModel?: string | undefined;
  readonly modelConfig?: boolean | undefined;
  readonly modelConfigId?: string | undefined;
  readonly modeConfig?: boolean | undefined;
  readonly modeConfigId?: string | undefined;
  readonly v2ReplayUserContent?: readonly ContentBlock[] | undefined;
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
      title: string | undefined;
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
        title: options.listOnlySessionTitles
          ? undefined
          : `Conversation ${sessionCounter}`,
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
                  { id: "plan", name: "Plan" },
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
            ...(session.title &&
            !options.omitSessionTitleOnListOrdinals?.includes(
              listSessionCursors.length,
            )
              ? { title: session.title }
              : {}),
            updatedAt: "2026-08-24T12:00:00Z",
          })),
      };
    })
    .onRequest(v1.methods.agent.session.load, async ({ params, client }) => {
      loadSessionRequests += 1;
      await options.beforeLoadSession?.(params.sessionId);
      const stored = sessions.get(params.sessionId);
      if (stored?.title && !options.listOnlySessionTitles) {
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
          if (
            (options.omitReplayEnvelope || options.omitReplayEnvelopeClose) &&
            content.type === "text" &&
            typeof content.text === "string" &&
            (content.text.startsWith("\n</pretty-aui-user-message-v1-") ||
              (options.omitReplayEnvelope &&
                content.text.startsWith("\n\n<pretty-aui-user-message-v1-")))
          ) {
            continue;
          }
          const embedded = embeddedResourceText(content);
          const replayContent = options.replayPromptsAsText
            ? content.type === "text" && typeof content.text === "string"
              ? { type: "text" as const, text: content.text }
              : embedded
                ? {
                    type: "text" as const,
                    text: `[${embedded.uri}]\n${embedded.text}`,
                  }
                : content
            : content;
          const replayChunks =
            options.splitReplayTextChunks &&
            replayContent.type === "text" &&
            typeof replayContent.text === "string" &&
            replayContent.text.length > 1
              ? [
                  {
                    type: "text" as const,
                    text: replayContent.text.slice(
                      0,
                      Math.floor(replayContent.text.length / 2),
                    ),
                  },
                  {
                    type: "text" as const,
                    text: replayContent.text.slice(
                      Math.floor(replayContent.text.length / 2),
                    ),
                  },
                ]
              : [replayContent];
          for (const replayChunk of replayChunks) {
            await client.notify(v1.methods.client.session.update, {
              sessionId: params.sessionId,
              update: {
                sessionUpdate: "user_message_chunk",
                messageId: `replay-user-${promptIndex}`,
                content: replayChunk,
              },
            });
          }
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
      const loadedModel = options.loadedModel ?? "loaded";
      return {
        configOptions: [
          {
            id: "model",
            name: "Model",
            type: "select" as const,
            currentValue: loadedModel,
            options: [
              { value: loadedModel, name: loadedModel },
              { value: "fast", name: "Fast" },
              { value: "balanced", name: "Balanced" },
            ],
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
      if (options.configOptionFailure) {
        throw v1.RequestError.internalError(undefined, "Fixture mode failed");
      }
      modeUpdates.push({ sessionId: params.sessionId, value: params.modeId });
      return {};
    })
    .onRequest(v1.methods.agent.session.setConfigOption, async ({ params }) => {
      await options.beforeSetConfigOption?.();
      if (options.configOptionFailure) {
        throw v1.RequestError.internalError(
          undefined,
          "Fixture config option failed",
        );
      }
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
              { value: "fast", name: "Fast" },
              { value: "balanced", name: "Balanced" },
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
        session.title =
          options.titleAfterPrompt ??
          session.title ??
          `Conversation ${params.sessionId.split("-").at(-1)}`;
      }
      if (session && !options.listOnlySessionTitles) {
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
      if (options.echoUserPromptAsText) {
        for (const content of prompt) {
          const embedded = embeddedResourceText(content);
          const echoedText =
            content.type === "text" && typeof content.text === "string"
              ? content.text
              : embedded
                ? `[${embedded.uri}]\n${embedded.text}`
                : "";
          if (!echoedText) continue;
          await client.notify(v1.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "user_message_chunk",
              messageId: "echoed-user",
              content: { type: "text", text: echoedText },
            },
          });
        }
      }
      await client.notify(v1.methods.client.session.update, {
        sessionId: params.sessionId,
        update: {
          sessionUpdate: "available_commands_update",
          availableCommands: options.availableCommands ?? [
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
      if (text.includes("structured tool cards")) {
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "tool_call",
            toolCallId: "execute-card",
            title: "Execute workspace checks",
            kind: "execute",
            status: "in_progress",
            rawInput: {
              command: "printf 'alpha\\nbeta\\n'",
              cwd: "/workspace",
            },
          },
        });
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "tool_call_update",
            toolCallId: "execute-card",
            status: "completed",
            content: [
              {
                type: "content",
                content: { type: "text", text: "alpha\nbeta\n" },
              },
            ],
          },
        });
        await client.notify(v1.methods.client.session.update, {
          sessionId: params.sessionId,
          update: {
            sessionUpdate: "tool_call",
            toolCallId: "diff-card",
            title: "Edit fixture.ts",
            kind: "edit",
            status: "completed",
            content: [
              {
                type: "diff",
                path: "/workspace/fixture.ts",
                oldText: "const state = 'old';",
                newText: "const state = 'new';",
              },
            ],
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
          locations: [{ path: "/workspace/project-notes.md" }],
          rawInput: {
            filePath: "/workspace/project-notes.md",
            offset: 1,
          },
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
              content: {
                type: "text",
                text: "1: Found 3 relevant notes.\n2: Keep contracts upstream.\n3: Preserve bounded payloads.",
              },
            },
          ],
          rawOutput: {
            metadata: {
              display: {
                type: "file",
                text: "Found 3 relevant notes.\nKeep contracts upstream.\nPreserve bounded payloads.",
              },
            },
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
              ? "Safe <img src=x onerror=alert(1)> "
              : text.includes("markdown table")
                ? "| Name | Status | Notes |\n| :--- | :---: | ---: |\n"
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
              : text.includes("markdown table")
                ? "| alpha-component-with-a-long-name | active | 1200 |\n| beta-component-with-a-long-name | queued | 34 |"
                : "The fixture agent completed the request.",
          },
        },
      });
      if (options.promptFailure) {
        throw v1.RequestError.internalError(undefined, "Fixture prompt failed");
      }
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
    | "modelConfig"
    | "modelConfigId"
    | "modeConfig"
    | "modeConfigId"
    | "configOptionFailure"
    | "v2ReplayUserContent"
  > = {},
): FakeAgentHarness {
  const prompts: { sessionId: string; prompt: readonly ContentBlock[] }[] = [];
  const elicitationResponses: unknown[] = [];
  const listSessionCursors: (string | undefined)[] = [];
  const configUpdates: {
    sessionId: string;
    id: string;
    value: string | boolean;
  }[] = [];
  const sessions = new Map<string, { cwd: v2.AbsolutePath }>();
  const configValues = new Map<string, { mode: string; model: string }>();
  let sessionCounter = 0;
  const sessionConfigOptions = (sessionId: string) => {
    const values = configValues.get(sessionId) ?? {
      mode: "build",
      model: "balanced",
    };
    return [
      ...(options.modeConfig
        ? [
            {
              configId: options.modeConfigId ?? "mode",
              name: "Mode",
              category: "mode",
              type: "select",
              currentValue: values.mode,
              options: [
                { value: "plan", name: "Plan" },
                { value: "build", name: "Build" },
              ],
            } as never,
          ]
        : []),
      ...(options.modelConfig
        ? [
            {
              configId: options.modelConfigId ?? "model",
              name: "Model",
              category: "model",
              type: "select",
              currentValue: values.model,
              options: [
                { value: "fast", name: "Fast" },
                { value: "balanced", name: "Balanced" },
              ],
            } as never,
          ]
        : []),
    ];
  };
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
      configValues.set(sessionId, { mode: "build", model: "balanced" });
      return {
        sessionId,
        ...(options.modelConfig || options.modeConfig
          ? { configOptions: sessionConfigOptions(sessionId) }
          : {}),
      };
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
        if (options.v2ReplayUserContent) {
          await client.notify(v2.methods.client.session.update, {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "user_message",
              messageId: "restored-user-v2",
              content: options.v2ReplayUserContent,
            },
          });
        }
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
    .onRequest(v2.methods.agent.session.setConfigOption, ({ params }) => {
      if (options.configOptionFailure) {
        throw v2.RequestError.internalError(
          undefined,
          "Fixture config option failed",
        );
      }
      if (
        typeof params.value !== "string" &&
        typeof params.value !== "boolean"
      ) {
        throw new Error("Unexpected config value in the v2 test agent");
      }
      configUpdates.push({
        sessionId: params.sessionId,
        id: params.configId,
        value: params.value,
      });
      const values = configValues.get(params.sessionId);
      if (values && typeof params.value === "string") {
        if (params.configId === (options.modeConfigId ?? "mode")) {
          values.mode = params.value;
        }
        if (params.configId === (options.modelConfigId ?? "model")) {
          values.model = params.value;
        }
      }
      return {
        configOptions: sessionConfigOptions(params.sessionId),
      };
    })
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
    configUpdates,
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

function embeddedResourceText(
  block: ContentBlock,
): { readonly uri: string; readonly text: string } | undefined {
  if (
    block.type !== "resource" ||
    typeof block.resource !== "object" ||
    block.resource === null
  ) {
    return undefined;
  }
  const resource = block.resource as Record<string, unknown>;
  return typeof resource.uri === "string" && typeof resource.text === "string"
    ? { uri: resource.uri, text: resource.text }
    : undefined;
}
