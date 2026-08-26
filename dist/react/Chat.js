import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DOMPurify from "isomorphic-dompurify";
import { Marked, Renderer } from "marked";
import { Component, createContext, memo, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, } from "react";
import { createChat } from "../core/chat-controller.js";
import { defaultLabels } from "./types.js";
const ChatContext = createContext(undefined);
const controllerKeys = new WeakMap();
let controllerKeyCounter = 0;
const CONNECTING_SNAPSHOT = {
    phase: "connecting",
    sessionTrail: [],
    historyGap: false,
    activities: [],
    contextItems: [],
    configOptions: [],
    commands: [],
    interactions: [],
    authMethods: [],
    capabilities: {
        listSessions: false,
        loadSession: false,
        resumeSession: false,
        closeSession: false,
        deleteSession: false,
    },
};
const CONNECTING_CONTROLLER = {
    ready: new Promise(() => undefined),
    getSnapshot: () => CONNECTING_SNAPSHOT,
    subscribe: () => () => undefined,
    send() {
        throw new Error("The chat session is still connecting");
    },
    async cancel() { },
    async reconnect() { },
    async newSession() { },
    async listSessions() {
        return { sessions: [] };
    },
    async openSession() { },
    async openChildSession() { },
    async openAncestorSession() { },
    async closeSession() { },
    async deleteSession() { },
    async setConfigOption() { },
    async authenticate() { },
    async logout() { },
    respondPermission: () => false,
    respondElicitation: () => false,
    async destroy() { },
};
function useChatContext(macro) {
    const value = useContext(ChatContext);
    if (!value) {
        throw new Error(`pretty-aui: ${macro} must be rendered inside a ChatRoot.`);
    }
    return value;
}
/**
 * Renders the normalized chat timeline and ACP interactions.
 *
 * A controller created from `options` is destroyed on unmount. A controller
 * passed through `controller` remains owned by the caller.
 */
export function Chat(props) {
    return (_jsxs(ChatRoot, { ...props, children: [_jsx(ChatHeader, {}), _jsx(ChatTranscript, {}), _jsx(ChatInteractions, {}), _jsx(ChatComposer, {})] }));
}
/** Owns or borrows one controller and provides one snapshot subscription. */
export function ChatRoot(props) {
    if ("controller" in props) {
        const { controller, ...presentation } = props;
        return (_jsx(SubscribedChatRoot, { ...presentation, controller: controller }, controllerKey(controller)));
    }
    const { options, ...presentation } = props;
    return _jsx(OwnedChatRoot, { ...presentation, options: options });
}
function OwnedChatRoot(props) {
    const { options, ...presentation } = props;
    const immutableOptions = useRef(options);
    const [controller, setController] = useState();
    useEffect(() => {
        const ownedController = createChat(immutableOptions.current);
        setController(ownedController);
        return () => {
            void ownedController.destroy();
        };
    }, []);
    if (!controller) {
        return (_jsx(SubscribedChatRoot, { ...presentation, controller: CONNECTING_CONTROLLER }, "connecting"));
    }
    return (_jsx(SubscribedChatRoot, { ...presentation, controller: controller }, controllerKey(controller)));
}
function SubscribedChatRoot(props) {
    const { controller } = props;
    const snapshot = useSyncExternalStore(useCallback((listener) => subscribeOnAnimationFrame(controller, listener), [controller]), useCallback(() => controller.getSnapshot(), [controller]), useCallback(() => controller.getSnapshot(), [controller]));
    const labels = useMemo(() => ({ ...defaultLabels, ...props.labels }), [props.labels]);
    const id = useId().replaceAll(":", "");
    const [actionError, setActionError] = useState();
    const runAction = useCallback((operation) => {
        setActionError(undefined);
        void operation().catch((reason) => {
            setActionError(reason instanceof Error ? reason.message : String(reason));
        });
    }, []);
    const colorScheme = props.colorScheme ?? "system";
    const surface = props.surface ?? "inline";
    const value = useMemo(() => ({
        controller,
        snapshot,
        labels,
        toolActivityRenderer: props.toolActivityRenderer,
        actionError,
        runAction,
        ids: {
            instance: `paui-${id}`,
            sessionsTitle: `paui-${id}-sessions-title`,
        },
    }), [
        actionError,
        controller,
        id,
        labels,
        props.toolActivityRenderer,
        runAction,
        snapshot,
    ]);
    return (_jsx("section", { className: ["pretty-aui", props.className].filter(Boolean).join(" "), "data-pretty-aui-slot": "root", "data-surface": surface, "data-scheme": colorScheme, "data-phase": snapshot.phase, style: props.style, "aria-label": snapshot.agentName ?? labels.assistantName, children: _jsx(ChatContext.Provider, { value: value, children: props.children }) }));
}
/** Renders session identity, protocol state, new-session, and history actions. */
export function ChatHeader() {
    const { controller, snapshot, labels, runAction } = useChatContext("ChatHeader");
    const [sessionsOpen, setSessionsOpen] = useState(false);
    const currentTitle = snapshot.sessionTitle ?? labels.sessionUntitled;
    const parent = snapshot.sessionTrail.at(-1);
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "paui-header", "data-pretty-aui-slot": "header", children: [_jsxs("div", { className: `paui-identity${parent ? " paui-identity--child" : ""}`, children: [_jsx("span", { className: "paui-presence", "data-phase": snapshot.phase, "aria-hidden": "true" }), parent ? (_jsxs("div", { className: "paui-lineage", "data-depth": snapshot.sessionTrail.length, children: [_jsx("button", { className: "paui-lineage__back", type: "button", disabled: snapshot.phase !== "idle", "aria-label": labels.backToSession(parent.title ?? parent.sessionId), onClick: () => runAction(() => controller.openAncestorSession(parent.sessionId)), children: _jsx(BackIcon, {}) }), _jsxs("div", { className: "paui-lineage__titles", children: [snapshot.sessionTrail.map((ancestor) => {
                                                const title = ancestor.title ?? ancestor.sessionId;
                                                return (_jsxs("span", { className: "paui-lineage__ancestor", children: [_jsx("button", { type: "button", disabled: snapshot.phase !== "idle", onClick: () => runAction(() => controller.openAncestorSession(ancestor.sessionId)), children: title }), _jsx("span", { "aria-hidden": "true", children: "/" })] }, ancestor.sessionId));
                                            }), _jsx("strong", { children: currentTitle })] }), _jsx("span", { className: "paui-protocol", children: snapshot.protocolVersion
                                            ? `ACP v${snapshot.protocolVersion}`
                                            : snapshot.phase })] })) : (_jsxs("div", { children: [_jsx("strong", { children: currentTitle }), _jsx("span", { className: "paui-protocol", children: snapshot.protocolVersion
                                            ? `ACP v${snapshot.protocolVersion}`
                                            : snapshot.phase })] }))] }), _jsxs("div", { className: "paui-header__actions", children: [snapshot.capabilities.listSessions ? (_jsxs("button", { className: "paui-icon-button", type: "button", onClick: () => setSessionsOpen(true), children: [_jsx(HistoryIcon, {}), _jsx("span", { className: "paui-sr-only", children: labels.sessions })] })) : null, _jsxs("button", { className: "paui-icon-button", type: "button", disabled: snapshot.phase !== "idle", onClick: () => runAction(() => controller.newSession()), children: [_jsx(NewChatIcon, {}), _jsx("span", { className: "paui-sr-only", children: labels.newChat })] })] })] }), sessionsOpen ? (_jsx(SessionDrawer, { controller: controller, snapshot: snapshot, labels: labels, onClose: () => setSessionsOpen(false) })) : null] }));
}
/** Renders normalized conversation history and owns transcript scrolling. */
export function ChatTranscript() {
    const { snapshot, labels, toolActivityRenderer } = useChatContext("ChatTranscript");
    const scrollerRef = useRef(null);
    const contentRef = useRef(null);
    const pinnedRef = useRef(true);
    const lastScrollTopRef = useRef(0);
    const [pinned, setPinned] = useState(true);
    const scrollToBottom = useCallback((behavior = "auto") => {
        const scroller = scrollerRef.current;
        if (!scroller)
            return;
        if (typeof scroller.scrollTo === "function") {
            scroller.scrollTo({ top: scroller.scrollHeight, behavior });
        }
        else {
            scroller.scrollTop = scroller.scrollHeight;
        }
        lastScrollTopRef.current = scroller.scrollTop;
        pinnedRef.current = true;
        setPinned(true);
    }, []);
    const updatePinned = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller)
            return;
        const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        const movedUp = scroller.scrollTop < lastScrollTopRef.current - 1;
        const next = distance <= 24 ? true : movedUp ? false : pinnedRef.current;
        lastScrollTopRef.current = scroller.scrollTop;
        pinnedRef.current = next;
        setPinned(next);
    }, []);
    useLayoutEffect(() => {
        if (pinnedRef.current)
            scrollToBottom();
    }, [scrollToBottom, snapshot.activities, snapshot.historyGap]);
    useEffect(() => {
        const content = contentRef.current;
        if (!content || typeof ResizeObserver === "undefined")
            return;
        const observer = new ResizeObserver(() => {
            if (pinnedRef.current)
                scrollToBottom();
        });
        observer.observe(content);
        if (scrollerRef.current)
            observer.observe(scrollerRef.current);
        return () => observer.disconnect();
    }, [scrollToBottom]);
    const groups = useMemo(() => groupActivities(snapshot.activities), [snapshot.activities]);
    return (_jsxs("main", { ref: scrollerRef, className: "paui-body", "data-pretty-aui-slot": "transcript", tabIndex: 0, onScroll: updatePinned, children: [_jsxs("div", { className: "paui-transcript", ref: contentRef, children: [snapshot.historyGap ? (_jsxs("aside", { className: "paui-notice", role: "status", children: [_jsx(InfoIcon, {}), _jsxs("div", { children: [_jsx("strong", { children: labels.historyGapTitle }), _jsx("span", { children: labels.historyGap })] })] })) : null, !snapshot.activities.length ? (_jsxs("div", { className: "paui-empty", children: [_jsx(SparkIcon, {}), _jsx("strong", { children: labels.emptyTitle }), _jsx("p", { children: labels.emptyDescription })] })) : null, groups.map((group, index) => (_jsx(TurnGroup, { group: group, labels: labels, toolActivityRenderer: toolActivityRenderer, active: index === groups.length - 1 &&
                            (snapshot.phase === "running" ||
                                snapshot.phase === "awaiting_user" ||
                                snapshot.phase === "cancelling") }, group.id)))] }), !pinned ? (_jsx("button", { className: "paui-to-bottom", type: "button", onClick: () => scrollToBottom("smooth"), "aria-label": "Scroll to latest message", children: _jsx(DownIcon, {}) })) : null] }));
}
/** Renders authentication, ACP interactions, and reconnectable errors. */
export function ChatInteractions() {
    const { controller, snapshot, labels, actionError, runAction } = useChatContext("ChatInteractions");
    const interactionsRef = useRef(null);
    const interactionIdentity = snapshot.interactions
        .map((interaction) => interaction.id)
        .join("\u0000");
    useEffect(() => {
        if (!snapshot.interactions.length)
            return;
        const root = interactionsRef.current;
        if (!root)
            return;
        const activeElement = activeElementFor(root);
        if (activeElement && root.contains(activeElement))
            return;
        root.querySelector(FOCUSABLE_SELECTOR)?.focus();
    }, [interactionIdentity, snapshot.interactions.length]);
    return (_jsxs("div", { ref: interactionsRef, className: "paui-interactions", "data-pretty-aui-slot": "interactions", children: [snapshot.phase === "auth_required" ? _jsx(AuthPanel, {}) : null, snapshot.interactions.map((interaction) => interaction.type === "permission" ? (_jsx(PermissionCard, { interaction: interaction, controller: controller, labels: labels }, interaction.id)) : (_jsx(ElicitationCard, { interaction: interaction, controller: controller, labels: labels }, interaction.id))), snapshot.error ? (_jsxs("aside", { className: "paui-error", role: "alert", children: [_jsxs("div", { children: [_jsx("strong", { children: labels.error }), _jsx("span", { children: snapshot.error.message })] }), snapshot.error.retryable ? (_jsx("button", { type: "button", onClick: () => runAction(() => controller.reconnect()), children: labels.retry })) : null] })) : null, actionError && !snapshot.error ? (_jsx("aside", { className: "paui-error", role: "alert", children: _jsxs("div", { children: [_jsx("strong", { children: labels.error }), _jsx("span", { children: actionError })] }) })) : null] }));
}
function groupActivities(activities) {
    const groups = [];
    let id = "opening";
    let user;
    let groupedActivities = [];
    const flush = () => {
        if (user || groupedActivities.length) {
            groups.push({
                id,
                ...(user ? { user } : {}),
                activities: groupedActivities,
            });
        }
    };
    for (const activity of activities) {
        if (activity.type === "message" && activity.role === "user") {
            flush();
            id = activity.id;
            user = activity;
            groupedActivities = [];
        }
        else {
            groupedActivities.push(activity);
        }
    }
    flush();
    return groups;
}
function TurnGroup({ group, labels, toolActivityRenderer, active, }) {
    return (_jsxs("article", { className: "paui-turn", children: [group.user ? _jsx(MessageView, { message: group.user, labels: labels }) : null, group.activities.length ? (_jsx("div", { className: "paui-activities", children: group.activities.map((activity, index) => (_jsx(ActivityRow, { activity: activity, labels: labels, toolActivityRenderer: toolActivityRenderer, running: active && index === group.activities.length - 1 }, activity.id))) })) : null] }));
}
const ActivityRow = memo(function ActivityRow({ activity, labels, toolActivityRenderer, running, }) {
    return (_jsx("div", { className: "paui-activity", "data-pretty-aui-slot": "activity", "data-kind": activity.type === "message"
            ? activity.role
            : activity.type === "tool" && activity.subagent
                ? "subagent"
                : activity.type, "data-status": activityStatus(activity), children: _jsx(ActivityView, { activity: activity, labels: labels, toolActivityRenderer: toolActivityRenderer, running: running }) }));
});
function ActivityView({ activity, labels, toolActivityRenderer, running, }) {
    switch (activity.type) {
        case "message":
            return (_jsx(MessageView, { message: activity, labels: labels, running: running }));
        case "tool":
            if (activity.subagent) {
                return (_jsx(SubagentActivity, { tool: activity, labels: labels, renderer: toolActivityRenderer }));
            }
            return (_jsxs("details", { className: "paui-disclosure paui-tool", "data-state": activity.status, children: [_jsxs("summary", { className: "paui-flow-summary", children: [_jsx(DisclosureLeading, { icon: _jsx(ToolKindIcon, { kind: activity.kind }) }), _jsx("span", { className: "paui-flow-title", children: flowTitle(activity.kind, labels.tool) }), _jsx("span", { className: "paui-flow-separator", "aria-hidden": "true" }), _jsx("span", { className: "paui-flow-preview", children: activity.title }), _jsx("span", { className: "paui-sr-only", children: activity.status })] }), _jsx("div", { className: "paui-disclosure__body", children: _jsx(ToolBody, { tool: activity, labels: labels, renderer: toolActivityRenderer }) })] }));
        case "plan":
            return (_jsxs("details", { className: "paui-disclosure paui-plan", open: true, children: [_jsxs("summary", { children: [_jsx(PlanIcon, {}), _jsx("span", { children: "Plan" }), _jsx(StatusBadge, { status: planStatus(activity.entries) })] }), _jsx("ol", { className: "paui-plan__list", children: activity.entries.map((entry, index) => (_jsxs("li", { "data-status": entry.status, children: [_jsx("span", { className: "paui-plan__mark", "aria-hidden": "true" }), _jsx("span", { children: entry.content })] }, `${entry.content}-${index}`))) })] }));
        case "terminal":
            return (_jsxs("details", { className: "paui-disclosure paui-terminal", children: [_jsxs("summary", { children: [_jsx(TerminalIcon, {}), _jsx("span", { children: activity.title }), _jsx(StatusBadge, { status: activity.exited ? "completed" : "in_progress" })] }), _jsx("pre", { children: activity.output })] }));
        case "unsupported":
            return (_jsx("div", { className: "paui-unsupported", children: labels.unsupportedContent(activity.kind) }));
    }
}
function SubagentActivity({ tool, labels, renderer, }) {
    const { controller, snapshot, runAction } = useChatContext("ChatTranscript");
    const subagent = tool.subagent;
    const running = tool.status === "pending" || tool.status === "in_progress";
    const observed = useObservedDuration(tool.id, running);
    const status = subagentStatus(tool, labels);
    const canOpen = snapshot.capabilities.loadSession || snapshot.capabilities.resumeSession;
    return (_jsxs("div", { className: "paui-subagent-row", children: [_jsxs("details", { className: "paui-disclosure paui-subagent", "data-state": tool.status, "data-running": running || undefined, children: [_jsxs("summary", { className: "paui-flow-summary", children: [_jsx(DisclosureLeading, { icon: _jsx(AgentIcon, {}) }), _jsx("span", { className: "paui-flow-title", children: labels.agentName(subagent.agent) }), subagent.description ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "paui-flow-separator", "aria-hidden": "true" }), _jsx("span", { className: "paui-flow-preview", children: subagent.description })] })) : null, _jsxs("span", { className: "paui-subagent-status", "data-status": tool.status, children: [running ? (_jsxs("span", { className: "paui-subagent-status__ongoing", children: [_jsx("span", { className: "paui-subagent-status__spinner", "aria-hidden": "true" }), _jsx("span", { children: labels.agentOngoing })] })) : (_jsx("span", { children: status })), observed ? _jsx("span", { children: labels.agentObserved(observed) }) : null] })] }), _jsx("div", { className: "paui-disclosure__body", children: _jsx(ToolBody, { tool: tool, labels: labels, renderer: renderer }) })] }), subagent.sessionId ? (_jsx("button", { className: "paui-subagent-open", type: "button", disabled: !canOpen || snapshot.phase !== "idle", "aria-label": labels.openChildSession, onClick: () => runAction(() => controller.openChildSession(subagent.sessionId)), children: _jsx(OpenChildIcon, {}) })) : null] }));
}
function useObservedDuration(id, running) {
    const startedAt = useRef(Date.now());
    const [now, setNow] = useState(startedAt.current);
    useEffect(() => {
        startedAt.current = Date.now();
        setNow(startedAt.current);
    }, [id]);
    useEffect(() => {
        if (!running)
            return;
        const interval = window.setInterval(() => setNow(Date.now()), 1_000);
        return () => window.clearInterval(interval);
    }, [running]);
    return running ? formatObservedDuration(now - startedAt.current) : undefined;
}
function formatObservedDuration(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1_000));
    if (seconds < 60)
        return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    if (minutes < 60)
        return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}
function subagentStatus(tool, labels) {
    if (tool.subagent?.background && tool.status === "completed") {
        return labels.agentBackground;
    }
    if (tool.status === "completed")
        return labels.agentCompleted;
    if (tool.status === "failed")
        return labels.agentFailed;
    if (tool.status === "cancelled")
        return labels.agentCancelled;
    return flowTitle(tool.status, labels.agentCompleted);
}
function MessageView({ message, labels, running = false, }) {
    if (message.role === "thought") {
        return (_jsx(ThoughtDisclosure, { message: message, labels: labels, running: running }));
    }
    return (_jsxs("div", { className: "paui-message", "data-pretty-aui-slot": "message", "data-role": message.role, "data-pending": message.pending || undefined, "aria-live": message.role === "assistant" && running ? "polite" : undefined, "aria-atomic": message.role === "assistant" && running ? "false" : undefined, children: [_jsx("span", { className: "paui-message__label", children: message.role === "user" ? labels.you : labels.assistantName }), _jsx("div", { className: "paui-message__content", children: message.content.map((block, index) => (_jsx(ContentView, { block: block, labels: labels }, index))) })] }));
}
function ThoughtDisclosure({ message, labels, running, }) {
    const previewRef = useRef(null);
    const preview = thoughtPreview(message.content, running);
    useLayoutEffect(() => {
        const element = previewRef.current;
        if (!element)
            return;
        element.scrollLeft = running
            ? element.scrollWidth - element.clientWidth
            : 0;
    }, [preview, running]);
    return (_jsxs("details", { className: "paui-thought", "data-running": running || undefined, children: [_jsxs("summary", { className: "paui-flow-summary", children: [_jsx(DisclosureLeading, { icon: _jsx(ThoughtIcon, {}) }), _jsx("span", { className: "paui-flow-title", children: labels.thinking }), preview ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "paui-flow-separator", "aria-hidden": "true" }), _jsx("span", { ref: previewRef, className: "paui-flow-preview", "data-follow-end": running || undefined, children: preview })] })) : null] }), _jsx("div", { className: "paui-thought__body", children: message.content.map((block, index) => (_jsx(ContentView, { block: block, labels: labels }, index))) })] }));
}
function DisclosureLeading({ icon }) {
    return (_jsxs("span", { className: "paui-flow-leading", "aria-hidden": "true", children: [_jsx("span", { className: "paui-flow-icon", children: icon }), _jsx("span", { className: "paui-flow-chevron", children: _jsx(ChevronIcon, {}) })] }));
}
function thoughtPreview(content, running) {
    if (running) {
        for (let index = content.length - 1; index >= 0; index -= 1) {
            const text = contentPlainText(content[index]).trimEnd();
            if (!text)
                continue;
            return text
                .slice(text.lastIndexOf("\n") + 1)
                .replace(/\r$/, "")
                .trim();
        }
        return "";
    }
    const text = content
        .map(contentPlainText)
        .filter(Boolean)
        .join("\n")
        .trimEnd();
    if (!text)
        return "";
    const lines = text.split(/\r?\n/);
    return lines[0]?.trim() ?? "";
}
function contentPlainText(block) {
    if (block.type === "text" && typeof block.text === "string") {
        return block.text;
    }
    if (block.type === "resource" &&
        isRecord(block.resource) &&
        typeof block.resource.text === "string") {
        return block.resource.text;
    }
    return "";
}
function flowTitle(value, fallback) {
    if (!value)
        return fallback;
    const words = value.replaceAll(/[_-]+/g, " ").trim();
    return words ? `${words[0].toUpperCase()}${words.slice(1)}` : fallback;
}
function ToolKindIcon({ kind }) {
    const normalized = kind?.toLowerCase() ?? "";
    if (normalized.includes("read") ||
        normalized.includes("browse") ||
        normalized.includes("context")) {
        return _jsx(ReadToolIcon, {});
    }
    if (normalized.includes("search") || normalized.includes("find")) {
        return _jsx(SearchToolIcon, {});
    }
    if (normalized.includes("bash") ||
        normalized.includes("shell") ||
        normalized.includes("terminal") ||
        normalized.includes("execute")) {
        return _jsx(TerminalIcon, {});
    }
    return _jsx(ToolIcon, {});
}
function ToolBody({ tool, labels, renderer, }) {
    const fallback = _jsx(DefaultToolBody, { tool: tool, labels: labels });
    return renderer ? (_jsx(ToolRendererBoundary, { fallback: fallback, resetKey: tool.id, children: _jsx(CustomToolBody, { tool: tool, renderer: renderer, fallback: fallback }) }, tool.id)) : (fallback);
}
function DefaultToolBody({ tool, labels, }) {
    return tool.content.length ? (tool.content.map((content, index) => (_jsx(ToolContentView, { value: content, labels: labels }, index)))) : (_jsx("span", { className: "paui-muted", children: labels.tool }));
}
function CustomToolBody({ tool, renderer, fallback, }) {
    const rendered = renderer(tool);
    return rendered === undefined ? fallback : rendered;
}
class ToolRendererBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error) {
        console.error("pretty-aui: custom tool renderer failed", error);
    }
    componentDidUpdate(previous) {
        if (this.state.failed && previous.resetKey !== this.props.resetKey) {
            this.setState({ failed: false });
        }
    }
    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
function ContentView({ block, labels, }) {
    const markdownHtml = useMemo(() => block.type === "text" && typeof block.text === "string"
        ? renderMarkdown(block.text)
        : undefined, [block]);
    if (markdownHtml !== undefined) {
        return (_jsx("div", { className: "paui-markdown", dangerouslySetInnerHTML: { __html: markdownHtml } }));
    }
    if (block.type === "image" &&
        typeof block.data === "string" &&
        typeof block.mimeType === "string" &&
        block.mimeType.startsWith("image/")) {
        return (_jsx("img", { className: "paui-media", src: `data:${block.mimeType};base64,${block.data}`, alt: "" }));
    }
    if (block.type === "audio" &&
        typeof block.data === "string" &&
        typeof block.mimeType === "string" &&
        block.mimeType.startsWith("audio/")) {
        return (_jsx("audio", { className: "paui-media", controls: true, src: `data:${block.mimeType};base64,${block.data}` }));
    }
    if (block.type === "resource_link" && typeof block.uri === "string") {
        const title = typeof block.title === "string"
            ? block.title
            : typeof block.name === "string"
                ? block.name
                : block.uri;
        return safeUrl(block.uri) ? (_jsxs("a", { className: "paui-resource", href: block.uri, target: "_blank", rel: "noreferrer", children: [_jsx(LinkIcon, {}), _jsx("span", { children: title })] })) : (_jsx("span", { className: "paui-unsupported", children: labels.unsupportedContent("unsafe resource link") }));
    }
    if (block.type === "resource" && isRecord(block.resource)) {
        const resource = block.resource;
        const uri = typeof resource.uri === "string" ? resource.uri : "Resource";
        if (typeof resource.text === "string") {
            return (_jsxs("details", { className: "paui-resource", children: [_jsxs("summary", { children: [_jsx(FileIcon, {}), uri] }), _jsx("pre", { children: resource.text })] }));
        }
        return (_jsxs("span", { className: "paui-resource", children: [_jsx(FileIcon, {}), uri] }));
    }
    return (_jsx("span", { className: "paui-unsupported", children: labels.unsupportedContent(block.type) }));
}
function ToolContentView({ value, labels, }) {
    if (!isRecord(value))
        return null;
    if (value.type === "content" &&
        isRecord(value.content) &&
        typeof value.content.type === "string") {
        return (_jsx(ContentView, { block: value.content, labels: labels }));
    }
    if (value.type === "diff") {
        const path = typeof value.path === "string" ? value.path : "Changed files";
        const patch = typeof value.patch === "string"
            ? value.patch
            : typeof value.newText === "string"
                ? value.newText
                : undefined;
        return (_jsxs("details", { className: "paui-diff", children: [_jsxs("summary", { children: [_jsx(DiffIcon, {}), path] }), patch ? (_jsx("pre", { children: patch })) : (_jsx("span", { className: "paui-muted", children: "Binary or structural change" }))] }));
    }
    if (value.type === "terminal") {
        return (_jsxs("span", { className: "paui-muted", children: [_jsx(TerminalIcon, {}), " Terminal output is shown in the activity stream."] }));
    }
    return (_jsx("span", { className: "paui-unsupported", children: labels.unsupportedContent(typeof value.type === "string" ? value.type : "tool result") }));
}
/** Renders draft entry, commands, context, configuration, send, and cancel. */
export function ChatComposer() {
    const { controller, snapshot, labels, runAction, ids } = useChatContext("ChatComposer");
    const [value, setValue] = useState("");
    const [commandIndex, setCommandIndex] = useState(0);
    const [commandsDismissed, setCommandsDismissed] = useState(false);
    const composingRef = useRef(false);
    const textareaRef = useRef(null);
    const sessionRef = useRef(snapshot.sessionId);
    const placement = snapshot.activities.length ||
        snapshot.interactions.length ||
        snapshot.phase === "auth_required" ||
        snapshot.error
        ? "docked"
        : "hero";
    useEffect(() => {
        if (sessionRef.current !== snapshot.sessionId) {
            const previousSessionId = sessionRef.current;
            sessionRef.current = snapshot.sessionId;
            if (previousSessionId !== undefined)
                setValue("");
        }
    }, [snapshot.sessionId]);
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;
        textarea.style.height = "0px";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 336)}px`;
    }, [placement, value]);
    const disabled = !snapshot.sessionId ||
        snapshot.phase === "connecting" ||
        snapshot.phase === "auth_required" ||
        snapshot.phase === "closed";
    const running = snapshot.phase === "running" ||
        snapshot.phase === "awaiting_user" ||
        snapshot.phase === "cancelling";
    const submit = () => {
        const prompt = value.trim();
        if (!prompt || disabled || running)
            return;
        setValue("");
        setCommandsDismissed(true);
        try {
            const turn = controller.send(prompt);
            void turn.done.catch(() => {
                setValue((current) => current || prompt);
            });
        }
        catch {
            setValue(prompt);
        }
    };
    const matchingCommands = value.startsWith("/") && !/\s/.test(value.slice(1)) && !commandsDismissed
        ? snapshot.commands
            .filter((command) => command.name.startsWith(value.slice(1).split(/\s/, 1)[0] ?? ""))
            .slice(0, 5)
        : [];
    const selectedCommandIndex = Math.min(commandIndex, Math.max(0, matchingCommands.length - 1));
    const chooseCommand = (name) => {
        setValue(`/${name} `);
        setCommandsDismissed(true);
        textareaRef.current?.focus();
    };
    const onKeyDown = (event) => {
        if (event.repeat)
            return;
        if (matchingCommands.length && event.key === "ArrowDown") {
            event.preventDefault();
            setCommandIndex((selectedCommandIndex + 1) % matchingCommands.length);
            return;
        }
        if (matchingCommands.length && event.key === "ArrowUp") {
            event.preventDefault();
            setCommandIndex((selectedCommandIndex - 1 + matchingCommands.length) %
                matchingCommands.length);
            return;
        }
        if (matchingCommands.length && event.key === "Escape") {
            event.preventDefault();
            setCommandsDismissed(true);
            return;
        }
        if (event.key === "Enter" &&
            !event.shiftKey &&
            !composingRef.current &&
            !event.nativeEvent.isComposing) {
            event.preventDefault();
            const command = matchingCommands[selectedCommandIndex];
            if (command)
                chooseCommand(command.name);
            else
                submit();
        }
    };
    const commandsId = `${ids.instance}-commands`;
    return (_jsxs("footer", { className: "paui-composer-wrap", "data-pretty-aui-slot": "composer", "data-placement": placement, children: [snapshot.contextItems.length ? (_jsx("div", { className: "paui-context", "aria-label": labels.context, children: snapshot.contextItems.map((item) => (_jsxs("span", { children: [_jsx(ContextIcon, {}), item.label] }, item.id))) })) : null, matchingCommands.length ? (_jsx("div", { className: "paui-commands", role: "listbox", id: commandsId, "aria-label": "Commands", children: matchingCommands.map((command, index) => (_jsxs("button", { type: "button", id: `${commandsId}-${index}`, role: "option", "aria-selected": index === selectedCommandIndex, onMouseDown: (event) => event.preventDefault(), onClick: () => chooseCommand(command.name), children: [_jsxs("code", { children: ["/", command.name] }), _jsx("span", { children: command.description })] }, command.name))) })) : null, _jsxs("div", { className: "paui-composer", "data-pretty-aui-slot": "composer-input", children: [_jsx("textarea", { ref: textareaRef, rows: 1, value: value, disabled: disabled, placeholder: labels.composerPlaceholder, "aria-label": labels.composerPlaceholder, role: "combobox", "aria-autocomplete": "list", "aria-haspopup": "listbox", "aria-controls": matchingCommands.length ? commandsId : undefined, "aria-expanded": Boolean(matchingCommands.length), "aria-activedescendant": matchingCommands.length
                            ? `${commandsId}-${selectedCommandIndex}`
                            : undefined, onInput: (event) => {
                            setValue(event.currentTarget.value);
                            setCommandIndex(0);
                            setCommandsDismissed(false);
                        }, onCompositionStart: () => {
                            composingRef.current = true;
                        }, onCompositionEnd: () => {
                            composingRef.current = false;
                        }, onKeyDown: onKeyDown }), _jsxs("div", { className: "paui-composer__actions", "data-pretty-aui-slot": "composer-actions", children: [snapshot.configOptions.length ? (_jsx(ConfigBar, { controller: controller, options: snapshot.configOptions })) : (_jsx("span", {})), running ? (_jsxs("button", { className: "paui-send paui-stop", type: "button", onMouseDown: (event) => event.preventDefault(), onClick: () => runAction(() => controller.cancel()), disabled: snapshot.phase === "cancelling", children: [_jsx(StopIcon, {}), _jsx("span", { className: "paui-sr-only", children: labels.stop })] })) : (_jsxs("button", { className: "paui-send", type: "button", onMouseDown: (event) => event.preventDefault(), onClick: submit, disabled: disabled || !value.trim(), children: [_jsx(SendIcon, {}), _jsx("span", { className: "paui-sr-only", children: labels.send })] }))] })] })] }));
}
function ConfigBar({ controller, options, }) {
    const { runAction } = useChatContext("ChatComposer");
    return (_jsx("div", { className: "paui-config", children: options.map((option) => option.type === "boolean" ? (_jsxs("label", { title: option.description, children: [_jsx("input", { type: "checkbox", checked: Boolean(option.currentValue), onChange: (event) => runAction(() => controller.setConfigOption(option.id, event.target.checked)) }), _jsx("span", { children: option.name })] }, option.id)) : option.type === "select" ? (_jsxs("label", { title: option.description, children: [_jsx("span", { className: "paui-sr-only", children: option.name }), _jsx("select", { value: String(option.currentValue), onChange: (event) => runAction(() => controller.setConfigOption(option.id, event.target.value)), children: option.options?.map((choice) => (_jsx("option", { value: choice.value, children: choice.name }, choice.value))) })] }, option.id)) : null) }));
}
function PermissionCard({ interaction, controller, labels, }) {
    const { ids } = useChatContext("ChatInteractions");
    const titleId = `${ids.instance}-${interaction.id}-title`;
    return (_jsxs("section", { className: "paui-interaction", role: "alertdialog", "aria-labelledby": titleId, children: [_jsx("div", { className: "paui-interaction__icon", children: _jsx(ShieldIcon, {}) }), _jsxs("div", { className: "paui-interaction__content", children: [_jsx("strong", { id: titleId, children: interaction.title || labels.permission }), interaction.description ? _jsx("p", { children: interaction.description }) : null, _jsxs("div", { className: "paui-interaction__actions", children: [interaction.options.map((option, index) => (_jsx("button", { type: "button", className: option.kind.startsWith("reject")
                                    ? "paui-button-secondary"
                                    : index === 0
                                        ? "paui-button-primary"
                                        : "paui-button-secondary", onClick: () => controller.respondPermission(interaction.id, {
                                    outcome: "selected",
                                    optionId: option.id,
                                }), children: option.name }, option.id))), _jsx("button", { type: "button", className: "paui-button-ghost", onClick: () => controller.respondPermission(interaction.id, {
                                    outcome: "cancelled",
                                }), children: labels.cancel })] })] })] }));
}
function ElicitationCard({ interaction, controller, labels, }) {
    const { ids } = useChatContext("ChatInteractions");
    const titleId = `${ids.instance}-${interaction.id}-title`;
    if (interaction.mode === "url" && interaction.url) {
        const canOpen = safeUrl(interaction.url);
        return (_jsxs("section", { className: "paui-interaction", role: "dialog", "aria-labelledby": titleId, children: [_jsx("div", { className: "paui-interaction__icon", children: _jsx(LinkIcon, {}) }), _jsxs("div", { className: "paui-interaction__content", children: [_jsx("strong", { id: titleId, children: interaction.message }), _jsx("code", { className: "paui-url", children: interaction.url }), _jsxs("div", { className: "paui-interaction__actions", children: [_jsx("button", { className: "paui-button-primary", type: "button", disabled: !canOpen, onClick: () => canOpen
                                        ? window.open(interaction.url, "_blank", "noopener,noreferrer")
                                        : undefined, children: labels.openLink }), _jsx("button", { className: "paui-button-secondary", type: "button", onClick: () => controller.respondElicitation(interaction.id, {
                                        action: "accept",
                                    }), children: labels.finish }), _jsx("button", { className: "paui-button-ghost", type: "button", onClick: () => controller.respondElicitation(interaction.id, {
                                        action: "decline",
                                    }), children: labels.decline })] })] })] }));
    }
    return (_jsx(ElicitationForm, { interaction: interaction, controller: controller, labels: labels, titleId: titleId }));
}
function ElicitationForm({ interaction, controller, labels, titleId, }) {
    const schema = interaction.requestedSchema;
    const properties = isRecord(schema?.properties) ? schema.properties : {};
    const required = Array.isArray(schema?.required)
        ? schema.required.filter((key) => typeof key === "string")
        : [];
    const submit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const content = {};
        for (const [name, property] of Object.entries(properties)) {
            if (!isRecord(property))
                continue;
            if (property.type === "boolean")
                content[name] = data.get(name) === "on";
            else if (property.type === "number" || property.type === "integer") {
                const raw = data.get(name);
                if (typeof raw !== "string" || raw.trim() === "")
                    continue;
                const number = Number(raw);
                if (Number.isFinite(number))
                    content[name] = number;
            }
            else if (property.type === "array")
                content[name] = data.getAll(name).map(String);
            else
                content[name] = String(data.get(name) ?? "");
        }
        controller.respondElicitation(interaction.id, {
            action: "accept",
            content,
        });
    };
    return (_jsxs("form", { className: "paui-interaction paui-form", onSubmit: submit, "aria-labelledby": titleId, children: [_jsx("div", { className: "paui-interaction__icon", children: _jsx(FormIcon, {}) }), _jsxs("div", { className: "paui-interaction__content", children: [_jsx("strong", { id: titleId, children: interaction.message }), _jsx("div", { className: "paui-fields", children: Object.entries(properties).map(([name, raw]) => isRecord(raw) ? (_jsx(ElicitationField, { name: name, schema: raw, required: required.includes(name) }, name)) : null) }), _jsxs("div", { className: "paui-interaction__actions", children: [_jsx("button", { className: "paui-button-primary", type: "submit", children: labels.accept }), _jsx("button", { className: "paui-button-ghost", type: "button", onClick: () => controller.respondElicitation(interaction.id, {
                                    action: "decline",
                                }), children: labels.decline })] })] })] }));
}
function ElicitationField({ name, schema, required, }) {
    const label = typeof schema.title === "string" ? schema.title : name;
    const description = typeof schema.description === "string" ? schema.description : undefined;
    const choices = Array.isArray(schema.enum)
        ? schema.enum.filter((value) => typeof value === "string")
        : [];
    if (schema.type === "boolean") {
        return (_jsxs("label", { className: "paui-field paui-field--check", children: [_jsx("input", { name: name, type: "checkbox" }), _jsx("span", { children: label })] }));
    }
    if (choices.length) {
        return (_jsxs("label", { className: "paui-field", children: [_jsx("span", { children: label }), _jsx("select", { name: name, required: required, children: choices.map((choice) => (_jsx("option", { children: choice }, choice))) }), description ? _jsx("small", { children: description }) : null] }));
    }
    return (_jsxs("label", { className: "paui-field", children: [_jsx("span", { children: label }), _jsx("input", { name: name, required: required, type: schema.type === "number" || schema.type === "integer"
                    ? "number"
                    : "text" }), description ? _jsx("small", { children: description }) : null] }));
}
function AuthPanel() {
    const { controller, snapshot, labels, runAction } = useChatContext("ChatInteractions");
    return (_jsxs("section", { className: "paui-auth", children: [_jsx(ShieldIcon, {}), _jsx("strong", { children: labels.authRequired }), _jsx("div", { children: snapshot.authMethods.map((method) => (_jsx("button", { type: "button", onClick: () => runAction(() => controller.authenticate(method.id)), children: method.name }, method.id))) })] }));
}
function SessionDrawer({ controller, snapshot, labels, onClose, }) {
    const { ids } = useChatContext("ChatHeader");
    const closeRef = useRef(null);
    const dialogRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    useEffect(() => {
        const activeElement = activeElementFor(dialogRef.current);
        const previousFocus = activeElement instanceof HTMLElement ? activeElement : undefined;
        closeRef.current?.focus();
        return () => {
            if (previousFocus?.isConnected)
                previousFocus.focus();
        };
    }, []);
    useEffect(() => {
        if (!snapshot.sessions) {
            setLoading(true);
            void controller
                .listSessions()
                .catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)))
                .finally(() => setLoading(false));
        }
    }, [controller, snapshot.sessions]);
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== "Tab")
                return;
            const focusable = dialogRef.current
                ? [
                    ...dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
                ].filter((element) => !element.hasAttribute("disabled"))
                : [];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (!first || !last)
                return;
            const activeElement = activeElementFor(dialogRef.current);
            if (event.shiftKey && activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && activeElement === last) {
                event.preventDefault();
                first.focus();
            }
            else if (!activeElement ||
                !dialogRef.current?.contains(activeElement)) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    const select = async (sessionId) => {
        setLoading(true);
        setError(undefined);
        try {
            await controller.openSession(sessionId);
            onClose();
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setLoading(false);
        }
    };
    const loadMore = async (cursor) => {
        setLoading(true);
        setError(undefined);
        try {
            await controller.listSessions(cursor);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "paui-drawer-backdrop", role: "presentation", onMouseDown: (event) => {
            if (event.target === event.currentTarget)
                onClose();
        }, children: _jsxs("aside", { ref: dialogRef, className: "paui-drawer", role: "dialog", "aria-modal": "true", "aria-labelledby": ids.sessionsTitle, children: [_jsxs("header", { children: [_jsx("strong", { id: ids.sessionsTitle, children: labels.sessions }), _jsxs("button", { ref: closeRef, className: "paui-icon-button", type: "button", onClick: onClose, children: [_jsx(CloseIcon, {}), _jsx("span", { className: "paui-sr-only", children: labels.close })] })] }), _jsxs("div", { className: "paui-session-list", children: [loading && !snapshot.sessions ? (_jsx("span", { className: "paui-muted", children: "\u2026" })) : null, !loading && !snapshot.sessions?.sessions.length ? (_jsx("span", { className: "paui-muted", children: labels.noSessions })) : null, snapshot.sessions?.sessions.map((session) => (_jsxs("div", { className: "paui-session", "data-active": session.sessionId === snapshot.sessionId || undefined, children: [_jsxs("button", { type: "button", disabled: loading || session.sessionId === snapshot.sessionId, onClick: () => void select(session.sessionId), children: [_jsx("strong", { children: session.title ?? labels.sessionUntitled }), _jsx("span", { children: formatSessionDate(session.updatedAt) })] }), snapshot.capabilities.deleteSession &&
                                    session.sessionId !== snapshot.sessionId ? (_jsxs("button", { className: "paui-icon-button", type: "button", title: labels.deleteSession, onClick: () => {
                                        if (window.confirm(labels.confirmDeleteSession(session.title ?? labels.sessionUntitled)))
                                            void controller
                                                .deleteSession(session.sessionId)
                                                .catch((reason) => setError(reason instanceof Error
                                                ? reason.message
                                                : String(reason)));
                                    }, children: [_jsx(TrashIcon, {}), _jsx("span", { className: "paui-sr-only", children: labels.deleteSession })] })) : null] }, session.sessionId))), snapshot.sessions?.nextCursor ? (_jsx("button", { className: "paui-load-more", type: "button", disabled: loading, onClick: () => void loadMore(snapshot.sessions?.nextCursor), children: labels.loadMore })) : null, error ? (_jsx("span", { className: "paui-error-text", role: "alert", children: error })) : null] })] }) }));
}
function activeElementFor(element) {
    const root = element?.getRootNode();
    if (root instanceof Document || root instanceof ShadowRoot) {
        return root.activeElement;
    }
    return document.activeElement;
}
const markdown = new Marked({ gfm: true, breaks: true });
const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
const markdownRenderer = new Renderer();
markdownRenderer.html = ({ text }) => escapeHtml(text);
markdownRenderer.image = ({ text }) => `<span class="paui-markdown-image-alt">${escapeHtml(text)}</span>`;
markdownRenderer.checkbox = ({ checked }) => (checked ? "[x] " : "[ ] ");
markdownRenderer.link = ({ href, title, tokens }) => {
    const content = escapeHtml(tokens.map((token) => token.raw).join(""));
    if (!safeUrl(href))
        return content;
    return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer"${title ? ` title="${escapeAttribute(title)}"` : ""}>${content}</a>`;
};
markdown.use({ renderer: markdownRenderer });
function renderMarkdown(source) {
    const rendered = markdown.parse(source);
    return DOMPurify.sanitize(rendered, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ["target", "rel"],
        FORBID_TAGS: [
            "style",
            "form",
            "input",
            "button",
            "textarea",
            "select",
            "option",
        ],
        FORBID_ATTR: ["style"],
    });
}
function escapeAttribute(value) {
    return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
function safeUrl(value) {
    try {
        const url = new URL(value, globalThis.location?.href ?? "https://example.invalid");
        return ["http:", "https:", "mailto:"].includes(url.protocol);
    }
    catch {
        return false;
    }
}
function controllerKey(controller) {
    const existing = controllerKeys.get(controller);
    if (existing !== undefined)
        return existing;
    const key = ++controllerKeyCounter;
    controllerKeys.set(controller, key);
    return key;
}
function subscribeOnAnimationFrame(controller, listener) {
    if (typeof globalThis.requestAnimationFrame !== "function") {
        return controller.subscribe(listener);
    }
    let frame;
    let previous = controller.getSnapshot();
    const unsubscribe = controller.subscribe(() => {
        const next = controller.getSnapshot();
        const streaming = previous.phase === "running" && next.phase === "running";
        previous = next;
        if (!streaming) {
            if (frame !== undefined) {
                if (typeof globalThis.cancelAnimationFrame === "function") {
                    globalThis.cancelAnimationFrame(frame);
                }
                frame = undefined;
            }
            listener();
            return;
        }
        if (frame !== undefined)
            return;
        frame = globalThis.requestAnimationFrame(() => {
            frame = undefined;
            listener();
        });
    });
    return () => {
        unsubscribe();
        if (frame !== undefined &&
            typeof globalThis.cancelAnimationFrame === "function") {
            globalThis.cancelAnimationFrame(frame);
        }
    };
}
function planStatus(entries) {
    if (entries.some((entry) => entry.status === "in_progress"))
        return "in_progress";
    if (entries.length && entries.every((entry) => entry.status === "completed"))
        return "completed";
    return "pending";
}
function activityStatus(activity) {
    switch (activity.type) {
        case "tool":
            return activity.status;
        case "plan":
            return planStatus(activity.entries);
        case "terminal":
            return activity.exited ? "completed" : "in_progress";
        case "message":
            return activity.pending ? "pending" : undefined;
        case "unsupported":
            return "unsupported";
    }
}
function formatSessionDate(value) {
    if (!value)
        return "";
    const date = new Date(value);
    return Number.isNaN(date.valueOf())
        ? value
        : SESSION_DATE_FORMATTER.format(date);
}
const SESSION_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function StatusBadge({ status }) {
    return (_jsx("span", { className: "paui-status", "data-status": status, children: status.replaceAll("_", " ") }));
}
function Icon({ children }) {
    return (_jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", focusable: "false", children: children }));
}
const HistoryIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M3 10a7 7 0 1 0 2-4.9M3 3v4h4M10 6v4l3 2" }) }));
const NewChatIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M4 4h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8l-4 3v-3a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3M10 7v5M7.5 9.5h5" }) }));
const CloseIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "m5 5 10 10M15 5 5 15" }) }));
const TrashIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M4 6h12M8 3h4l1 3M6 6l1 11h6l1-11M9 9v5M12 9v5" }) }));
const SendIcon = () => (_jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "M8.3125.9802c.3552.0729.6665.224 0.9502.4521.2245.1807.4676.4256.7168.6748L14.707 6.8347 13.293 8.2487 9 3.9558v11.0859H7V3.9558L2.707 8.2487 1.293 6.8347l4.7275-4.7276c.2492-.2492.4923-.4941.7168-.6748.2393-.1924.5471-.3883.9502-.4521.2098-.0332.4156-.025.625 0Z", fill: "currentColor" }) }));
const StopIcon = () => (_jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false", children: _jsx("rect", { x: "3", y: "3", width: "10", height: "10", rx: "3", fill: "currentColor" }) }));
const DownIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "m5 8 5 5 5-5" }) }));
const BackIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "m12.5 4.5-5 5 5 5" }) }));
const ChevronIcon = () => (_jsx("svg", { viewBox: "0 0 14 14", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "m4 5.5 3 3 3-3" }) }));
const ToolIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M12.5 4.2a4 4 0 0 0-5 5L3 13.7 6.3 17l4.5-4.5a4 4 0 0 0 5-5l-2.3 2.3-3.3-3.3 2.3-2.3Z" }) }));
const AgentIcon = () => (_jsxs(Icon, { children: [_jsx("circle", { cx: "10", cy: "5", r: "2" }), _jsx("circle", { cx: "5", cy: "14", r: "2" }), _jsx("circle", { cx: "15", cy: "14", r: "2" }), _jsx("path", { d: "m8.8 6.7-2.6 5.6M11.2 6.7l2.6 5.6M7 14h6" })] }));
const OpenChildIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M5 5h5v5M10 5 4.5 10.5M9 9h6v6H9" }) }));
const PlanIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M6 5h10M6 10h10M6 15h10M3 5h.01M3 10h.01M3 15h.01" }) }));
const ThoughtIcon = () => (_jsxs("svg", { className: "paui-think-icon", viewBox: "0 0 14 14", "aria-hidden": "true", focusable: "false", children: [_jsx("path", { d: "M7.06431 5.93342C7.68763 5.93342 8.19307 6.43904 8.19322 7.06233C8.19322 7.68573 7.68772 8.19123 7.06431 8.19123C6.44099 8.19113 5.9354 7.68567 5.9354 7.06233C5.93555 6.43911 6.44108 5.93353 7.06431 5.93342Z", fill: "currentColor" }), _jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8.6815.963693c1.4354-.516674 2.9451-.588864 3.8818.347657.9367.9367.8644 2.44641.3477 3.88184-.1984.55112-.4724 1.12477-.8145 1.7041.4004.64909.7176 1.29289.9395 1.90918.5167 1.43543.5891 2.94513-.3477 3.88183-.9367.9367-2.4463.8644-3.8818.3477-.61628-.2219-1.26009-.5391-1.90918-.9395-.57935.3421-1.15297.616-1.7041.8145-1.43545.5166-2.94512.589-3.88184-.3477-.936521-.9367-.864331-2.4465-.347656-3.88188.208126-.57809.499486-1.18084.865236-1.78907-.30714-.53529-.55661-1.06415-.74024-1.57421C.572068 3.88278.499714 2.37306 1.43638 1.43635c.9367-.936695 2.44642-.864306 3.88184-.34766.51006.18363 1.03893.43311 1.57421.74024.60823-.36575 1.21098-.65712 1.78907-.865237ZM11.3573 8.01154c-.449.61099-.9672 1.21719-1.54787 1.79786-.58066.5807-1.18688 1.0989-1.79785 1.5478.41412.2269.81712.4115 1.20117.5499 1.33285.4797 2.21185.3476 2.62695-.0674.4151-.4151.5472-1.2941.0674-2.62698-.1383-.38406-.323-.78704-.5498-1.20118ZM2.56529 8.02912c-.19185.3641-.35034.71884-.47266 1.0586-.47972 1.33268-.34751 2.21178.06738 2.62698.41504.415 1.29414.5471 2.62696.0674.3236-.1165.66089-.2657 1.00683-.4454-.5448-.4144-1.08458-.8834-1.60351-1.4023-.61451-.61453-1.1586-1.25807-1.625-1.90528Zm4.34179-4.78222c-.66643.45789-1.34248 1.01631-1.99316 1.66699-.65067.65067-1.2091 1.32674-1.66699 1.99316.47981.7262 1.08084 1.46754 1.79199 2.17871.61051.61051 1.24291 1.14074 1.86914 1.58204.68562-.4653 1.38274-1.03704 2.05273-1.70704.67001-.67001 1.24171-1.3671 1.70701-2.05273-.4413-.62623-.97149-1.25863-1.58201-1.86914-.71117-.71116-1.45251-1.31217-2.17871-1.79199Zm4.80762-1.08692c-.4151-.41489-1.2943-.5471-2.62695-.06738-.3394.12219-.69393.28011-1.05762.47168.64715.46637 1.28982 1.01152 1.9043 1.62598.51897.51894.98787 1.0587 1.40237 1.60351.1796-.34592.3288-.68325.4453-1.00683.4797-1.33278.3476-2.21192-.0674-2.62696ZM4.91197 2.2176c-1.33275-.47972-2.21193-.34765-2.62696.06738-.415.41505-.5471 1.29422-.06738 2.62696.09946.27628.22349.56233.36914.85546.43254-.5787.92797-1.1516 1.47852-1.70214.55055-.55056 1.12343-1.04598 1.70214-1.47852-.29312-.14564-.57919-.26968-.85546-.36914Z", fill: "currentColor" })] }));
const ReadToolIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M5 3h10v14H5zM8 7h4M8 10h4" }) }));
const SearchToolIcon = () => (_jsxs(Icon, { children: [_jsx("circle", { cx: "8.5", cy: "8.5", r: "5.5" }), _jsx("path", { d: "m12.5 12.5 4 4" })] }));
const TerminalIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "m4 6 4 4-4 4M10 14h6" }) }));
const ShieldIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M10 2 16 5v5c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V5l6-3Zm-2 8 1.5 1.5L13 8" }) }));
const LinkIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M8 12 12 8M6.5 13.5l-1 1a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4 0M13.5 6.5l1-1a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 0" }) }));
const FileIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M5 2h7l4 4v12H5V2Zm7 0v5h4" }) }));
const DiffIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M5 3v14M3 5l2-2 2 2M15 17V3M13 15l2 2 2-2M9 7h3M9 13h3" }) }));
const ContextIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M6 5h10v10H6zM3 8v9h9" }) }));
const InfoIcon = () => (_jsxs(Icon, { children: [_jsx("circle", { cx: "10", cy: "10", r: "7" }), _jsx("path", { d: "M10 9v5M10 6h.01" })] }));
const SparkIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "m10 2 1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2ZM15.5 13l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" }) }));
const FormIcon = () => (_jsx(Icon, { children: _jsx("path", { d: "M4 3h12v14H4zM7 7h6M7 10h6M7 13h3" }) }));
//# sourceMappingURL=Chat.js.map