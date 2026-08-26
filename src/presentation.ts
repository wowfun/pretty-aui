/** Host composition selected by the embedding application. */
export type ChatSurface = "inline" | "sidebar";

/** Color preference applied within one chat root. */
export type ChatColorScheme = "light" | "dark" | "system";

/** English presentation strings that can be replaced by the host. */
export interface ChatLabels {
  readonly accept: string;
  readonly agentName: (agent?: string) => string;
  readonly agentOngoing: string;
  readonly agentCompleted: string;
  readonly agentFailed: string;
  readonly agentCancelled: string;
  readonly agentBackground: string;
  readonly agentObserved: (duration: string) => string;
  readonly assistantName: string;
  readonly authRequired: string;
  readonly cancel: string;
  readonly close: string;
  readonly composerPlaceholder: string;
  readonly context: string;
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
  readonly retry: string;
  readonly send: string;
  readonly sessionUntitled: string;
  readonly sessions: string;
  readonly stop: string;
  readonly thinking: string;
  readonly tool: string;
  readonly unsupportedContent: (type: string) => string;
  readonly you: string;
  readonly confirmDeleteSession: (title: string) => string;
  readonly backToSession: (title: string) => string;
}

/** Built-in English labels used by every React and standalone surface. */
export const defaultLabels: ChatLabels = {
  accept: "Continue",
  agentName: (agent) => (agent ? `${titleCase(agent)} Agent` : "Agent"),
  agentOngoing: "Ongoing",
  agentCompleted: "Completed",
  agentFailed: "Failed",
  agentCancelled: "Cancelled",
  agentBackground: "Started in background",
  agentObserved: (duration) => `Observed ${duration}`,
  assistantName: "Assistant",
  authRequired: "Authentication required",
  cancel: "Cancel",
  close: "Close",
  composerPlaceholder: "Ask anything…",
  context: "Context",
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
  retry: "Retry",
  send: "Send",
  sessionUntitled: "Untitled session",
  sessions: "Sessions",
  stop: "Stop",
  thinking: "Think",
  tool: "Tool",
  unsupportedContent: (type) => `Unsupported agent content: ${type}`,
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
