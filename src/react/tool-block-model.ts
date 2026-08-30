import type { ChatToolCall } from "../core/types.js";

const MAX_RENDERED_TOOL_TEXT = 100_000;

export interface ToolTerminalBlockModel {
  readonly kind: "terminal";
  readonly command: string;
  readonly cwd?: string | undefined;
  readonly output: string;
  readonly displayOutput: string;
  readonly running: boolean;
  readonly failed: boolean;
  readonly supplementary: readonly unknown[];
}

export interface ToolReadLine {
  readonly number: number;
  readonly text: string;
}

export interface ToolReadBlockModel {
  readonly kind: "read";
  readonly label: string;
  readonly lines: readonly ToolReadLine[];
  readonly copyText: string;
  readonly supplementary: readonly unknown[];
}

export interface ToolDiffRow {
  readonly kind: "meta" | "context" | "add" | "delete";
  readonly text: string;
}

export interface ToolDiffBlockModel {
  readonly kind: "diff";
  readonly rows: readonly ToolDiffRow[];
  readonly copyText: string;
  readonly added: number;
  readonly removed: number;
  readonly files: number;
  readonly supplementary: readonly unknown[];
}

export interface ToolIoSectionModel {
  readonly text?: string | undefined;
  readonly values?: readonly unknown[] | undefined;
  readonly copyText: string;
}

export interface ToolIoBlockModel {
  readonly kind: "io";
  readonly input?: ToolIoSectionModel | undefined;
  readonly output?: ToolIoSectionModel | undefined;
}

export type ToolBlockModel =
  | ToolTerminalBlockModel
  | ToolReadBlockModel
  | ToolDiffBlockModel
  | ToolIoBlockModel;

export function deriveToolBlock(tool: ChatToolCall): ToolBlockModel {
  return (
    deriveDiffBlock(tool) ??
    deriveTerminalBlock(tool) ??
    deriveReadBlock(tool) ??
    deriveIoBlock(tool)
  );
}

export function formatToolValue(value: unknown): string {
  const rendered =
    typeof value === "string"
      ? value
      : (() => {
          try {
            return JSON.stringify(value, null, 2) ?? String(value);
          } catch {
            return String(value);
          }
        })();
  return rendered.slice(0, MAX_RENDERED_TOOL_TEXT);
}

function deriveTerminalBlock(
  tool: ChatToolCall,
): ToolTerminalBlockModel | undefined {
  const kind = tool.kind?.toLowerCase();
  if (
    kind !== "execute" &&
    kind !== "bash" &&
    kind !== "shell" &&
    kind !== "terminal"
  ) {
    return undefined;
  }
  if (!isRecord(tool.rawInput)) return undefined;
  const command = firstString(tool.rawInput.command, tool.rawInput.cmd);
  if (!command?.trim()) return undefined;
  const cwd = firstString(tool.rawInput.cwd, tool.rawInput.workdir);
  const { text: contentOutput, remaining } = toolContentText(tool.content);
  const rawOutput = isRecord(tool.rawOutput) ? tool.rawOutput : undefined;
  const output =
    contentOutput ??
    firstString(rawOutput?.output, rawOutput?.error) ??
    (typeof tool.rawOutput === "string" ? tool.rawOutput : "");
  const running = tool.status === "pending" || tool.status === "in_progress";
  return {
    kind: "terminal",
    command,
    ...(cwd ? { cwd } : {}),
    output,
    displayOutput: cleanTerminalText(output),
    running,
    failed: tool.status === "failed" || tool.status === "cancelled",
    supplementary: remaining,
  };
}

function deriveReadBlock(tool: ChatToolCall): ToolReadBlockModel | undefined {
  if (tool.kind?.toLowerCase() !== "read" || tool.status !== "completed") {
    return undefined;
  }
  const input = isRecord(tool.rawInput) ? tool.rawInput : undefined;
  const rawOutput = isRecord(tool.rawOutput) ? tool.rawOutput : undefined;
  const metadata = isRecord(rawOutput?.metadata)
    ? rawOutput.metadata
    : undefined;
  const display = isRecord(metadata?.display) ? metadata.display : undefined;
  if (display?.type === "directory") return undefined;

  const { text: contentText, remaining } = toolContentText(tool.content);
  const displayText =
    display?.type === "file" && typeof display.text === "string"
      ? display.text
      : undefined;
  const source = contentText ?? displayText;
  if (source === undefined) return undefined;

  const explicitFile = display?.type === "file";
  const envelope = parseFileEnvelope(source);
  const numbered = parseNumberedLines(envelope?.text ?? source);
  if (!explicitFile && !envelope && !numbered) return undefined;
  const text = envelope?.text ?? source;
  const offset = positiveInteger(input?.offset) ?? 1;
  const lines =
    numbered ??
    splitLines(text).map((line, index) => ({
      number: offset + index,
      text: line,
    }));
  const path = firstString(
    envelope?.path,
    input?.filePath,
    input?.file_path,
    input?.filepath,
    input?.path,
    firstLocationPath(tool),
  );
  const title = meaningfulReadTitle(tool.title);
  const label = title ?? path;
  if (!label) return undefined;
  return {
    kind: "read",
    label,
    lines,
    copyText: lines.map((line) => line.text).join("\n"),
    supplementary: remaining,
  };
}

function deriveDiffBlock(tool: ChatToolCall): ToolDiffBlockModel | undefined {
  const rows: ToolDiffRow[] = [];
  const copies: string[] = [];
  const consumed = new Set<number>();
  const paths = new Set<string>();
  let added = 0;
  let removed = 0;

  tool.content.forEach((value, index) => {
    if (!isRecord(value) || value.type !== "diff") return;
    const v1 = v1Diff(value);
    if (v1) {
      consumed.add(index);
      paths.add(v1.path);
      const next: ToolDiffRow[] = [{ kind: "meta", text: v1.path }];
      if (v1.oldText !== null) {
        for (const line of contentLines(v1.oldText)) {
          next.push({ kind: "delete", text: `- ${line}` });
          removed += 1;
        }
      }
      for (const line of contentLines(v1.newText)) {
        next.push({ kind: "add", text: `+ ${line}` });
        added += 1;
      }
      rows.push(...next);
      copies.push(next.map((row) => row.text).join("\n"));
      return;
    }
    const v2 = v2Diff(value);
    if (!v2) return;
    consumed.add(index);
    for (const path of v2.paths) paths.add(path);
    rows.push(...v2.rows);
    copies.push(v2.copyText);
    added += v2.rows.filter((row) => row.kind === "add").length;
    removed += v2.rows.filter((row) => row.kind === "delete").length;
  });
  if (!rows.length) return undefined;
  return {
    kind: "diff",
    rows,
    copyText: copies.join("\n\n"),
    added,
    removed,
    files: paths.size,
    supplementary: tool.content.filter((_, index) => !consumed.has(index)),
  };
}

function deriveIoBlock(tool: ChatToolCall): ToolIoBlockModel {
  const input =
    tool.rawInput === undefined
      ? undefined
      : textSection(formatToolValue(tool.rawInput));
  if (tool.content.length) {
    const copyText = toolContentCopyText(tool.content);
    return {
      kind: "io",
      ...(input ? { input } : {}),
      output: { values: tool.content, copyText },
    };
  }
  const output =
    tool.rawOutput === undefined
      ? undefined
      : textSection(formatToolValue(tool.rawOutput));
  return {
    kind: "io",
    ...(input ? { input } : {}),
    ...(output ? { output } : {}),
  };
}

function textSection(text: string): ToolIoSectionModel {
  return { text, copyText: text };
}

function toolContentText(values: readonly unknown[]): {
  readonly text?: string | undefined;
  readonly remaining: readonly unknown[];
} {
  const text: string[] = [];
  const remaining: unknown[] = [];
  for (const value of values) {
    const content = toolText(value);
    if (content === undefined) remaining.push(value);
    else text.push(content);
  }
  return {
    ...(text.length ? { text: text.join("\n") } : {}),
    remaining,
  };
}

function toolContentCopyText(values: readonly unknown[]): string {
  return values
    .flatMap((value) => {
      const text = toolText(value);
      return text === undefined ? [] : [text];
    })
    .join("\n");
}

function toolText(value: unknown): string | undefined {
  if (
    !isRecord(value) ||
    value.type !== "content" ||
    !isRecord(value.content)
  ) {
    return undefined;
  }
  return value.content.type === "text" && typeof value.content.text === "string"
    ? value.content.text
    : undefined;
}

function v1Diff(value: Record<string, unknown>):
  | {
      readonly path: string;
      readonly oldText: string | null;
      readonly newText: string;
    }
  | undefined {
  if (
    typeof value.path !== "string" ||
    !value.path.trim() ||
    typeof value.newText !== "string"
  ) {
    return undefined;
  }
  if (
    value.oldText !== undefined &&
    value.oldText !== null &&
    typeof value.oldText !== "string"
  ) {
    return undefined;
  }
  return {
    path: value.path,
    oldText: typeof value.oldText === "string" ? value.oldText : null,
    newText: value.newText,
  };
}

function v2Diff(value: Record<string, unknown>):
  | {
      readonly rows: readonly ToolDiffRow[];
      readonly copyText: string;
      readonly paths: readonly string[];
    }
  | undefined {
  if (!Array.isArray(value.changes)) return undefined;
  const changes = value.changes.filter(isRecord);
  if (changes.length !== value.changes.length) return undefined;
  const paths: string[] = [];
  for (const change of changes) {
    if (
      typeof change.operation !== "string" ||
      !change.operation.trim() ||
      typeof change.path !== "string" ||
      !change.path.trim()
    ) {
      return undefined;
    }
    paths.push(change.path);
    if (typeof change.oldPath === "string") paths.push(change.oldPath);
  }
  const patchText =
    typeof value.patch === "string"
      ? value.patch
      : isRecord(value.patch) && typeof value.patch.text === "string"
        ? value.patch.text
        : undefined;
  if (patchText !== undefined) {
    return {
      rows: patchText.split(/\r?\n/).map(diffPatchRow),
      copyText: patchText,
      paths,
    };
  }
  const copyText = changes
    .map((change) => {
      const oldPath =
        typeof change.oldPath === "string" ? change.oldPath : undefined;
      return oldPath
        ? `${String(change.operation)} ${oldPath} -> ${String(change.path)}`
        : `${String(change.operation)} ${String(change.path)}`;
    })
    .join("\n");
  return {
    rows: copyText
      .split("\n")
      .filter(Boolean)
      .map((text) => ({ kind: "meta", text })),
    copyText,
    paths,
  };
}

function diffPatchRow(text: string): ToolDiffRow {
  if (text.startsWith("+") && !text.startsWith("+++")) {
    return { kind: "add", text };
  }
  if (text.startsWith("-") && !text.startsWith("---")) {
    return { kind: "delete", text };
  }
  if (text.startsWith(" ")) return { kind: "context", text };
  return { kind: "meta", text };
}

function parseFileEnvelope(text: string):
  | {
      readonly path: string;
      readonly text: string;
    }
  | undefined {
  const match =
    /^<path>([^\r\n]*)<\/path>\r?\n<type>file<\/type>\r?\n<content>\r?\n([\s\S]*)\r?\n<\/content>$/.exec(
      text,
    );
  return match?.[1] !== undefined && match[2] !== undefined
    ? { path: match[1], text: match[2] }
    : undefined;
}

function parseNumberedLines(text: string): ToolReadLine[] | undefined {
  const lines = splitLines(text);
  if (!lines.length) return undefined;
  const parsed: ToolReadLine[] = [];
  let previous = 0;
  for (const line of lines) {
    const match = /^(\d+):(?: |$)(.*)$/.exec(line);
    const number = match ? Number(match[1]) : Number.NaN;
    if (!match || !Number.isSafeInteger(number) || number <= previous) {
      return undefined;
    }
    parsed.push({ number, text: match[2] ?? "" });
    previous = number;
  }
  return parsed;
}

function splitLines(text: string): string[] {
  if (!text) return [];
  const withoutTerminator = text.endsWith("\n") ? text.slice(0, -1) : text;
  return withoutTerminator.split(/\r?\n/);
}

function contentLines(text: string): string[] {
  return text ? splitLines(text) : [];
}

function meaningfulReadTitle(title: string): string | undefined {
  const value = title.trim();
  const normalized = value.toLowerCase();
  return value && normalized !== "read" && normalized !== "tool"
    ? value
    : undefined;
}

function firstLocationPath(tool: ChatToolCall): unknown {
  return tool.locations.find((location) => typeof location.path === "string")
    ?.path;
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : undefined;
}

function firstString(...values: readonly unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === "string");
}

function cleanTerminalText(text: string): string {
  return text
    .replaceAll(/\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)?/g, "")
    .replaceAll(/\u001b\[[\u0030-\u003f]*[\u0020-\u002f]*[\u0040-\u007e]/g, "")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll(
      /[\u0000-\u0008\u000b\u000c\u000e-\u001a\u001c-\u001f\u007f]/g,
      "",
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
