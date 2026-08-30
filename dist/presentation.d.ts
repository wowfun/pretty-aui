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
    readonly sessionAge: (value: number, unit: "now" | "minute" | "hour" | "day" | "month" | "year") => string;
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
export declare const defaultLabels: ChatLabels;
//# sourceMappingURL=presentation.d.ts.map