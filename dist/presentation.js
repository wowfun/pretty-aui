/** Built-in English labels used by every React and standalone surface. */
export const defaultLabels = {
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
function titleCase(value) {
    return value
        .replaceAll(/[_-]+/g, " ")
        .trim()
        .replaceAll(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
//# sourceMappingURL=presentation.js.map