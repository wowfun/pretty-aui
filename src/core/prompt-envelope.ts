import type { ContentBlock } from "./types.js";

const USER_MESSAGE_TAG_PREFIX = "pretty-aui-user-message-v1-";
const ENVELOPE_TOKEN_LENGTH = 32;
const TOKEN_SOURCE = `[a-f0-9]{${ENVELOPE_TOKEN_LENGTH}}`;
const MARKER_SCAN_WINDOW = 256;
const MAX_CONTEXT_METADATA_LENGTH = 16 * 1024;
const MAX_RECOVERED_LABEL_LENGTH = 160;
const OPENING_PATTERN = new RegExp(
  `(?:[\\t ]*\\r?\\n){0,2}[\\t ]*<${USER_MESSAGE_TAG_PREFIX}(${TOKEN_SOURCE})>[\\t ]*\\r?\\n`,
  "g",
);
const CLOSING_PATTERN = new RegExp(
  `(?:[\\t ]*\\r?\\n)?[\\t ]*</${USER_MESSAGE_TAG_PREFIX}(${TOKEN_SOURCE})>`,
  "g",
);
const MARKER_SIGNAL_PATTERN = new RegExp(
  `${USER_MESSAGE_TAG_PREFIX}${TOKEN_SOURCE}`,
  "g",
);
let fallbackTokenCounter = 0;

export function createUserMessageEnvelopeToken(): string {
  const bytes = new Uint8Array(16);
  try {
    if (typeof globalThis.crypto?.getRandomValues === "function") {
      globalThis.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
    }
  } catch {
    // Fall through to a bounded per-turn token in restricted runtimes.
  }
  fallbackTokenCounter += 1;
  const timestamp = Date.now().toString(16).padStart(12, "0").slice(-12);
  const counter = fallbackTokenCounter.toString(16).padStart(8, "0").slice(-8);
  const random = Math.floor(Math.random() * 0x1_0000_0000_0000)
    .toString(16)
    .padStart(12, "0");
  return `${timestamp}${counter}${random}`;
}

export function envelopeUserPrompt(
  input: readonly ContentBlock[],
  token: string,
): ContentBlock[] {
  if (
    !token ||
    token.length !== ENVELOPE_TOKEN_LENGTH ||
    !/^[a-f0-9]+$/.test(token)
  ) {
    throw new Error("Prompt envelope tokens must be bounded lowercase IDs");
  }
  const tag = `${USER_MESSAGE_TAG_PREFIX}${token}`;
  return [
    { type: "text", text: `\n\n<${tag}>\n` },
    ...input,
    { type: "text", text: `\n</${tag}>` },
  ];
}

export function restoreUserPrompt(content: readonly ContentBlock[]):
  | { readonly status: "none" | "malformed"; readonly content: ContentBlock[] }
  | {
      readonly status: "restored";
      readonly content: ContentBlock[];
      readonly context: readonly {
        readonly id: string;
        readonly label: string;
        readonly content: readonly ContentBlock[];
      }[];
    } {
  const spans: {
    readonly block: ContentBlock;
    readonly start: number;
    readonly end: number;
  }[] = [];
  const openings = new Map<
    string,
    { readonly token: string; readonly start: number; readonly end: number }
  >();
  let complete:
    | {
        readonly opening: {
          readonly token: string;
          readonly start: number;
          readonly end: number;
        };
        readonly closing: {
          readonly token: string;
          readonly start: number;
          readonly end: number;
        };
      }
    | undefined;
  let sawMarker = false;
  let lastMarkerSignalEnd = -1;
  let position = 0;
  let carry = "";
  for (const block of content) {
    const start = position;
    if (block.type !== "text" || typeof block.text !== "string") {
      position += 1;
      spans.push({ block, start, end: position });
      carry = "";
      continue;
    }
    position += block.text.length;
    spans.push({ block, start, end: position });
    const searchable = carry + block.text;
    const searchableStart = start - carry.length;
    MARKER_SIGNAL_PATTERN.lastIndex = 0;
    for (let signal = MARKER_SIGNAL_PATTERN.exec(searchable); signal;) {
      sawMarker = true;
      lastMarkerSignalEnd = Math.max(
        lastMarkerSignalEnd,
        searchableStart + signal.index + signal[0].length,
      );
      signal = MARKER_SIGNAL_PATTERN.exec(searchable);
    }
    const markers: {
      readonly kind: "opening" | "closing";
      readonly token: string;
      readonly start: number;
      readonly end: number;
    }[] = [];
    for (const [kind, pattern] of [
      ["opening", OPENING_PATTERN],
      ["closing", CLOSING_PATTERN],
    ] as const) {
      pattern.lastIndex = 0;
      for (let match = pattern.exec(searchable); match;) {
        const markerStart = searchableStart + match.index;
        const markerEnd = markerStart + match[0].length;
        if (markerEnd > start) {
          markers.push({
            kind,
            token: match[1]!,
            start: markerStart,
            end: markerEnd,
          });
        }
        match = pattern.exec(searchable);
      }
    }
    markers.sort((left, right) => left.start - right.start);
    for (const marker of markers) {
      if (marker.kind === "opening") {
        openings.set(marker.token, marker);
        continue;
      }
      const opening = openings.get(marker.token);
      if (opening && opening.end <= marker.start) {
        complete = { opening, closing: marker };
      }
    }
    carry = searchable.slice(-MARKER_SCAN_WINDOW);
  }
  if (!complete) {
    return { status: sawMarker ? "malformed" : "none", content: [...content] };
  }
  if (lastMarkerSignalEnd > complete.closing.end) {
    return { status: "malformed", content: [...content] };
  }

  const restored = sliceContent(
    spans,
    complete.opening.end,
    complete.closing.start,
  );
  const context = groupRestoredContext(
    sliceContent(spans, 0, complete.opening.start),
    complete.opening.token,
  );
  return { status: "restored", content: restored, context };
}

function sliceContent(
  spans: readonly {
    readonly block: ContentBlock;
    readonly start: number;
    readonly end: number;
  }[],
  start: number,
  end: number,
): ContentBlock[] {
  const sliced: ContentBlock[] = [];
  for (const span of spans) {
    if (span.block.type === "text" && typeof span.block.text === "string") {
      const sliceStart = Math.max(span.start, start);
      const sliceEnd = Math.min(span.end, end);
      if (sliceStart < sliceEnd) {
        const text = span.block.text.slice(
          sliceStart - span.start,
          sliceEnd - span.start,
        );
        sliced.push({ ...span.block, type: "text", text });
      }
      continue;
    }
    if (span.start >= start && span.end <= end) {
      sliced.push(span.block);
    }
  }
  return sliced;
}

function groupRestoredContext(
  content: readonly ContentBlock[],
  token: string,
): readonly {
  readonly id: string;
  readonly label: string;
  readonly content: readonly ContentBlock[];
}[] {
  const groups: {
    id: string;
    label: string;
    content: ContentBlock[];
    metadata: boolean;
  }[] = [];
  for (const block of content) {
    const metadata = contextMetadata(block);
    const previous = groups.at(-1);
    if (
      metadata &&
      previous?.metadata &&
      previous.id === metadata.id &&
      previous.label === metadata.label
    ) {
      previous.content.push(block);
      continue;
    }
    if (!metadata && previous && !previous.metadata) {
      previous.content.push(block);
      continue;
    }
    const index = groups.length;
    groups.push(
      metadata
        ? { ...metadata, content: [block], metadata: true }
        : {
            id: `restored:${token}:${index}`,
            label: recoveredContextLabel([block]),
            content: [block],
            metadata: false,
          },
    );
  }
  return groups.map((group) => ({
    id: group.id,
    label: group.metadata ? group.label : recoveredContextLabel(group.content),
    content: group.content,
  }));
}

function contextMetadata(
  block: ContentBlock,
): { readonly id: string; readonly label: string } | undefined {
  if (!isRecord(block._meta)) return undefined;
  const value = block._meta["pretty-aui/context"];
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.id !== "string" ||
    !value.id.trim() ||
    value.id.length > MAX_CONTEXT_METADATA_LENGTH ||
    typeof value.label !== "string" ||
    !value.label.trim() ||
    value.label.length > MAX_CONTEXT_METADATA_LENGTH
  ) {
    return undefined;
  }
  return { id: value.id, label: value.label };
}

function recoveredContextLabel(content: readonly ContentBlock[]): string {
  for (const block of content) {
    if (block.type === "text" && typeof block.text === "string") {
      const line = block.text
        .split(/\r?\n/u)
        .map((value) => value.trim())
        .find(Boolean);
      if (line) return line.slice(0, MAX_RECOVERED_LABEL_LENGTH);
    }
    if (block.type === "resource" && isRecord(block.resource)) {
      const uri = block.resource.uri;
      if (typeof uri === "string" && uri) {
        return uri.slice(0, MAX_RECOVERED_LABEL_LENGTH);
      }
    }
    if (block.type === "resource_link") {
      for (const value of [block.title, block.name, block.uri]) {
        if (typeof value === "string" && value) {
          return value.slice(0, MAX_RECOVERED_LABEL_LENGTH);
        }
      }
    }
    if (
      (block.type === "image" || block.type === "audio") &&
      typeof block.mimeType === "string" &&
      block.mimeType
    ) {
      return block.mimeType.slice(0, MAX_RECOVERED_LABEL_LENGTH);
    }
    if (typeof block.type === "string" && block.type) {
      return block.type.slice(0, MAX_RECOVERED_LABEL_LENGTH);
    }
  }
  return "restored context";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
