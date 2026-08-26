import type {
  AuthMethod,
  ChatActivity,
  ChatCommand,
  ChatConfigOption,
  ChatMessage,
  ChatPlan,
  ChatPlanEntry,
  ChatTerminal,
  ChatToolCall,
  ContentBlock,
  SessionInfo,
  SessionPage,
  UsageInfo,
} from "../types.js";

const MAX_ACTIVITIES = 1_000;
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
}

export class TimelineStore {
  #activities: ChatActivity[] = [];
  #counter = 0;
  #lastAnonymousMessage = new Map<string, string>();
  #pendingUserId: string | undefined;
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
    this.#terminalState.clear();
  }

  beginTurn(): void {
    this.#lastAnonymousMessage.clear();
  }

  addUserMessage(content: readonly ContentBlock[], pending: boolean): string {
    const id = `local-user-${++this.#counter}`;
    this.#appendActivity({
      type: "message",
      id,
      role: "user",
      content: normalizeContent(content),
      ...(pending ? { pending: true } : {}),
    });
    if (pending) this.#pendingUserId = id;
    return id;
  }

  markUserAccepted(): void {
    if (!this.#pendingUserId) return;
    this.#replace(this.#pendingUserId, (activity) =>
      activity.type === "message" ? { ...activity, pending: false } : activity,
    );
  }

  reduce(update: unknown, protocol: 1 | 2): ReducerEffect {
    if (!isRecord(update) || typeof update.sessionUpdate !== "string") {
      return { unsupported: "invalid_update" };
    }
    const kind = asString(update.sessionUpdate) ?? "";
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
    if (role === "user" && this.#pendingUserId) {
      const pendingId = this.#pendingUserId;
      const existing = this.#activities.find(
        (item) => item.type === "message" && item.id === pendingId,
      );
      if (existing?.type === "message") {
        this.#replace(pendingId, () => ({ ...existing, id, pending: false }));
        this.#pendingUserId = undefined;
      }
    }
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
      this.#appendActivity({ type: "message", id, role, content: [block] });
    }
  }

  #upsertMessage(
    role: ChatMessage["role"],
    messageId: string | undefined,
    update: Record<string, unknown>,
  ): void {
    if (!messageId) return;
    const id = messageActivityId(role, messageId);
    if (role === "user" && this.#pendingUserId) {
      const pendingId = this.#pendingUserId;
      const pending = this.#activities.find(
        (item) => item.type === "message" && item.id === pendingId,
      );
      if (pending?.type === "message") {
        const content = Object.hasOwn(update, "content")
          ? normalizeContent(update.content)
          : pending.content;
        this.#replace(pendingId, () => ({
          ...pending,
          id,
          content,
          pending: false,
        }));
        this.#pendingUserId = undefined;
        return;
      }
    }
    const existing = this.#activities.find(
      (item) => item.type === "message" && item.id === id,
    );
    const content = Object.hasOwn(update, "content")
      ? normalizeContent(update.content)
      : existing?.type === "message"
        ? existing.content
        : [];
    if (existing?.type === "message") {
      this.#replace(id, () => ({ ...existing, role, content }));
    } else {
      this.#appendActivity({ type: "message", id, role, content });
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

  #appendActivity(activity: ChatActivity): void {
    this.#activities = [...this.#activities, activity];
    if (this.#activities.length <= MAX_ACTIVITIES) return;
    const removed = this.#activities.slice(
      0,
      this.#activities.length - MAX_ACTIVITIES,
    );
    this.#activities = this.#activities.slice(-MAX_ACTIVITIES);
    for (const candidate of removed) {
      if (candidate.id === this.#pendingUserId) this.#pendingUserId = undefined;
      if (candidate.type === "terminal") {
        this.#terminalState.delete(candidate.id.slice("terminal:".length));
      }
    }
  }
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
  const base = { type };
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
    const uri = normalizeResourceUri(value.uri);
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
    const uri = normalizeResourceUri(value.resource.uri);
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
