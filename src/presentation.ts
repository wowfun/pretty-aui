/** Host composition selected by the embedding application. */
export type ChatSurface = "inline" | "sidebar";

/** Color preference applied within one chat root. */
export type ChatColorScheme = "light" | "dark" | "system";

/** English presentation strings that can be replaced by the host. */
export interface ChatLabels {
  readonly accept: string;
  readonly addContext: string;
  readonly agentName: (agent?: string) => string;
  readonly agentOngoing: string;
  readonly agentCompleted: string;
  readonly agentFailed: string;
  readonly agentCancelled: string;
  readonly agentBackground: string;
  readonly agentObserved: (duration: string) => string;
  readonly assistantName: string;
  readonly authRequired: string;
  readonly binaryChange: string;
  readonly cancel: string;
  readonly changedFiles: string;
  readonly close: string;
  readonly commands: string;
  readonly composerPlaceholder: string;
  readonly copied: string;
  readonly copy: string;
  readonly contextInjection: string;
  readonly contextSelection: string;
  readonly contextTruncated: (total: number) => string;
  readonly decline: string;
  readonly deleteSession: string;
  readonly emptyDescription: string;
  readonly emptyTitle: string;
  readonly error: string;
  readonly finish: string;
  readonly historyGap: string;
  readonly historyGapTitle: string;
  readonly loadMore: string;
  readonly newChat: string;
  readonly noSessions: string;
  readonly openLink: string;
  readonly openChildSession: string;
  readonly permission: string;
  readonly pendingInteractions: (count: number) => string;
  readonly plan: string;
  readonly retry: string;
  readonly removeContext: (label: string) => string;
  readonly resource: string;
  readonly scrollToLatest: string;
  readonly send: string;
  readonly sessionAge: (
    value: number,
    unit: "now" | "minute" | "hour" | "day" | "month" | "year",
  ) => string;
  readonly sessionActions: (title: string) => string;
  readonly sessionPhase: (phase: string) => string;
  readonly sessionUntitled: string;
  readonly sessions: string;
  readonly stop: string;
  readonly thinking: string;
  readonly terminalOutputInActivity: string;
  readonly tool: string;
  readonly toolCollapseLines: string;
  readonly toolExpandLines: (hidden: number) => string;
  readonly toolInput: string;
  readonly toolNoOutput: string;
  readonly toolOutput: string;
  readonly toolResult: string;
  readonly unsupportedContent: (type: string) => string;
  readonly unsafeResourceLink: string;
  readonly usage: (used: number, size: number) => string;
  readonly you: string;
  readonly confirmDeleteSession: (title: string) => string;
  readonly backToSession: (title: string) => string;
}

/** Built-in English labels used by every React and standalone surface. */
export const defaultLabels: ChatLabels = {
  accept: "Continue",
  addContext: "Add context",
  agentName: (agent) => (agent ? `${titleCase(agent)} Agent` : "Agent"),
  agentOngoing: "Ongoing",
  agentCompleted: "Completed",
  agentFailed: "Failed",
  agentCancelled: "Cancelled",
  agentBackground: "Started in background",
  agentObserved: (duration) => `Observed ${duration}`,
  assistantName: "Assistant",
  authRequired: "Authentication required",
  binaryChange: "Binary or structural change",
  cancel: "Cancel",
  changedFiles: "Changed files",
  close: "Close",
  commands: "Commands",
  composerPlaceholder: "Ask anything…",
  copied: "Copied",
  copy: "Copy",
  contextInjection: "Context injection",
  contextSelection: "Context for next prompt",
  contextTruncated: (total) =>
    `Context display truncated (${total.toLocaleString()} characters total).`,
  decline: "Decline",
  deleteSession: "Delete session",
  emptyDescription: "Messages, tool activity, and plans will appear here.",
  emptyTitle: "Start a conversation",
  error: "Something went wrong",
  finish: "I've finished",
  historyGap: "Earlier messages are unavailable for this session.",
  historyGapTitle: "Partial history",
  loadMore: "Load more",
  newChat: "New chat",
  noSessions: "No previous sessions",
  openLink: "Open link",
  openChildSession: "Open child session",
  permission: "Permission required",
  pendingInteractions: (count) =>
    `${count} pending ${count === 1 ? "interaction" : "interactions"}`,
  plan: "Plan",
  retry: "Retry",
  removeContext: (label) => `Remove context: ${label}`,
  resource: "Resource",
  scrollToLatest: "Scroll to latest message",
  send: "Send",
  sessionAge: (value, unit) => {
    if (unit === "now") return "now";
    const suffix = {
      minute: "m",
      hour: "h",
      day: "d",
      month: "mo",
      year: "y",
    }[unit];
    return `${value}${suffix}`;
  },
  sessionActions: (title) => `Actions for ${title}`,
  sessionPhase: (phase) => titleCase(phase),
  sessionUntitled: "Untitled session",
  sessions: "Sessions",
  stop: "Stop",
  thinking: "Thinking",
  terminalOutputInActivity: "Terminal output is shown in the activity stream.",
  tool: "Tool",
  toolCollapseLines: "Show less",
  toolExpandLines: (hidden) =>
    `... more ${hidden.toLocaleString()} ${hidden === 1 ? "line" : "lines"}`,
  toolInput: "Input",
  toolNoOutput: "No output",
  toolOutput: "Output",
  toolResult: "tool result",
  unsupportedContent: (type) => `Unsupported agent content: ${type}`,
  unsafeResourceLink: "unsafe resource link",
  usage: (used, size) => `${formatUsage(used)} / ${formatUsage(size)}`,
  you: "You",
  confirmDeleteSession: (title) => `Delete “${title}”?`,
  backToSession: (title) => `Back to ${title}`,
};

function titleCase(value: string): string {
  return value
    .replaceAll(/[_-]+/g, " ")
    .trim()
    .replaceAll(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function formatUsage(value: number): string {
  return value < 1_000_000_000_000
    ? value.toLocaleString()
    : value.toExponential(2);
}
