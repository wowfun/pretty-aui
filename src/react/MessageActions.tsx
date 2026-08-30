import { useSyncExternalStore, type ReactNode } from "react";
import type { ContentBlock } from "../core/types.js";
import type { ChatLabels } from "./types.js";
import { useCopyFeedback } from "./clipboard.js";

const MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});
const YEAR_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

interface MessageActionsProps {
  readonly content: readonly ContentBlock[];
  readonly timestamp?: number | undefined;
  readonly clock: "start" | "end";
  readonly labels: ChatLabels;
}

export function MessageActions({
  content,
  timestamp,
  clock,
  labels,
}: MessageActionsProps) {
  const calendarDay = useCalendarDay();
  const text = messageText(content);
  const { copied, copy } = useCopyFeedback(text);
  const validTimestamp =
    timestamp !== undefined &&
    Number.isFinite(timestamp) &&
    timestamp >= 0 &&
    !Number.isNaN(new Date(timestamp).valueOf())
      ? timestamp
      : undefined;

  const time =
    validTimestamp === undefined ? null : (
      <time
        className={`paui-message__time paui-message__time--${clock}`}
        dateTime={new Date(validTimestamp).toISOString()}
      >
        {formatMessageTimestamp(validTimestamp, calendarDay)}
      </time>
    );
  const actionLabel = copied ? labels.copied : labels.copy;

  return (
    <div
      className="paui-message__actions"
      data-pretty-aui-slot="message-actions"
      data-clock={clock}
    >
      {clock === "start" ? time : null}
      <button
        className="paui-message__action"
        type="button"
        aria-label={actionLabel}
        title={actionLabel}
        onClick={(event) => copy(event.currentTarget)}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      {clock === "end" ? time : null}
    </div>
  );
}

export function formatMessageTimestamp(
  timestamp: number,
  now: number = Date.now(),
): string {
  const date = new Date(timestamp);
  const current = new Date(now);
  const clock = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  const sameYear = date.getFullYear() === current.getFullYear();
  const sameDay =
    sameYear &&
    date.getMonth() === current.getMonth() &&
    date.getDate() === current.getDate();
  if (sameDay) return clock;
  const day = sameYear
    ? MONTH_DAY_FORMATTER.format(date)
    : YEAR_MONTH_DAY_FORMATTER.format(date);
  return `${day} ${clock}`;
}

function messageText(content: readonly ContentBlock[]): string {
  return content
    .flatMap((block) =>
      block.type === "text" && typeof block.text === "string"
        ? [block.text]
        : [],
    )
    .join("");
}

let calendarDay = startOfLocalDay(Date.now());
let calendarTimer: number | undefined;
const calendarListeners = new Set<() => void>();

function useCalendarDay(): number {
  return useSyncExternalStore(
    subscribeCalendarDay,
    () => calendarDay,
    () => calendarDay,
  );
}

function subscribeCalendarDay(listener: () => void): () => void {
  calendarListeners.add(listener);
  const current = startOfLocalDay(Date.now());
  if (current !== calendarDay) {
    calendarDay = current;
    for (const notify of calendarListeners) notify();
  }
  if (calendarListeners.size === 1) scheduleCalendarDay();
  return () => {
    calendarListeners.delete(listener);
    if (!calendarListeners.size && calendarTimer !== undefined) {
      window.clearTimeout(calendarTimer);
      calendarTimer = undefined;
    }
  };
}

function scheduleCalendarDay(): void {
  if (calendarTimer !== undefined) window.clearTimeout(calendarTimer);
  const now = Date.now();
  calendarTimer = window.setTimeout(() => {
    calendarTimer = undefined;
    calendarDay = startOfLocalDay(Date.now());
    for (const listener of calendarListeners) listener();
    if (calendarListeners.size) scheduleCalendarDay();
  }, millisecondsUntilNextLocalMidnight(now));
}

function startOfLocalDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function millisecondsUntilNextLocalMidnight(timestamp: number): number {
  const next = new Date(timestamp);
  next.setHours(24, 0, 0, 0);
  return Math.max(1, next.getTime() - timestamp);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function MessageIcon({ children }: { readonly children: ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function CopyIcon() {
  return (
    <MessageIcon>
      <rect x="2.5" y="4.5" width="9" height="9" rx="2" />
      <path d="M5 4V3.5a2 2 0 0 1 2-2h5.5a2 2 0 0 1 2 2V9a2 2 0 0 1-2 2H12" />
    </MessageIcon>
  );
}

function CheckIcon() {
  return (
    <MessageIcon>
      <path d="m3 8.25 3.15 3.15L13 4.55" />
    </MessageIcon>
  );
}
