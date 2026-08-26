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
export declare const defaultLabels: ChatLabels;
//# sourceMappingURL=presentation.d.ts.map