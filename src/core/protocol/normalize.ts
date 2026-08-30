import type {
  AuthMethod,
  ChatActivity,
  ChatCommand,
  ChatConfigOption,
  ChatContextActivity,
  ChatMessage,
  ChatNoticeActivity,
  ChatPlan,
  ChatPlanEntry,
  ChatTerminal,
  ChatToolCall,
  ContentBlock,
  SessionInfo,
  SessionPage,
  UsageInfo,
} from "../types.js";
import { restoreUserPrompt } from "../prompt-envelope.js";

const MAX_ACTIVITIES = 1_000;
const MAX_NOTICES = 64;
const MAX_COLLECTION_ITEMS = 256;
const MAX_METADATA_TEXT = 16 * 1024;
const MAX_CONTENT_BLOCKS = 256;
export const MAX_CONTENT_TEXT = 1024 * 1024;
export const MAX_MEDIA_BASE64 = 8 * 1024 * 1024;
const MAX_TERMINAL_TEXT = 1024 * 1024;
const MAX_TERMINAL_CHUNKS = 4_096;
const MAX_TERMINAL_DECODED_BYTES = 4 * 1024 * 1024;
const MAX_STRUCTURED_NODES = 4_096;
const MAX_STRUCTURED_DEPTH = 16;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asString(
  value: unknown,
  maxLength = MAX_METADATA_TEXT,
): string | undefined {
  return typeof value === "string" ? limitHead(value, maxLength) : undefined;
}

export function asHttpUrl(value: unknown): string | undefined {
  const url = asString(value, MAX_METADATA_TEXT);
  if (!url) return undefined;
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export function asRecordArray(
  value: unknown,
  maxItems = MAX_COLLECTION_ITEMS,
): Record<string, unknown>[] {
  return Array.isArray(value) ? value.slice(0, maxItems).filter(isRecord) : [];
}

export function normalizeContent(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_CONTENT_BLOCKS).flatMap((item) => {
    const normalized = normalizeContentBlock(item);
    return normalized ? [normalized] : [];
  });
}

export function boundedRecord(
  value: unknown,
): Readonly<Record<string, unknown>> | undefined {
  const budget = { nodes: MAX_STRUCTURED_NODES };
  const normalized = boundedUnknown(value, budget, 0);
  return isRecord(normalized) ? normalized : undefined;
}

export function normalizeAuthMethods(value: unknown): AuthMethod[] {
  return asRecordArray(value).map((method, index) => ({
    id: asString(method.methodId) ?? asString(method.id) ?? `auth-${index}`,
    name:
      asString(method.name) ??
      asString(method.title) ??
      `Authentication ${index + 1}`,
    ...(asString(method.description)
      ? { description: asString(method.description) }
      : {}),
    type: asString(method.type) ?? "agent",
    raw: boundedRecord(method) ?? {},
  }));
}

export function normalizeCommands(value: unknown): ChatCommand[] {
  return asRecordArray(value).flatMap((command) => {
    const name = asString(command.name);
    if (!name) return [];
    const input = isRecord(command.input) ? command.input : undefined;
    return [
      {
        name,
        description: asString(command.description) ?? "",
        ...(input && asString(input.hint)
          ? { inputHint: asString(input.hint) }
          : {}),
      },
    ];
  });
}

export function normalizeConfigOptions(value: unknown): ChatConfigOption[] {
  return asRecordArray(value).flatMap((option) => {
    const id = asString(option.configId) ?? asString(option.id);
    if (!id) return [];
    const rawType = asString(option.type);
    const currentValue = option.currentValue;
    const type =
      rawType === "boolean" || typeof currentValue === "boolean"
        ? "boolean"
        : rawType === "select" || Array.isArray(option.options)
          ? "select"
          : "unknown";
    const normalizedValue =
      typeof currentValue === "boolean"
        ? currentValue
        : (asString(currentValue) ?? "");
    const choices = asRecordArray(option.options).flatMap((choice) => {
      const choiceValue = asString(choice.value);
      if (!choiceValue) return [];
      return [
        {
          value: choiceValue,
          name: asString(choice.name) ?? choiceValue,
          ...(asString(choice.description)
            ? { description: asString(choice.description) }
            : {}),
        },
      ];
    });
    return [
      {
        id,
        name: asString(option.name) ?? id,
        ...(asString(option.description)
          ? { description: asString(option.description) }
          : {}),
        ...(asString(option.category)
          ? { category: asString(option.category) }
          : {}),
        type,
        currentValue: normalizedValue,
        ...(choices.length ? { options: choices } : {}),
      },
    ];
  });
}

export function normalizeModes(value: unknown): ChatConfigOption[] {
  if (!isRecord(value)) return [];
  const available = asRecordArray(value.availableModes);
  const current = asString(value.currentModeId) ?? "";
  if (!available.length) return [];
  return [
    {
      id: "mode",
      name: "Mode",
      category: "mode",
      type: "select",
      currentValue: current,
      options: available.flatMap((mode) => {
        const value = asString(mode.id);
        if (!value) return [];
        return [
          {
            value,
            name: asString(mode.name) ?? value,
            ...(asString(mode.description)
              ? { description: asString(mode.description) }
              : {}),
          },
        ];
      }),
    },
  ];
}

export function normalizeSessions(value: unknown): SessionPage {
  if (!isRecord(value)) return { sessions: [] };
  const sessions: SessionInfo[] = asRecordArray(value.sessions).flatMap(
    (session) => {
      const sessionId = asString(session.sessionId);
      if (!sessionId) return [];
      return [
        {
          sessionId,
          ...(asString(session.title)
            ? { title: asString(session.title) }
            : {}),
          ...(asString(session.updatedAt)
            ? { updatedAt: asString(session.updatedAt) }
            : {}),
          ...(asString(session.cwd) ? { cwd: asString(session.cwd) } : {}),
        },
      ];
    },
  );
  const nextCursor = asString(value.nextCursor);
  return { sessions, ...(nextCursor ? { nextCursor } : {}) };
}

export function normalizeUsage(value: unknown): UsageInfo | undefined {
  if (
    !isRecord(value) ||
    !isNonNegativeFiniteNumber(value.used) ||
    !isNonNegativeFiniteNumber(value.size)
  )
    return undefined;
  const currency = isRecord(value.cost)
    ? asString(value.cost.currency)
    : undefined;
  const cost =
    isRecord(value.cost) &&
    isNonNegativeFiniteNumber(value.cost.amount) &&
    currency !== undefined
      ? { amount: value.cost.amount, currency }
      : undefined;
  return { used: value.used, size: value.size, ...(cost ? { cost } : {}) };
}

export interface ReducerEffect {
  readonly state?: string | undefined;
  readonly stopReason?: string | undefined;
  readonly commands?: readonly ChatCommand[] | undefined;
  readonly configOptions?: readonly ChatConfigOption[] | undefined;
  readonly sessionTitle?: string | null | undefined;
  readonly usage?: UsageInfo | undefined;
  readonly unsupported?: string | undefined;
  readonly diagnostics?:
    readonly { readonly code: string; readonly message: string }[] | undefined;
}

export class TimelineStore {
  #activities: ChatActivity[] = [];
  #counter = 0;
  #lastAnonymousMessage = new Map<string, string>();
  #pendingUserId: string | undefined;
  #turnUserTimestamp: number | undefined;
  readonly #restoredUserMessageIds = new Set<string>();
  readonly #reportedMalformedUserMessageIds = new Set<string>();
  #pendingReplayUserId: string | undefined;
  #terminalState = new Map<
    string,
    {
      readonly decoder: TextDecoder;
      output: string;
      chunks: number;
      decodedBytes: number;
    }
  >();

  get activities(): readonly ChatActivity[] {
    return this.#activities;
  }

  reset(): void {
    this.#activities = [];
    this.#lastAnonymousMessage.clear();
    this.#pendingUserId = undefined;
    this.#turnUserTimestamp = undefined;
    this.#restoredUserMessageIds.clear();
    this.#reportedMalformedUserMessageIds.clear();
    this.#pendingReplayUserId = undefined;
    this.#terminalState.clear();
  }

  beginTurn(): void {
    this.#lastAnonymousMessage.clear();
    this.#turnUserTimestamp = undefined;
  }

  addNotice(activity: ChatNoticeActivity): void {
    let removeCount =
      this.#activities.filter((candidate) => candidate.type === "notice")
        .length -
      MAX_NOTICES +
      1;
    if (removeCount > 0) {
      this.#activities = this.#activities.filter((candidate) => {
        if (candidate.type !== "notice" || removeCount <= 0) return true;
        removeCount -= 1;
        return false;
      });
    }
    this.#appendActivity(activity);
  }

  addUserMessage(
    content: readonly ContentBlock[],
    pending: boolean,
    timestamp?: number,
  ): string {
    const reliableTimestamp = normalizeLocalEventTimestamp(timestamp);
    const normalized = normalizeContent(content);
    const id = `local-user-${++this.#counter}`;
    this.#appendActivity({
      type: "message",
      id,
      role: "user",
      content: normalized,
      ...(reliableTimestamp !== undefined
        ? { timestamp: reliableTimestamp }
        : {}),
      ...(pending ? { pending: true } : {}),
    });
    this.#turnUserTimestamp = reliableTimestamp;
    if (pending) {
      this.#pendingUserId = id;
    } else {
      this.#pendingUserId = undefined;
    }
    return id;
  }

  markFinalAnswer(timestamp: number): void {
    const reliableTimestamp = normalizeLocalEventTimestamp(timestamp);
    if (reliableTimestamp === undefined) return;
    for (let index = this.#activities.length - 1; index >= 0; index -= 1) {
      const activity = this.#activities[index];
      if (activity?.type !== "message") continue;
      if (activity.role === "user") return;
      if (activity.role !== "assistant") continue;
      this.#replace(activity.id, () => ({
        ...activity,
        timestamp: Math.max(
          reliableTimestamp,
          this.#turnUserTimestamp ?? reliableTimestamp,
        ),
      }));
      return;
    }
  }

  finishTurn(finalAnswerTimestamp?: number): void {
    if (finalAnswerTimestamp !== undefined) {
      this.markFinalAnswer(finalAnswerTimestamp);
    }
    if (this.#pendingUserId) {
      this.#replace(this.#pendingUserId, (activity) => {
        if (activity.type !== "message") return activity;
        const { pending: _pending, ...settled } = activity;
        return settled;
      });
    }
    this.#pendingUserId = undefined;
  }

  finalizeReplay(): ReducerEffect {
    this.#flushReplayUser();
    const diagnostics: { code: string; message: string }[] = [];
    for (const activity of this.#activities) {
      if (
        activity.type !== "message" ||
        activity.role !== "user" ||
        this.#reportedMalformedUserMessageIds.has(activity.id)
      ) {
        continue;
      }
      const restored = restoreUserPrompt(activity.content);
      if (restored.status !== "malformed") continue;
      this.#reportedMalformedUserMessageIds.add(activity.id);
      diagnostics.push({
        code: "MALFORMED_USER_MESSAGE_ENVELOPE",
        message:
          "A restored user-message envelope was incomplete; retained the Agent history unchanged",
      });
    }
    return diagnostics.length ? { diagnostics } : {};
  }

  markUserAccepted(
    contextItems: readonly {
      readonly id: string;
      readonly label: string;
      readonly content: readonly ContentBlock[];
    }[] = [],
  ): void {
    if (!this.#pendingUserId) return;
    this.#replace(this.#pendingUserId, (activity) =>
      activity.type === "message" ? { ...activity, pending: false } : activity,
    );
    for (const item of contextItems) {
      const activity: ChatContextActivity = {
        type: "context",
        id: `local-context-${++this.#counter}`,
        contextId: item.id,
        label: item.label,
        content: item.content,
      };
      this.#appendActivity(activity);
    }
  }

  reduce(update: unknown, protocol: 1 | 2): ReducerEffect {
    if (!isRecord(update) || typeof update.sessionUpdate !== "string") {
      return { unsupported: "invalid_update" };
    }
    const kind = asString(update.sessionUpdate) ?? "";
    if (
      this.#pendingUserId &&
      (kind === "user_message_chunk" || kind === "user_message")
    ) {
      return {};
    }
    switch (kind) {
      case "user_message_chunk":
      case "agent_message_chunk":
      case "agent_thought_chunk": {
        const role =
          kind === "user_message_chunk"
            ? "user"
            : kind === "agent_message_chunk"
              ? "assistant"
              : "thought";
        this.#appendMessage(
          role,
          asString(update.messageId),
          update.content,
          protocol,
        );
        return {};
      }
      case "user_message":
      case "agent_message":
      case "agent_thought": {
        const role =
          kind === "user_message"
            ? "user"
            : kind === "agent_message"
              ? "assistant"
              : "thought";
        this.#upsertMessage(role, asString(update.messageId), update);
        return {};
      }
      case "tool_call":
      case "tool_call_update":
        this.#upsertTool(update);
        return {};
      case "tool_call_content_chunk":
        this.#appendToolContent(update);
        return {};
      case "plan":
      case "plan_update":
        this.#upsertPlan(update);
        return {};
      case "plan_removed":
        this.#remove(`plan:${asString(update.planId) ?? "primary"}`);
        return {};
      case "terminal_update":
        this.#upsertTerminal(update);
        return {};
      case "terminal_output_chunk":
        this.#appendTerminalOutput(update);
        return {};
      case "available_commands_update":
        return { commands: normalizeCommands(update.availableCommands) };
      case "config_option_update":
        return { configOptions: normalizeConfigOptions(update.configOptions) };
      case "current_mode_update":
        return {};
      case "session_info_update":
        return {
          sessionTitle: Object.hasOwn(update, "title")
            ? (asString(update.title) ?? null)
            : undefined,
        };
      case "usage_update":
        return { usage: normalizeUsage(update) };
      case "state_update": {
        const state = asString(update.state);
        if (
          state === "running" ||
          state === "requires_action" ||
          state === "idle"
        ) {
          return {
            state,
            ...(asString(update.stopReason)
              ? { stopReason: asString(update.stopReason) }
              : {}),
          };
        }
        return { unsupported: `state:${state ?? "missing"}` };
      }
      default:
        return { unsupported: kind };
    }
  }

  #appendMessage(
    role: ChatMessage["role"],
    messageId: string | undefined,
    content: unknown,
    protocol: 1 | 2,
  ): void {
    let wireId = messageId;
    if (!wireId && protocol === 1) {
      wireId =
        this.#lastAnonymousMessage.get(role) ?? `v1-${role}-${++this.#counter}`;
      this.#lastAnonymousMessage.set(role, wireId);
    }
    if (!wireId) return;
    const id = messageActivityId(role, wireId);
    if (
      this.#pendingReplayUserId &&
      (role !== "user" || this.#pendingReplayUserId !== id)
    ) {
      this.#flushReplayUser();
    }
    if (role === "user" && this.#restoredUserMessageIds.has(id)) return;
    const existing = this.#activities.find(
      (item) => item.type === "message" && item.id === id,
    );
    const block = normalizeContentBlock(content);
    if (!block) return;
    if (existing?.type === "message") {
      this.#replace(id, () => ({
        ...existing,
        content: appendStreamBlock(existing.content, block),
      }));
    } else {
      this.#appendActivity({
        type: "message",
        id,
        role,
        content: [block],
      });
    }
    if (role === "user") this.#pendingReplayUserId = id;
  }

  #upsertMessage(
    role: ChatMessage["role"],
    messageId: string | undefined,
    update: Record<string, unknown>,
  ): void {
    if (!messageId) return;
    this.#flushReplayUser();
    const id = messageActivityId(role, messageId);
    const existing = this.#activities.find(
      (item) => item.type === "message" && item.id === id,
    );
    const normalizedContent = Object.hasOwn(update, "content")
      ? normalizeContent(update.content)
      : existing?.type === "message"
        ? existing.content
        : [];
    const restored =
      role === "user" ? restoreUserPrompt(normalizedContent) : undefined;
    const content =
      restored?.status === "restored" ? restored.content : normalizedContent;
    if (existing?.type === "message") {
      this.#replace(id, () => ({
        ...existing,
        role,
        content,
      }));
    } else {
      this.#appendActivity({
        type: "message",
        id,
        role,
        content,
      });
    }
    if (restored?.status === "restored") {
      this.#restoreReplayUser(id, restored);
    }
  }

  #upsertTool(update: Record<string, unknown>): void {
    const toolId = asString(update.toolCallId);
    if (!toolId) return;
    const id = `tool:${toolId}`;
    const existing = this.#activities.find(
      (item) => item.type === "tool" && item.id === id,
    );
    const base: ChatToolCall =
      existing?.type === "tool"
        ? existing
        : {
            type: "tool",
            id,
            title: "Tool",
            status: "pending",
            content: [],
            locations: [],
          };
    const { subagent: _subagent, ...baseTool } = base;
    const patched: ChatToolCall = {
      ...baseTool,
      ...(Object.hasOwn(update, "title")
        ? { title: asString(update.title) ?? "Tool" }
        : {}),
      ...(Object.hasOwn(update, "kind") && asString(update.kind)
        ? { kind: asString(update.kind) }
        : {}),
      ...(Object.hasOwn(update, "status")
        ? { status: asString(update.status) ?? "pending" }
        : {}),
      ...(Object.hasOwn(update, "content")
        ? { content: boundedArray(update.content) }
        : {}),
      ...(Object.hasOwn(update, "locations")
        ? {
            locations: boundedArray(update.locations).filter(isRecord),
          }
        : {}),
      ...(Object.hasOwn(update, "rawInput")
        ? { rawInput: boundedValue(update.rawInput) }
        : {}),
      ...(Object.hasOwn(update, "rawOutput")
        ? { rawOutput: boundedValue(update.rawOutput) }
        : {}),
    };
    const subagent = normalizeSubagent(patched);
    const next: ChatToolCall = {
      ...patched,
      ...(subagent ? { subagent } : {}),
    };
    this.#upsert(id, next);
  }

  #appendToolContent(update: Record<string, unknown>): void {
    const toolId = asString(update.toolCallId);
    if (!toolId || !Object.hasOwn(update, "content")) return;
    const id = `tool:${toolId}`;
    const existing = this.#activities.find(
      (item) => item.type === "tool" && item.id === id,
    );
    const base: ChatToolCall =
      existing?.type === "tool"
        ? existing
        : {
            type: "tool",
            id,
            title: "Tool",
            status: "pending",
            content: [],
            locations: [],
          };
    if (base.content.length >= MAX_COLLECTION_ITEMS) return;
    this.#upsert(id, {
      ...base,
      content: boundedArray([...base.content, update.content]),
    });
  }

  #upsertPlan(update: Record<string, unknown>): void {
    const plan = isRecord(update.plan) ? update.plan : update;
    const planId = asString(plan.planId) ?? "primary";
    const id = `plan:${planId}`;
    const entries: ChatPlanEntry[] = asRecordArray(plan.entries).map(
      (entry) => ({
        content: asString(entry.content) ?? "",
        ...(asString(entry.priority)
          ? { priority: asString(entry.priority) }
          : {}),
        status: asString(entry.status) ?? "pending",
      }),
    );
    const normalized: ChatPlan = { type: "plan", id, entries };
    this.#upsert(id, normalized);
  }

  #upsertTerminal(update: Record<string, unknown>): void {
    const terminalId = asString(update.terminalId);
    if (!terminalId) return;
    const id = `terminal:${terminalId}`;
    if (
      Object.hasOwn(update, "output") &&
      isRecord(update.output) &&
      typeof update.output.data === "string"
    ) {
      const decoder = new TextDecoder();
      const bytes = decodeBase64(update.output.data).subarray(
        0,
        MAX_TERMINAL_DECODED_BYTES,
      );
      const output = limitTail(
        decoder.decode(bytes, { stream: true }),
        MAX_TERMINAL_TEXT,
      );
      this.#terminalState.set(terminalId, {
        decoder,
        output,
        chunks: 1,
        decodedBytes: bytes.byteLength,
      });
    }
    const existing = this.#activities.find(
      (item) => item.type === "terminal" && item.id === id,
    );
    const command = Array.isArray(update.command)
      ? update.command
          .filter((part): part is string => typeof part === "string")
          .join(" ")
      : asString(update.command);
    const output = this.#terminalState.get(terminalId)?.output ?? "";
    const terminal: ChatTerminal = {
      type: "terminal",
      id,
      title:
        command ??
        (existing?.type === "terminal" ? existing.title : "Terminal"),
      output,
      exited: Object.hasOwn(update, "exitStatus")
        ? update.exitStatus !== null
        : existing?.type === "terminal"
          ? existing.exited
          : false,
    };
    this.#upsert(id, terminal);
  }

  #appendTerminalOutput(update: Record<string, unknown>): void {
    const terminalId = asString(update.terminalId);
    const data = asString(update.data);
    if (!terminalId || !data) return;
    const state = this.#terminalState.get(terminalId) ?? {
      decoder: new TextDecoder(),
      output: "",
      chunks: 0,
      decodedBytes: 0,
    };
    if (
      state.chunks >= MAX_TERMINAL_CHUNKS ||
      state.decodedBytes >= MAX_TERMINAL_DECODED_BYTES
    )
      return;
    const remainingBytes = MAX_TERMINAL_DECODED_BYTES - state.decodedBytes;
    const bytes = decodeBase64(data).subarray(0, remainingBytes);
    state.chunks += 1;
    state.decodedBytes += bytes.byteLength;
    state.output = limitTail(
      state.output + state.decoder.decode(bytes, { stream: true }),
      MAX_TERMINAL_TEXT,
    );
    this.#terminalState.set(terminalId, state);
    const id = `terminal:${terminalId}`;
    const existing = this.#activities.find(
      (item) => item.type === "terminal" && item.id === id,
    );
    const terminal: ChatTerminal =
      existing?.type === "terminal"
        ? {
            ...existing,
            output: state.output,
          }
        : {
            type: "terminal",
            id,
            title: "Terminal",
            output: state.output,
            exited: false,
          };
    this.#upsert(id, terminal);
  }

  #upsert(id: string, activity: ChatActivity): void {
    const index = this.#activities.findIndex((item) => item.id === id);
    if (index < 0) {
      this.#appendActivity(activity);
      return;
    }
    this.#activities = this.#activities.map((item, itemIndex) =>
      itemIndex === index ? activity : item,
    );
  }

  #replace(
    id: string,
    replace: (activity: ChatActivity) => ChatActivity,
  ): void {
    this.#activities = this.#activities.map((activity) =>
      activity.id === id ? replace(activity) : activity,
    );
  }

  #remove(id: string): void {
    this.#activities = this.#activities.filter(
      (activity) => activity.id !== id,
    );
  }

  #flushReplayUser(): void {
    const id = this.#pendingReplayUserId;
    this.#pendingReplayUserId = undefined;
    if (!id || this.#restoredUserMessageIds.has(id)) return;
    const activity = this.#activities.find((item) => item.id === id);
    if (activity?.type !== "message" || activity.role !== "user") return;
    const restored = restoreUserPrompt(activity.content);
    if (restored.status !== "restored") return;
    this.#restoreReplayUser(id, restored);
  }

  #restoreReplayUser(
    id: string,
    restored: Extract<
      ReturnType<typeof restoreUserPrompt>,
      { readonly status: "restored" }
    >,
  ): void {
    if (this.#restoredUserMessageIds.has(id)) return;
    this.#restoredUserMessageIds.add(id);
    this.#replace(id, (activity) =>
      activity.type === "message"
        ? { ...activity, content: restored.content }
        : activity,
    );
    this.#insertActivitiesAfter(
      id,
      restored.context.map<ChatContextActivity>((item) => ({
        type: "context",
        id: `restored-context-${++this.#counter}`,
        contextId: item.id,
        label: item.label,
        content: item.content,
      })),
    );
  }

  #insertActivitiesAfter(
    id: string,
    activities: readonly ChatActivity[],
  ): void {
    if (!activities.length) return;
    const index = this.#activities.findIndex((activity) => activity.id === id);
    if (index < 0) return;
    this.#activities = [
      ...this.#activities.slice(0, index + 1),
      ...activities,
      ...this.#activities.slice(index + 1),
    ];
    this.#trimActivities();
  }

  #appendActivity(activity: ChatActivity): void {
    this.#activities = [...this.#activities, activity];
    this.#trimActivities();
  }

  #trimActivities(): void {
    let removeCount =
      this.#activities.filter((activity) => activity.type !== "notice").length -
      MAX_ACTIVITIES;
    if (removeCount <= 0) return;
    const removed: ChatActivity[] = [];
    this.#activities = this.#activities.filter((activity) => {
      if (
        activity.type === "notice" ||
        activity.id === this.#pendingUserId ||
        removeCount <= 0
      )
        return true;
      removeCount -= 1;
      removed.push(activity);
      return false;
    });
    for (const candidate of removed) {
      // Release state owned by evicted terminal activities.
      if (candidate.type === "terminal") {
        this.#terminalState.delete(candidate.id.slice("terminal:".length));
      }
    }
  }
}

function normalizeLocalEventTimestamp(
  timestamp: number | undefined,
): number | undefined {
  if (
    timestamp === undefined ||
    !Number.isFinite(timestamp) ||
    timestamp < 0 ||
    Number.isNaN(new Date(timestamp).valueOf())
  ) {
    return undefined;
  }
  return timestamp;
}

function messageActivityId(role: ChatMessage["role"], wireId: string): string {
  return `message:${role}:${wireId}`;
}

function normalizeSubagent(
  tool: ChatToolCall,
): ChatToolCall["subagent"] | undefined {
  if (tool.kind !== "think" || !isRecord(tool.rawInput)) return undefined;
  const agent = asString(tool.rawInput.subagent_type);
  const description = asString(tool.rawInput.description);
  const prompt = asString(tool.rawInput.prompt);
  if (!agent || !description || !prompt) return undefined;

  const outputMetadata =
    isRecord(tool.rawOutput) && isRecord(tool.rawOutput.metadata)
      ? tool.rawOutput.metadata
      : undefined;
  const settledSessionId = asReferenceId(outputMetadata?.sessionId);
  const resumedSessionId = asReferenceId(tool.rawInput.task_id);
  const sessionId = settledSessionId ?? resumedSessionId;
  const background =
    tool.rawInput.background === true || outputMetadata?.background === true;
  return {
    agent,
    ...(description ? { description } : {}),
    ...(sessionId ? { sessionId } : {}),
    background,
  };
}

function asReferenceId(value: unknown): string | undefined {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_METADATA_TEXT
    ? value
    : undefined;
}

function appendStreamBlock(
  content: readonly ContentBlock[],
  block: ContentBlock,
): ContentBlock[] {
  const previous = content.at(-1);
  if (
    previous?.type === "text" &&
    typeof previous.text === "string" &&
    block.type === "text" &&
    typeof block.text === "string" &&
    previous.annotations == null &&
    previous._meta == null &&
    block.annotations == null &&
    block._meta == null
  ) {
    return [
      ...content.slice(0, -1),
      {
        type: "text",
        text: limitTail(previous.text + block.text, MAX_CONTENT_TEXT),
      },
    ];
  }
  return content.length >= MAX_CONTENT_BLOCKS
    ? [...content]
    : [...content, block];
}

function decodeBase64(value: string): Uint8Array {
  try {
    if (typeof globalThis.atob === "function") {
      const decoded = globalThis.atob(value.slice(0, MAX_MEDIA_BASE64));
      return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    }
    return new Uint8Array(
      Buffer.from(value.slice(0, MAX_MEDIA_BASE64), "base64"),
    );
  } catch {
    return new Uint8Array();
  }
}

function normalizeContentBlock(value: unknown): ContentBlock | undefined {
  if (!isRecord(value)) return undefined;
  const type = asString(value.type, 128);
  if (!type) return undefined;
  const contextMetadata = normalizeContextMetadata(value._meta);
  const base = { type, ...contextMetadata };
  if (type === "text") {
    const text = asString(value.text, MAX_CONTENT_TEXT);
    return text === undefined ? undefined : { ...base, type: "text", text };
  }
  if (type === "image" || type === "audio") {
    const data = asString(value.data, MAX_MEDIA_BASE64);
    const mimeType = asString(value.mimeType, 256);
    if (data === undefined || mimeType === undefined) return undefined;
    return { ...base, type, data, mimeType };
  }
  if (type === "resource_link") {
    const uri = contextMetadata
      ? asString(value.uri, MAX_METADATA_TEXT)
      : normalizeResourceUri(value.uri);
    const name = asString(value.name, MAX_METADATA_TEXT);
    if (!uri || !name) return undefined;
    return {
      ...base,
      type: "resource_link",
      uri,
      name,
      ...(asString(value.title) ? { title: asString(value.title) } : {}),
      ...(asString(value.description)
        ? { description: asString(value.description) }
        : {}),
      ...(asString(value.mimeType, 256)
        ? { mimeType: asString(value.mimeType, 256) }
        : {}),
      ...(typeof value.size === "number" && Number.isFinite(value.size)
        ? { size: value.size }
        : {}),
    };
  }
  if (type === "resource" && isRecord(value.resource)) {
    const uri = contextMetadata
      ? asString(value.resource.uri, MAX_METADATA_TEXT)
      : normalizeResourceUri(value.resource.uri);
    if (!uri) return undefined;
    return {
      ...base,
      type: "resource",
      resource: {
        uri,
        ...(asString(value.resource.mimeType, 256)
          ? { mimeType: asString(value.resource.mimeType, 256) }
          : {}),
        ...(asString(value.resource.text, MAX_CONTENT_TEXT) !== undefined
          ? { text: asString(value.resource.text, MAX_CONTENT_TEXT) }
          : {}),
        ...(asString(value.resource.blob, MAX_MEDIA_BASE64) !== undefined
          ? { blob: asString(value.resource.blob, MAX_MEDIA_BASE64) }
          : {}),
      },
    };
  }
  return base;
}

function normalizeContextMetadata(value: unknown):
  | {
      readonly _meta: Readonly<{
        "pretty-aui/context": Readonly<{
          version: 1;
          id: string;
          label: string;
        }>;
      }>;
    }
  | undefined {
  if (!isRecord(value)) return undefined;
  const context = value["pretty-aui/context"];
  if (
    !isRecord(context) ||
    context.version !== 1 ||
    typeof context.id !== "string" ||
    !context.id.trim() ||
    context.id.length > MAX_METADATA_TEXT ||
    typeof context.label !== "string" ||
    !context.label.trim() ||
    context.label.length > MAX_METADATA_TEXT
  ) {
    return undefined;
  }
  return {
    _meta: {
      "pretty-aui/context": {
        version: 1,
        id: context.id,
        label: context.label,
      },
    },
  };
}

function boundedArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  const normalized = boundedUnknown(value, { nodes: MAX_STRUCTURED_NODES }, 0);
  return Array.isArray(normalized) ? normalized : [];
}

function boundedValue(value: unknown): unknown {
  const normalized = boundedUnknown(value, { nodes: MAX_STRUCTURED_NODES }, 0);
  return normalized === OMIT ? null : normalized;
}

const OMIT = Symbol("omit-structured-value");

function boundedUnknown(
  value: unknown,
  budget: { nodes: number },
  depth: number,
): unknown | typeof OMIT {
  if (budget.nodes <= 0 || depth > MAX_STRUCTURED_DEPTH) return OMIT;
  budget.nodes -= 1;
  if (typeof value === "string") return limitHead(value, MAX_CONTENT_TEXT);
  if (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    const normalized: unknown[] = [];
    for (const item of value.slice(0, MAX_COLLECTION_ITEMS)) {
      const child = boundedUnknown(item, budget, depth + 1);
      if (child !== OMIT) normalized.push(child);
      if (budget.nodes <= 0) break;
    }
    return normalized;
  }
  if (isRecord(value)) {
    const normalized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value).slice(
      0,
      MAX_COLLECTION_ITEMS,
    )) {
      const child = boundedUnknown(item, budget, depth + 1);
      if (child !== OMIT) normalized[limitHead(key, MAX_METADATA_TEXT)] = child;
      if (budget.nodes <= 0) break;
    }
    return normalized;
  }
  return null;
}

function limitTail(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  let start = value.length - maxLength;
  if (isLowSurrogate(value.charCodeAt(start))) start += 1;
  return value.slice(start);
}

function limitHead(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  let end = maxLength;
  if (isHighSurrogate(value.charCodeAt(end - 1))) end -= 1;
  return value.slice(0, end);
}

function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    !Object.is(value, -0)
  );
}

function normalizeResourceUri(value: unknown): string | undefined {
  const uri = asString(value, MAX_METADATA_TEXT);
  if (!uri) return undefined;
  try {
    const protocol = new URL(uri).protocol;
    return protocol === "http:" || protocol === "https:" || protocol === "file:"
      ? uri
      : undefined;
  } catch {
    return undefined;
  }
}
