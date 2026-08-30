/** Built-in English labels used by every React and standalone surface. */
export const defaultLabels = {
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
    contextTruncated: (total) => `Context display truncated (${total.toLocaleString()} characters total).`,
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
    pendingInteractions: (count) => `${count} pending ${count === 1 ? "interaction" : "interactions"}`,
    plan: "Plan",
    retry: "Retry",
    removeContext: (label) => `Remove context: ${label}`,
    resource: "Resource",
    scrollToLatest: "Scroll to latest message",
    send: "Send",
    sessionAge: (value, unit) => {
        if (unit === "now")
            return "now";
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
    toolExpandLines: (hidden) => `... more ${hidden.toLocaleString()} ${hidden === 1 ? "line" : "lines"}`,
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
function titleCase(value) {
    return value
        .replaceAll(/[_-]+/g, " ")
        .trim()
        .replaceAll(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
function formatUsage(value) {
    return value < 1_000_000_000_000
        ? value.toLocaleString()
        : value.toExponential(2);
}
//# sourceMappingURL=presentation.js.map