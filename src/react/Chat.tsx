import DOMPurify from "isomorphic-dompurify";
import { Marked, Renderer } from "marked";
import {
  Component,
  createContext,
  memo,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createChat } from "../core/chat-controller.js";
import type {
  ChatActivity,
  ChatController,
  ChatOptions,
  ChatSnapshot,
  ChatToolCall,
  ContentBlock,
  ElicitationInteraction,
  PermissionInteraction,
} from "../core/types.js";
import { defaultLabels } from "./types.js";
import type {
  ChatLabels,
  ChatProps,
  ChatRootProps,
  ToolActivityRenderer,
} from "./types.js";

interface ChatContextValue {
  readonly controller: ChatController;
  readonly snapshot: ChatSnapshot;
  readonly labels: ChatLabels;
  readonly toolActivityRenderer?: ToolActivityRenderer | undefined;
  readonly actionError?: string | undefined;
  readonly runAction: (operation: () => Promise<unknown>) => void;
  readonly ids: {
    readonly instance: string;
    readonly sessionsTitle: string;
  };
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);
const controllerKeys = new WeakMap<ChatController, number>();
let controllerKeyCounter = 0;

const CONNECTING_SNAPSHOT: ChatSnapshot = {
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

const CONNECTING_CONTROLLER: ChatController = {
  ready: new Promise<void>(() => undefined),
  getSnapshot: () => CONNECTING_SNAPSHOT,
  subscribe: () => () => undefined,
  send() {
    throw new Error("The chat session is still connecting");
  },
  async cancel() {},
  async reconnect() {},
  async newSession() {},
  async listSessions() {
    return { sessions: [] };
  },
  async openSession() {},
  async openChildSession() {},
  async openAncestorSession() {},
  async closeSession() {},
  async deleteSession() {},
  async setConfigOption() {},
  async authenticate() {},
  async logout() {},
  respondPermission: () => false,
  respondElicitation: () => false,
  async destroy() {},
};

function useChatContext(macro: string): ChatContextValue {
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
export function Chat(props: ChatProps) {
  return (
    <ChatRoot {...props}>
      <ChatHeader />
      <ChatTranscript />
      <ChatInteractions />
      <ChatComposer />
    </ChatRoot>
  );
}

/** Owns or borrows one controller and provides one snapshot subscription. */
export function ChatRoot(props: ChatRootProps) {
  if ("controller" in props) {
    const { controller, ...presentation } = props;
    return (
      <SubscribedChatRoot
        key={controllerKey(controller)}
        {...presentation}
        controller={controller}
      />
    );
  }

  const { options, ...presentation } = props;
  return <OwnedChatRoot {...presentation} options={options} />;
}

type RootPresentationProps = Omit<ChatRootProps, "controller" | "options">;

function OwnedChatRoot(
  props: RootPresentationProps & { readonly options: ChatOptions },
) {
  const { options, ...presentation } = props;
  const immutableOptions = useRef(options);
  const [controller, setController] = useState<ChatController>();

  useEffect(() => {
    const ownedController = createChat(immutableOptions.current);
    setController(ownedController);
    return () => {
      void ownedController.destroy();
    };
  }, []);

  if (!controller) {
    return (
      <SubscribedChatRoot
        key="connecting"
        {...presentation}
        controller={CONNECTING_CONTROLLER}
      />
    );
  }

  return (
    <SubscribedChatRoot
      key={controllerKey(controller)}
      {...presentation}
      controller={controller}
    />
  );
}

function SubscribedChatRoot(
  props: RootPresentationProps & { readonly controller: ChatController },
) {
  const { controller } = props;
  const snapshot = useSyncExternalStore(
    useCallback(
      (listener) => subscribeOnAnimationFrame(controller, listener),
      [controller],
    ),
    useCallback(() => controller.getSnapshot(), [controller]),
    useCallback(() => controller.getSnapshot(), [controller]),
  );
  const labels = useMemo(
    () => ({ ...defaultLabels, ...props.labels }),
    [props.labels],
  );
  const id = useId().replaceAll(":", "");
  const [actionError, setActionError] = useState<string>();
  const runAction = useCallback((operation: () => Promise<unknown>) => {
    setActionError(undefined);
    void operation().catch((reason: unknown) => {
      setActionError(reason instanceof Error ? reason.message : String(reason));
    });
  }, []);
  const colorScheme = props.colorScheme ?? "system";
  const surface = props.surface ?? "inline";
  const value = useMemo<ChatContextValue>(
    () => ({
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
    }),
    [
      actionError,
      controller,
      id,
      labels,
      props.toolActivityRenderer,
      runAction,
      snapshot,
    ],
  );

  return (
    <section
      className={["pretty-aui", props.className].filter(Boolean).join(" ")}
      data-pretty-aui-slot="root"
      data-surface={surface}
      data-scheme={colorScheme}
      data-phase={snapshot.phase}
      style={props.style}
      aria-label={snapshot.agentName ?? labels.assistantName}
    >
      <ChatContext.Provider value={value}>
        {props.children}
      </ChatContext.Provider>
    </section>
  );
}

/** Renders session identity, protocol state, new-session, and history actions. */
export function ChatHeader() {
  const { controller, snapshot, labels, runAction } =
    useChatContext("ChatHeader");
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const currentTitle = snapshot.sessionTitle ?? labels.sessionUntitled;
  const parent = snapshot.sessionTrail.at(-1);
  return (
    <>
      <header className="paui-header" data-pretty-aui-slot="header">
        <div
          className={`paui-identity${parent ? " paui-identity--child" : ""}`}
        >
          <span
            className="paui-presence"
            data-phase={snapshot.phase}
            aria-hidden="true"
          />
          {parent ? (
            <div
              className="paui-lineage"
              data-depth={snapshot.sessionTrail.length}
            >
              <button
                className="paui-lineage__back"
                type="button"
                disabled={snapshot.phase !== "idle"}
                aria-label={labels.backToSession(
                  parent.title ?? parent.sessionId,
                )}
                onClick={() =>
                  runAction(() =>
                    controller.openAncestorSession(parent.sessionId),
                  )
                }
              >
                <BackIcon />
              </button>
              <div className="paui-lineage__titles">
                {snapshot.sessionTrail.map((ancestor) => {
                  const title = ancestor.title ?? ancestor.sessionId;
                  return (
                    <span
                      className="paui-lineage__ancestor"
                      key={ancestor.sessionId}
                    >
                      <button
                        type="button"
                        disabled={snapshot.phase !== "idle"}
                        onClick={() =>
                          runAction(() =>
                            controller.openAncestorSession(ancestor.sessionId),
                          )
                        }
                      >
                        {title}
                      </button>
                      <span aria-hidden="true">/</span>
                    </span>
                  );
                })}
                <strong>{currentTitle}</strong>
              </div>
              <span className="paui-protocol">
                {snapshot.protocolVersion
                  ? `ACP v${snapshot.protocolVersion}`
                  : snapshot.phase}
              </span>
            </div>
          ) : (
            <div>
              <strong>{currentTitle}</strong>
              <span className="paui-protocol">
                {snapshot.protocolVersion
                  ? `ACP v${snapshot.protocolVersion}`
                  : snapshot.phase}
              </span>
            </div>
          )}
        </div>
        <div className="paui-header__actions">
          {snapshot.capabilities.listSessions ? (
            <button
              className="paui-icon-button"
              type="button"
              onClick={() => setSessionsOpen(true)}
            >
              <HistoryIcon />
              <span className="paui-sr-only">{labels.sessions}</span>
            </button>
          ) : null}
          <button
            className="paui-icon-button"
            type="button"
            disabled={snapshot.phase !== "idle"}
            onClick={() => runAction(() => controller.newSession())}
          >
            <NewChatIcon />
            <span className="paui-sr-only">{labels.newChat}</span>
          </button>
        </div>
      </header>
      {sessionsOpen ? (
        <SessionDrawer
          controller={controller}
          snapshot={snapshot}
          labels={labels}
          onClose={() => setSessionsOpen(false)}
        />
      ) : null}
    </>
  );
}

/** Renders normalized conversation history and owns transcript scrolling. */
export function ChatTranscript() {
  const { snapshot, labels, toolActivityRenderer } =
    useChatContext("ChatTranscript");
  const scrollerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const [pinned, setPinned] = useState(true);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top: scroller.scrollHeight, behavior });
    } else {
      scroller.scrollTop = scroller.scrollHeight;
    }
    lastScrollTopRef.current = scroller.scrollTop;
    pinnedRef.current = true;
    setPinned(true);
  }, []);
  const updatePinned = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const movedUp = scroller.scrollTop < lastScrollTopRef.current - 1;
    const next = distance <= 24 ? true : movedUp ? false : pinnedRef.current;
    lastScrollTopRef.current = scroller.scrollTop;
    pinnedRef.current = next;
    setPinned(next);
  }, []);

  useLayoutEffect(() => {
    if (pinnedRef.current) scrollToBottom();
  }, [scrollToBottom, snapshot.activities, snapshot.historyGap]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) scrollToBottom();
    });
    observer.observe(content);
    if (scrollerRef.current) observer.observe(scrollerRef.current);
    return () => observer.disconnect();
  }, [scrollToBottom]);

  const groups = useMemo(
    () => groupActivities(snapshot.activities),
    [snapshot.activities],
  );
  return (
    <main
      ref={scrollerRef}
      className="paui-body"
      data-pretty-aui-slot="transcript"
      tabIndex={0}
      onScroll={updatePinned}
    >
      <div className="paui-transcript" ref={contentRef}>
        {snapshot.historyGap ? (
          <aside className="paui-notice" role="status">
            <InfoIcon />
            <div>
              <strong>{labels.historyGapTitle}</strong>
              <span>{labels.historyGap}</span>
            </div>
          </aside>
        ) : null}
        {!snapshot.activities.length ? (
          <div className="paui-empty">
            <SparkIcon />
            <strong>{labels.emptyTitle}</strong>
            <p>{labels.emptyDescription}</p>
          </div>
        ) : null}
        {groups.map((group, index) => (
          <TurnGroup
            key={group.id}
            group={group}
            labels={labels}
            toolActivityRenderer={toolActivityRenderer}
            active={
              index === groups.length - 1 &&
              (snapshot.phase === "running" ||
                snapshot.phase === "awaiting_user" ||
                snapshot.phase === "cancelling")
            }
          />
        ))}
      </div>
      {!pinned ? (
        <button
          className="paui-to-bottom"
          type="button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Scroll to latest message"
        >
          <DownIcon />
        </button>
      ) : null}
    </main>
  );
}

/** Renders authentication, ACP interactions, and reconnectable errors. */
export function ChatInteractions() {
  const { controller, snapshot, labels, actionError, runAction } =
    useChatContext("ChatInteractions");
  const interactionsRef = useRef<HTMLDivElement>(null);
  const interactionIdentity = snapshot.interactions
    .map((interaction) => interaction.id)
    .join("\u0000");
  useEffect(() => {
    if (!snapshot.interactions.length) return;
    const root = interactionsRef.current;
    if (!root) return;
    const activeElement = activeElementFor(root);
    if (activeElement && root.contains(activeElement)) return;
    root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, [interactionIdentity, snapshot.interactions.length]);
  return (
    <div
      ref={interactionsRef}
      className="paui-interactions"
      data-pretty-aui-slot="interactions"
    >
      {snapshot.phase === "auth_required" ? <AuthPanel /> : null}
      {snapshot.interactions.map((interaction) =>
        interaction.type === "permission" ? (
          <PermissionCard
            key={interaction.id}
            interaction={interaction}
            controller={controller}
            labels={labels}
          />
        ) : (
          <ElicitationCard
            key={interaction.id}
            interaction={interaction}
            controller={controller}
            labels={labels}
          />
        ),
      )}
      {snapshot.error ? (
        <aside className="paui-error" role="alert">
          <div>
            <strong>{labels.error}</strong>
            <span>{snapshot.error.message}</span>
          </div>
          {snapshot.error.retryable ? (
            <button
              type="button"
              onClick={() => runAction(() => controller.reconnect())}
            >
              {labels.retry}
            </button>
          ) : null}
        </aside>
      ) : null}
      {actionError && !snapshot.error ? (
        <aside className="paui-error" role="alert">
          <div>
            <strong>{labels.error}</strong>
            <span>{actionError}</span>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

interface ActivityGroup {
  readonly id: string;
  readonly user?: Extract<ChatActivity, { type: "message" }>;
  readonly activities: readonly ChatActivity[];
}

function groupActivities(activities: readonly ChatActivity[]): ActivityGroup[] {
  const groups: ActivityGroup[] = [];
  let id = "opening";
  let user: Extract<ChatActivity, { type: "message" }> | undefined;
  let groupedActivities: ChatActivity[] = [];
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
    } else {
      groupedActivities.push(activity);
    }
  }
  flush();
  return groups;
}

function TurnGroup({
  group,
  labels,
  toolActivityRenderer,
  active,
}: {
  group: ActivityGroup;
  labels: ChatLabels;
  toolActivityRenderer?: ToolActivityRenderer | undefined;
  active: boolean;
}) {
  return (
    <article className="paui-turn">
      {group.user ? <MessageView message={group.user} labels={labels} /> : null}
      {group.activities.length ? (
        <div className="paui-activities">
          {group.activities.map((activity, index) => (
            <ActivityRow
              activity={activity}
              labels={labels}
              toolActivityRenderer={toolActivityRenderer}
              running={active && index === group.activities.length - 1}
              key={activity.id}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

const ActivityRow = memo(function ActivityRow({
  activity,
  labels,
  toolActivityRenderer,
  running,
}: {
  activity: ChatActivity;
  labels: ChatLabels;
  toolActivityRenderer?: ToolActivityRenderer | undefined;
  running: boolean;
}) {
  return (
    <div
      className="paui-activity"
      data-pretty-aui-slot="activity"
      data-kind={
        activity.type === "message"
          ? activity.role
          : activity.type === "tool" && activity.subagent
            ? "subagent"
            : activity.type
      }
      data-status={activityStatus(activity)}
    >
      <ActivityView
        activity={activity}
        labels={labels}
        toolActivityRenderer={toolActivityRenderer}
        running={running}
      />
    </div>
  );
});

function ActivityView({
  activity,
  labels,
  toolActivityRenderer,
  running,
}: {
  activity: ChatActivity;
  labels: ChatLabels;
  toolActivityRenderer?: ToolActivityRenderer | undefined;
  running: boolean;
}) {
  switch (activity.type) {
    case "message":
      return (
        <MessageView message={activity} labels={labels} running={running} />
      );
    case "tool":
      if (activity.subagent) {
        return (
          <SubagentActivity
            tool={activity}
            labels={labels}
            renderer={toolActivityRenderer}
          />
        );
      }
      return (
        <details
          className="paui-disclosure paui-tool"
          data-state={activity.status}
        >
          <summary className="paui-flow-summary">
            <DisclosureLeading icon={<ToolKindIcon kind={activity.kind} />} />
            <span className="paui-flow-title">
              {flowTitle(activity.kind, labels.tool)}
            </span>
            <span className="paui-flow-separator" aria-hidden="true" />
            <span className="paui-flow-preview">{activity.title}</span>
            <span className="paui-sr-only">{activity.status}</span>
          </summary>
          <div className="paui-disclosure__body">
            <ToolBody
              tool={activity}
              labels={labels}
              renderer={toolActivityRenderer}
            />
          </div>
        </details>
      );
    case "plan":
      return (
        <details className="paui-disclosure paui-plan" open>
          <summary>
            <PlanIcon />
            <span>Plan</span>
            <StatusBadge status={planStatus(activity.entries)} />
          </summary>
          <ol className="paui-plan__list">
            {activity.entries.map((entry, index) => (
              <li key={`${entry.content}-${index}`} data-status={entry.status}>
                <span className="paui-plan__mark" aria-hidden="true" />
                <span>{entry.content}</span>
              </li>
            ))}
          </ol>
        </details>
      );
    case "terminal":
      return (
        <details className="paui-disclosure paui-terminal">
          <summary>
            <TerminalIcon />
            <span>{activity.title}</span>
            <StatusBadge
              status={activity.exited ? "completed" : "in_progress"}
            />
          </summary>
          <pre>{activity.output}</pre>
        </details>
      );
    case "unsupported":
      return (
        <div className="paui-unsupported">
          {labels.unsupportedContent(activity.kind)}
        </div>
      );
  }
}

function SubagentActivity({
  tool,
  labels,
  renderer,
}: {
  readonly tool: ChatToolCall;
  readonly labels: ChatLabels;
  readonly renderer?: ToolActivityRenderer | undefined;
}) {
  const { controller, snapshot, runAction } = useChatContext("ChatTranscript");
  const subagent = tool.subagent!;
  const running = tool.status === "pending" || tool.status === "in_progress";
  const observed = useObservedDuration(tool.id, running);
  const status = subagentStatus(tool, labels);
  const canOpen =
    snapshot.capabilities.loadSession || snapshot.capabilities.resumeSession;
  return (
    <div className="paui-subagent-row">
      <details
        className="paui-disclosure paui-subagent"
        data-state={tool.status}
        data-running={running || undefined}
      >
        <summary className="paui-flow-summary">
          <DisclosureLeading icon={<AgentIcon />} />
          <span className="paui-flow-title">
            {labels.agentName(subagent.agent)}
          </span>
          {subagent.description ? (
            <>
              <span className="paui-flow-separator" aria-hidden="true" />
              <span className="paui-flow-preview">{subagent.description}</span>
            </>
          ) : null}
          <span className="paui-subagent-status" data-status={tool.status}>
            {running ? (
              <span className="paui-subagent-status__ongoing">
                <span
                  className="paui-subagent-status__spinner"
                  aria-hidden="true"
                />
                <span>{labels.agentOngoing}</span>
              </span>
            ) : (
              <span>{status}</span>
            )}
            {observed ? <span>{labels.agentObserved(observed)}</span> : null}
          </span>
        </summary>
        <div className="paui-disclosure__body">
          <ToolBody tool={tool} labels={labels} renderer={renderer} />
        </div>
      </details>
      {subagent.sessionId ? (
        <button
          className="paui-subagent-open"
          type="button"
          disabled={!canOpen || snapshot.phase !== "idle"}
          aria-label={labels.openChildSession}
          onClick={() =>
            runAction(() => controller.openChildSession(subagent.sessionId!))
          }
        >
          <OpenChildIcon />
        </button>
      ) : null}
    </div>
  );
}

function useObservedDuration(id: string, running: boolean): string | undefined {
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(startedAt.current);

  useEffect(() => {
    startedAt.current = Date.now();
    setNow(startedAt.current);
  }, [id]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [running]);

  return running ? formatObservedDuration(now - startedAt.current) : undefined;
}

function formatObservedDuration(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1_000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function subagentStatus(tool: ChatToolCall, labels: ChatLabels): string {
  if (tool.subagent?.background && tool.status === "completed") {
    return labels.agentBackground;
  }
  if (tool.status === "completed") return labels.agentCompleted;
  if (tool.status === "failed") return labels.agentFailed;
  if (tool.status === "cancelled") return labels.agentCancelled;
  return flowTitle(tool.status, labels.agentCompleted);
}

function MessageView({
  message,
  labels,
  running = false,
}: {
  message: Extract<ChatActivity, { type: "message" }>;
  labels: ChatLabels;
  running?: boolean | undefined;
}) {
  if (message.role === "thought") {
    return (
      <ThoughtDisclosure message={message} labels={labels} running={running} />
    );
  }
  return (
    <div
      className="paui-message"
      data-pretty-aui-slot="message"
      data-role={message.role}
      data-pending={message.pending || undefined}
      aria-live={message.role === "assistant" && running ? "polite" : undefined}
      aria-atomic={
        message.role === "assistant" && running ? "false" : undefined
      }
    >
      <span className="paui-message__label">
        {message.role === "user" ? labels.you : labels.assistantName}
      </span>
      <div className="paui-message__content">
        {message.content.map((block, index) => (
          <ContentView block={block} labels={labels} key={index} />
        ))}
      </div>
    </div>
  );
}

function ThoughtDisclosure({
  message,
  labels,
  running,
}: {
  message: Extract<ChatActivity, { type: "message" }>;
  labels: ChatLabels;
  running: boolean;
}) {
  const previewRef = useRef<HTMLSpanElement>(null);
  const preview = thoughtPreview(message.content, running);

  useLayoutEffect(() => {
    const element = previewRef.current;
    if (!element) return;
    element.scrollLeft = running
      ? element.scrollWidth - element.clientWidth
      : 0;
  }, [preview, running]);

  return (
    <details className="paui-thought" data-running={running || undefined}>
      <summary className="paui-flow-summary">
        <DisclosureLeading icon={<ThoughtIcon />} />
        <span className="paui-flow-title">{labels.thinking}</span>
        {preview ? (
          <>
            <span className="paui-flow-separator" aria-hidden="true" />
            <span
              ref={previewRef}
              className="paui-flow-preview"
              data-follow-end={running || undefined}
            >
              {preview}
            </span>
          </>
        ) : null}
      </summary>
      <div className="paui-thought__body">
        {message.content.map((block, index) => (
          <ContentView block={block} labels={labels} key={index} />
        ))}
      </div>
    </details>
  );
}

function DisclosureLeading({ icon }: { readonly icon: ReactNode }) {
  return (
    <span className="paui-flow-leading" aria-hidden="true">
      <span className="paui-flow-icon">{icon}</span>
      <span className="paui-flow-chevron">
        <ChevronIcon />
      </span>
    </span>
  );
}

function thoughtPreview(
  content: readonly ContentBlock[],
  running: boolean,
): string {
  if (running) {
    for (let index = content.length - 1; index >= 0; index -= 1) {
      const text = contentPlainText(content[index]!).trimEnd();
      if (!text) continue;
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
  if (!text) return "";
  const lines = text.split(/\r?\n/);
  return lines[0]?.trim() ?? "";
}

function contentPlainText(block: ContentBlock): string {
  if (block.type === "text" && typeof block.text === "string") {
    return block.text;
  }
  if (
    block.type === "resource" &&
    isRecord(block.resource) &&
    typeof block.resource.text === "string"
  ) {
    return block.resource.text;
  }
  return "";
}

function flowTitle(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const words = value.replaceAll(/[_-]+/g, " ").trim();
  return words ? `${words[0]!.toUpperCase()}${words.slice(1)}` : fallback;
}

function ToolKindIcon({ kind }: { readonly kind?: string | undefined }) {
  const normalized = kind?.toLowerCase() ?? "";
  if (
    normalized.includes("read") ||
    normalized.includes("browse") ||
    normalized.includes("context")
  ) {
    return <ReadToolIcon />;
  }
  if (normalized.includes("search") || normalized.includes("find")) {
    return <SearchToolIcon />;
  }
  if (
    normalized.includes("bash") ||
    normalized.includes("shell") ||
    normalized.includes("terminal") ||
    normalized.includes("execute")
  ) {
    return <TerminalIcon />;
  }
  return <ToolIcon />;
}

function ToolBody({
  tool,
  labels,
  renderer,
}: {
  tool: ChatToolCall;
  labels: ChatLabels;
  renderer?: ToolActivityRenderer | undefined;
}) {
  const fallback = <DefaultToolBody tool={tool} labels={labels} />;
  return renderer ? (
    <ToolRendererBoundary fallback={fallback} resetKey={tool.id} key={tool.id}>
      <CustomToolBody tool={tool} renderer={renderer} fallback={fallback} />
    </ToolRendererBoundary>
  ) : (
    fallback
  );
}

function DefaultToolBody({
  tool,
  labels,
}: {
  tool: ChatToolCall;
  labels: ChatLabels;
}) {
  return tool.content.length ? (
    tool.content.map((content, index) => (
      <ToolContentView key={index} value={content} labels={labels} />
    ))
  ) : (
    <span className="paui-muted">{labels.tool}</span>
  );
}

function CustomToolBody({
  tool,
  renderer,
  fallback,
}: {
  tool: ChatToolCall;
  renderer: ToolActivityRenderer;
  fallback: ReactNode;
}) {
  const rendered = renderer(tool);
  return rendered === undefined ? fallback : rendered;
}

interface ToolRendererBoundaryProps {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
  readonly resetKey: unknown;
}

class ToolRendererBoundary extends Component<
  ToolRendererBoundaryProps,
  { readonly failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("pretty-aui: custom tool renderer failed", error);
  }

  componentDidUpdate(previous: ToolRendererBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ContentView({
  block,
  labels,
}: {
  block: ContentBlock;
  labels: ChatLabels;
}) {
  const markdownHtml = useMemo(
    () =>
      block.type === "text" && typeof block.text === "string"
        ? renderMarkdown(block.text)
        : undefined,
    [block],
  );
  if (markdownHtml !== undefined) {
    return (
      <div
        className="paui-markdown"
        dangerouslySetInnerHTML={{ __html: markdownHtml }}
      />
    );
  }
  if (
    block.type === "image" &&
    typeof block.data === "string" &&
    typeof block.mimeType === "string" &&
    block.mimeType.startsWith("image/")
  ) {
    return (
      <img
        className="paui-media"
        src={`data:${block.mimeType};base64,${block.data}`}
        alt=""
      />
    );
  }
  if (
    block.type === "audio" &&
    typeof block.data === "string" &&
    typeof block.mimeType === "string" &&
    block.mimeType.startsWith("audio/")
  ) {
    return (
      <audio
        className="paui-media"
        controls
        src={`data:${block.mimeType};base64,${block.data}`}
      />
    );
  }
  if (block.type === "resource_link" && typeof block.uri === "string") {
    const title =
      typeof block.title === "string"
        ? block.title
        : typeof block.name === "string"
          ? block.name
          : block.uri;
    return safeUrl(block.uri) ? (
      <a
        className="paui-resource"
        href={block.uri}
        target="_blank"
        rel="noreferrer"
      >
        <LinkIcon />
        <span>{title}</span>
      </a>
    ) : (
      <span className="paui-unsupported">
        {labels.unsupportedContent("unsafe resource link")}
      </span>
    );
  }
  if (block.type === "resource" && isRecord(block.resource)) {
    const resource = block.resource;
    const uri = typeof resource.uri === "string" ? resource.uri : "Resource";
    if (typeof resource.text === "string") {
      return (
        <details className="paui-resource">
          <summary>
            <FileIcon />
            {uri}
          </summary>
          <pre>{resource.text}</pre>
        </details>
      );
    }
    return (
      <span className="paui-resource">
        <FileIcon />
        {uri}
      </span>
    );
  }
  return (
    <span className="paui-unsupported">
      {labels.unsupportedContent(block.type)}
    </span>
  );
}

function ToolContentView({
  value,
  labels,
}: {
  value: unknown;
  labels: ChatLabels;
}) {
  if (!isRecord(value)) return null;
  if (
    value.type === "content" &&
    isRecord(value.content) &&
    typeof value.content.type === "string"
  ) {
    return (
      <ContentView block={value.content as ContentBlock} labels={labels} />
    );
  }
  if (value.type === "diff") {
    const path = typeof value.path === "string" ? value.path : "Changed files";
    const patch =
      typeof value.patch === "string"
        ? value.patch
        : typeof value.newText === "string"
          ? value.newText
          : undefined;
    return (
      <details className="paui-diff">
        <summary>
          <DiffIcon />
          {path}
        </summary>
        {patch ? (
          <pre>{patch}</pre>
        ) : (
          <span className="paui-muted">Binary or structural change</span>
        )}
      </details>
    );
  }
  if (value.type === "terminal") {
    return (
      <span className="paui-muted">
        <TerminalIcon /> Terminal output is shown in the activity stream.
      </span>
    );
  }
  return (
    <span className="paui-unsupported">
      {labels.unsupportedContent(
        typeof value.type === "string" ? value.type : "tool result",
      )}
    </span>
  );
}

/** Renders draft entry, commands, context, configuration, send, and cancel. */
export function ChatComposer() {
  const { controller, snapshot, labels, runAction, ids } =
    useChatContext("ChatComposer");
  const [value, setValue] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [commandsDismissed, setCommandsDismissed] = useState(false);
  const composingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef(snapshot.sessionId);
  const placement =
    snapshot.activities.length ||
    snapshot.interactions.length ||
    snapshot.phase === "auth_required" ||
    snapshot.error
      ? "docked"
      : "hero";
  useEffect(() => {
    if (sessionRef.current !== snapshot.sessionId) {
      const previousSessionId = sessionRef.current;
      sessionRef.current = snapshot.sessionId;
      if (previousSessionId !== undefined) setValue("");
    }
  }, [snapshot.sessionId]);
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 336)}px`;
  }, [placement, value]);
  const disabled =
    !snapshot.sessionId ||
    snapshot.phase === "connecting" ||
    snapshot.phase === "auth_required" ||
    snapshot.phase === "closed";
  const running =
    snapshot.phase === "running" ||
    snapshot.phase === "awaiting_user" ||
    snapshot.phase === "cancelling";
  const submit = () => {
    const prompt = value.trim();
    if (!prompt || disabled || running) return;
    setValue("");
    setCommandsDismissed(true);
    try {
      const turn = controller.send(prompt);
      void turn.done.catch(() => {
        setValue((current) => current || prompt);
      });
    } catch {
      setValue(prompt);
    }
  };
  const matchingCommands =
    value.startsWith("/") && !/\s/.test(value.slice(1)) && !commandsDismissed
      ? snapshot.commands
          .filter((command) =>
            command.name.startsWith(value.slice(1).split(/\s/, 1)[0] ?? ""),
          )
          .slice(0, 5)
      : [];
  const selectedCommandIndex = Math.min(
    commandIndex,
    Math.max(0, matchingCommands.length - 1),
  );
  const chooseCommand = (name: string) => {
    setValue(`/${name} `);
    setCommandsDismissed(true);
    textareaRef.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.repeat) return;
    if (matchingCommands.length && event.key === "ArrowDown") {
      event.preventDefault();
      setCommandIndex((selectedCommandIndex + 1) % matchingCommands.length);
      return;
    }
    if (matchingCommands.length && event.key === "ArrowUp") {
      event.preventDefault();
      setCommandIndex(
        (selectedCommandIndex - 1 + matchingCommands.length) %
          matchingCommands.length,
      );
      return;
    }
    if (matchingCommands.length && event.key === "Escape") {
      event.preventDefault();
      setCommandsDismissed(true);
      return;
    }
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !composingRef.current &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      const command = matchingCommands[selectedCommandIndex];
      if (command) chooseCommand(command.name);
      else submit();
    }
  };
  const commandsId = `${ids.instance}-commands`;
  return (
    <footer
      className="paui-composer-wrap"
      data-pretty-aui-slot="composer"
      data-placement={placement}
    >
      {snapshot.contextItems.length ? (
        <div className="paui-context" aria-label={labels.context}>
          {snapshot.contextItems.map((item) => (
            <span key={item.id}>
              <ContextIcon />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {matchingCommands.length ? (
        <div
          className="paui-commands"
          role="listbox"
          id={commandsId}
          aria-label="Commands"
        >
          {matchingCommands.map((command, index) => (
            <button
              type="button"
              key={command.name}
              id={`${commandsId}-${index}`}
              role="option"
              aria-selected={index === selectedCommandIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseCommand(command.name)}
            >
              <code>/{command.name}</code>
              <span>{command.description}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="paui-composer" data-pretty-aui-slot="composer-input">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={labels.composerPlaceholder}
          aria-label={labels.composerPlaceholder}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={matchingCommands.length ? commandsId : undefined}
          aria-expanded={Boolean(matchingCommands.length)}
          aria-activedescendant={
            matchingCommands.length
              ? `${commandsId}-${selectedCommandIndex}`
              : undefined
          }
          onInput={(event) => {
            setValue(event.currentTarget.value);
            setCommandIndex(0);
            setCommandsDismissed(false);
          }}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onKeyDown={onKeyDown}
        />
        <div
          className="paui-composer__actions"
          data-pretty-aui-slot="composer-actions"
        >
          {snapshot.configOptions.length ? (
            <ConfigBar
              controller={controller}
              options={snapshot.configOptions}
            />
          ) : (
            <span />
          )}
          {running ? (
            <button
              className="paui-send paui-stop"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runAction(() => controller.cancel())}
              disabled={snapshot.phase === "cancelling"}
            >
              <StopIcon />
              <span className="paui-sr-only">{labels.stop}</span>
            </button>
          ) : (
            <button
              className="paui-send"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={submit}
              disabled={disabled || !value.trim()}
            >
              <SendIcon />
              <span className="paui-sr-only">{labels.send}</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

function ConfigBar({
  controller,
  options,
}: {
  controller: ChatController;
  options: ChatSnapshot["configOptions"];
}) {
  const { runAction } = useChatContext("ChatComposer");
  return (
    <div className="paui-config">
      {options.map((option) =>
        option.type === "boolean" ? (
          <label key={option.id} title={option.description}>
            <input
              type="checkbox"
              checked={Boolean(option.currentValue)}
              onChange={(event) =>
                runAction(() =>
                  controller.setConfigOption(option.id, event.target.checked),
                )
              }
            />
            <span>{option.name}</span>
          </label>
        ) : option.type === "select" ? (
          <label key={option.id} title={option.description}>
            <span className="paui-sr-only">{option.name}</span>
            <select
              value={String(option.currentValue)}
              onChange={(event) =>
                runAction(() =>
                  controller.setConfigOption(option.id, event.target.value),
                )
              }
            >
              {option.options?.map((choice) => (
                <option value={choice.value} key={choice.value}>
                  {choice.name}
                </option>
              ))}
            </select>
          </label>
        ) : null,
      )}
    </div>
  );
}

function PermissionCard({
  interaction,
  controller,
  labels,
}: {
  interaction: PermissionInteraction;
  controller: ChatController;
  labels: ChatLabels;
}) {
  const { ids } = useChatContext("ChatInteractions");
  const titleId = `${ids.instance}-${interaction.id}-title`;
  return (
    <section
      className="paui-interaction"
      role="alertdialog"
      aria-labelledby={titleId}
    >
      <div className="paui-interaction__icon">
        <ShieldIcon />
      </div>
      <div className="paui-interaction__content">
        <strong id={titleId}>{interaction.title || labels.permission}</strong>
        {interaction.description ? <p>{interaction.description}</p> : null}
        <div className="paui-interaction__actions">
          {interaction.options.map((option, index) => (
            <button
              type="button"
              className={
                option.kind.startsWith("reject")
                  ? "paui-button-secondary"
                  : index === 0
                    ? "paui-button-primary"
                    : "paui-button-secondary"
              }
              key={option.id}
              onClick={() =>
                controller.respondPermission(interaction.id, {
                  outcome: "selected",
                  optionId: option.id,
                })
              }
            >
              {option.name}
            </button>
          ))}
          <button
            type="button"
            className="paui-button-ghost"
            onClick={() =>
              controller.respondPermission(interaction.id, {
                outcome: "cancelled",
              })
            }
          >
            {labels.cancel}
          </button>
        </div>
      </div>
    </section>
  );
}

function ElicitationCard({
  interaction,
  controller,
  labels,
}: {
  interaction: ElicitationInteraction;
  controller: ChatController;
  labels: ChatLabels;
}) {
  const { ids } = useChatContext("ChatInteractions");
  const titleId = `${ids.instance}-${interaction.id}-title`;
  if (interaction.mode === "url" && interaction.url) {
    const canOpen = safeUrl(interaction.url);
    return (
      <section
        className="paui-interaction"
        role="dialog"
        aria-labelledby={titleId}
      >
        <div className="paui-interaction__icon">
          <LinkIcon />
        </div>
        <div className="paui-interaction__content">
          <strong id={titleId}>{interaction.message}</strong>
          <code className="paui-url">{interaction.url}</code>
          <div className="paui-interaction__actions">
            <button
              className="paui-button-primary"
              type="button"
              disabled={!canOpen}
              onClick={() =>
                canOpen
                  ? window.open(
                      interaction.url,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  : undefined
              }
            >
              {labels.openLink}
            </button>
            <button
              className="paui-button-secondary"
              type="button"
              onClick={() =>
                controller.respondElicitation(interaction.id, {
                  action: "accept",
                })
              }
            >
              {labels.finish}
            </button>
            <button
              className="paui-button-ghost"
              type="button"
              onClick={() =>
                controller.respondElicitation(interaction.id, {
                  action: "decline",
                })
              }
            >
              {labels.decline}
            </button>
          </div>
        </div>
      </section>
    );
  }
  return (
    <ElicitationForm
      interaction={interaction}
      controller={controller}
      labels={labels}
      titleId={titleId}
    />
  );
}

function ElicitationForm({
  interaction,
  controller,
  labels,
  titleId,
}: {
  interaction: ElicitationInteraction;
  controller: ChatController;
  labels: ChatLabels;
  titleId: string;
}) {
  const schema = interaction.requestedSchema;
  const properties = isRecord(schema?.properties) ? schema.properties : {};
  const required = Array.isArray(schema?.required)
    ? schema.required.filter((key): key is string => typeof key === "string")
    : [];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const content: Record<
      string,
      string | number | boolean | readonly string[]
    > = {};
    for (const [name, property] of Object.entries(properties)) {
      if (!isRecord(property)) continue;
      if (property.type === "boolean") content[name] = data.get(name) === "on";
      else if (property.type === "number" || property.type === "integer") {
        const raw = data.get(name);
        if (typeof raw !== "string" || raw.trim() === "") continue;
        const number = Number(raw);
        if (Number.isFinite(number)) content[name] = number;
      } else if (property.type === "array")
        content[name] = data.getAll(name).map(String);
      else content[name] = String(data.get(name) ?? "");
    }
    controller.respondElicitation(interaction.id, {
      action: "accept",
      content,
    });
  };
  return (
    <form
      className="paui-interaction paui-form"
      onSubmit={submit}
      aria-labelledby={titleId}
    >
      <div className="paui-interaction__icon">
        <FormIcon />
      </div>
      <div className="paui-interaction__content">
        <strong id={titleId}>{interaction.message}</strong>
        <div className="paui-fields">
          {Object.entries(properties).map(([name, raw]) =>
            isRecord(raw) ? (
              <ElicitationField
                key={name}
                name={name}
                schema={raw}
                required={required.includes(name)}
              />
            ) : null,
          )}
        </div>
        <div className="paui-interaction__actions">
          <button className="paui-button-primary" type="submit">
            {labels.accept}
          </button>
          <button
            className="paui-button-ghost"
            type="button"
            onClick={() =>
              controller.respondElicitation(interaction.id, {
                action: "decline",
              })
            }
          >
            {labels.decline}
          </button>
        </div>
      </div>
    </form>
  );
}

function ElicitationField({
  name,
  schema,
  required,
}: {
  name: string;
  schema: Record<string, unknown>;
  required: boolean;
}) {
  const label = typeof schema.title === "string" ? schema.title : name;
  const description =
    typeof schema.description === "string" ? schema.description : undefined;
  const choices = Array.isArray(schema.enum)
    ? schema.enum.filter((value): value is string => typeof value === "string")
    : [];
  if (schema.type === "boolean") {
    return (
      <label className="paui-field paui-field--check">
        <input name={name} type="checkbox" />
        <span>{label}</span>
      </label>
    );
  }
  if (choices.length) {
    return (
      <label className="paui-field">
        <span>{label}</span>
        <select name={name} required={required}>
          {choices.map((choice) => (
            <option key={choice}>{choice}</option>
          ))}
        </select>
        {description ? <small>{description}</small> : null}
      </label>
    );
  }
  return (
    <label className="paui-field">
      <span>{label}</span>
      <input
        name={name}
        required={required}
        type={
          schema.type === "number" || schema.type === "integer"
            ? "number"
            : "text"
        }
      />
      {description ? <small>{description}</small> : null}
    </label>
  );
}

function AuthPanel() {
  const { controller, snapshot, labels, runAction } =
    useChatContext("ChatInteractions");
  return (
    <section className="paui-auth">
      <ShieldIcon />
      <strong>{labels.authRequired}</strong>
      <div>
        {snapshot.authMethods.map((method) => (
          <button
            type="button"
            key={method.id}
            onClick={() => runAction(() => controller.authenticate(method.id))}
          >
            {method.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function SessionDrawer({
  controller,
  snapshot,
  labels,
  onClose,
}: {
  controller: ChatController;
  snapshot: ChatSnapshot;
  labels: ChatLabels;
  onClose: () => void;
}) {
  const { ids } = useChatContext("ChatHeader");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  useEffect(() => {
    const activeElement = activeElementFor(dialogRef.current);
    const previousFocus =
      activeElement instanceof HTMLElement ? activeElement : undefined;
    closeRef.current?.focus();
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  useEffect(() => {
    if (!snapshot.sessions) {
      setLoading(true);
      void controller
        .listSessions()
        .catch((reason: unknown) =>
          setError(reason instanceof Error ? reason.message : String(reason)),
        )
        .finally(() => setLoading(false));
    }
  }, [controller, snapshot.sessions]);
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current
        ? [
            ...dialogRef.current.querySelectorAll<HTMLElement>(
              FOCUSABLE_SELECTOR,
            ),
          ].filter((element) => !element.hasAttribute("disabled"))
        : [];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      const activeElement = activeElementFor(dialogRef.current);
      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (
        !activeElement ||
        !dialogRef.current?.contains(activeElement)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const select = async (sessionId: string) => {
    setLoading(true);
    setError(undefined);
    try {
      await controller.openSession(sessionId);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  };
  const loadMore = async (cursor: string) => {
    setLoading(true);
    setError(undefined);
    try {
      await controller.listSessions(cursor);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="paui-drawer-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={dialogRef}
        className="paui-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids.sessionsTitle}
      >
        <header>
          <strong id={ids.sessionsTitle}>{labels.sessions}</strong>
          <button
            ref={closeRef}
            className="paui-icon-button"
            type="button"
            onClick={onClose}
          >
            <CloseIcon />
            <span className="paui-sr-only">{labels.close}</span>
          </button>
        </header>
        <div className="paui-session-list">
          {loading && !snapshot.sessions ? (
            <span className="paui-muted">…</span>
          ) : null}
          {!loading && !snapshot.sessions?.sessions.length ? (
            <span className="paui-muted">{labels.noSessions}</span>
          ) : null}
          {snapshot.sessions?.sessions.map((session) => (
            <div
              className="paui-session"
              data-active={
                session.sessionId === snapshot.sessionId || undefined
              }
              key={session.sessionId}
            >
              <button
                type="button"
                disabled={loading || session.sessionId === snapshot.sessionId}
                onClick={() => void select(session.sessionId)}
              >
                <strong>{session.title ?? labels.sessionUntitled}</strong>
                <span>{formatSessionDate(session.updatedAt)}</span>
              </button>
              {snapshot.capabilities.deleteSession &&
              session.sessionId !== snapshot.sessionId ? (
                <button
                  className="paui-icon-button"
                  type="button"
                  title={labels.deleteSession}
                  onClick={() => {
                    if (
                      window.confirm(
                        labels.confirmDeleteSession(
                          session.title ?? labels.sessionUntitled,
                        ),
                      )
                    )
                      void controller
                        .deleteSession(session.sessionId)
                        .catch((reason: unknown) =>
                          setError(
                            reason instanceof Error
                              ? reason.message
                              : String(reason),
                          ),
                        );
                  }}
                >
                  <TrashIcon />
                  <span className="paui-sr-only">{labels.deleteSession}</span>
                </button>
              ) : null}
            </div>
          ))}
          {snapshot.sessions?.nextCursor ? (
            <button
              className="paui-load-more"
              type="button"
              disabled={loading}
              onClick={() =>
                void loadMore(snapshot.sessions?.nextCursor as string)
              }
            >
              {labels.loadMore}
            </button>
          ) : null}
          {error ? (
            <span className="paui-error-text" role="alert">
              {error}
            </span>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function activeElementFor(element: Element | null): Element | null {
  const root = element?.getRootNode();
  if (root instanceof Document || root instanceof ShadowRoot) {
    return root.activeElement;
  }
  return document.activeElement;
}

const markdown = new Marked({ gfm: true, breaks: true });
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
const markdownRenderer = new Renderer();
markdownRenderer.html = ({ text }) => escapeHtml(text);
markdownRenderer.image = ({ text }) =>
  `<span class="paui-markdown-image-alt">${escapeHtml(text)}</span>`;
markdownRenderer.checkbox = ({ checked }) => (checked ? "[x] " : "[ ] ");
markdownRenderer.link = ({ href, title, tokens }) => {
  const content = escapeHtml(tokens.map((token) => token.raw).join(""));
  if (!safeUrl(href)) return content;
  return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer"${title ? ` title="${escapeAttribute(title)}"` : ""}>${content}</a>`;
};
markdown.use({ renderer: markdownRenderer });

function renderMarkdown(source: string): string {
  const rendered = markdown.parse(source) as string;
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

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeUrl(value: string): boolean {
  try {
    const url = new URL(
      value,
      globalThis.location?.href ?? "https://example.invalid",
    );
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function controllerKey(controller: ChatController): number {
  const existing = controllerKeys.get(controller);
  if (existing !== undefined) return existing;
  const key = ++controllerKeyCounter;
  controllerKeys.set(controller, key);
  return key;
}

function subscribeOnAnimationFrame(
  controller: ChatController,
  listener: () => void,
): () => void {
  if (typeof globalThis.requestAnimationFrame !== "function") {
    return controller.subscribe(listener);
  }
  let frame: number | undefined;
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
    if (frame !== undefined) return;
    frame = globalThis.requestAnimationFrame(() => {
      frame = undefined;
      listener();
    });
  });
  return () => {
    unsubscribe();
    if (
      frame !== undefined &&
      typeof globalThis.cancelAnimationFrame === "function"
    ) {
      globalThis.cancelAnimationFrame(frame);
    }
  };
}

function planStatus(entries: readonly { status: string }[]): string {
  if (entries.some((entry) => entry.status === "in_progress"))
    return "in_progress";
  if (entries.length && entries.every((entry) => entry.status === "completed"))
    return "completed";
  return "pending";
}

function activityStatus(activity: ChatActivity): string | undefined {
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

function formatSessionDate(value?: string): string {
  if (!value) return "";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="paui-status" data-status={status}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const HistoryIcon = () => (
  <Icon>
    <path d="M3 10a7 7 0 1 0 2-4.9M3 3v4h4M10 6v4l3 2" />
  </Icon>
);
const NewChatIcon = () => (
  <Icon>
    <path d="M4 4h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8l-4 3v-3a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3M10 7v5M7.5 9.5h5" />
  </Icon>
);
const CloseIcon = () => (
  <Icon>
    <path d="m5 5 10 10M15 5 5 15" />
  </Icon>
);
const TrashIcon = () => (
  <Icon>
    <path d="M4 6h12M8 3h4l1 3M6 6l1 11h6l1-11M9 9v5M12 9v5" />
  </Icon>
);
const SendIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8.3125.9802c.3552.0729.6665.224 0.9502.4521.2245.1807.4676.4256.7168.6748L14.707 6.8347 13.293 8.2487 9 3.9558v11.0859H7V3.9558L2.707 8.2487 1.293 6.8347l4.7275-4.7276c.2492-.2492.4923-.4941.7168-.6748.2393-.1924.5471-.3883.9502-.4521.2098-.0332.4156-.025.625 0Z"
      fill="currentColor"
    />
  </svg>
);
const StopIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect x="3" y="3" width="10" height="10" rx="3" fill="currentColor" />
  </svg>
);
const DownIcon = () => (
  <Icon>
    <path d="m5 8 5 5 5-5" />
  </Icon>
);
const BackIcon = () => (
  <Icon>
    <path d="m12.5 4.5-5 5 5 5" />
  </Icon>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <path d="m4 5.5 3 3 3-3" />
  </svg>
);
const ToolIcon = () => (
  <Icon>
    <path d="M12.5 4.2a4 4 0 0 0-5 5L3 13.7 6.3 17l4.5-4.5a4 4 0 0 0 5-5l-2.3 2.3-3.3-3.3 2.3-2.3Z" />
  </Icon>
);
const AgentIcon = () => (
  <Icon>
    <circle cx="10" cy="5" r="2" />
    <circle cx="5" cy="14" r="2" />
    <circle cx="15" cy="14" r="2" />
    <path d="m8.8 6.7-2.6 5.6M11.2 6.7l2.6 5.6M7 14h6" />
  </Icon>
);
const OpenChildIcon = () => (
  <Icon>
    <path d="M5 5h5v5M10 5 4.5 10.5M9 9h6v6H9" />
  </Icon>
);
const PlanIcon = () => (
  <Icon>
    <path d="M6 5h10M6 10h10M6 15h10M3 5h.01M3 10h.01M3 15h.01" />
  </Icon>
);
const ThoughtIcon = () => (
  <svg
    className="paui-think-icon"
    viewBox="0 0 14 14"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M7.06431 5.93342C7.68763 5.93342 8.19307 6.43904 8.19322 7.06233C8.19322 7.68573 7.68772 8.19123 7.06431 8.19123C6.44099 8.19113 5.9354 7.68567 5.9354 7.06233C5.93555 6.43911 6.44108 5.93353 7.06431 5.93342Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.6815.963693c1.4354-.516674 2.9451-.588864 3.8818.347657.9367.9367.8644 2.44641.3477 3.88184-.1984.55112-.4724 1.12477-.8145 1.7041.4004.64909.7176 1.29289.9395 1.90918.5167 1.43543.5891 2.94513-.3477 3.88183-.9367.9367-2.4463.8644-3.8818.3477-.61628-.2219-1.26009-.5391-1.90918-.9395-.57935.3421-1.15297.616-1.7041.8145-1.43545.5166-2.94512.589-3.88184-.3477-.936521-.9367-.864331-2.4465-.347656-3.88188.208126-.57809.499486-1.18084.865236-1.78907-.30714-.53529-.55661-1.06415-.74024-1.57421C.572068 3.88278.499714 2.37306 1.43638 1.43635c.9367-.936695 2.44642-.864306 3.88184-.34766.51006.18363 1.03893.43311 1.57421.74024.60823-.36575 1.21098-.65712 1.78907-.865237ZM11.3573 8.01154c-.449.61099-.9672 1.21719-1.54787 1.79786-.58066.5807-1.18688 1.0989-1.79785 1.5478.41412.2269.81712.4115 1.20117.5499 1.33285.4797 2.21185.3476 2.62695-.0674.4151-.4151.5472-1.2941.0674-2.62698-.1383-.38406-.323-.78704-.5498-1.20118ZM2.56529 8.02912c-.19185.3641-.35034.71884-.47266 1.0586-.47972 1.33268-.34751 2.21178.06738 2.62698.41504.415 1.29414.5471 2.62696.0674.3236-.1165.66089-.2657 1.00683-.4454-.5448-.4144-1.08458-.8834-1.60351-1.4023-.61451-.61453-1.1586-1.25807-1.625-1.90528Zm4.34179-4.78222c-.66643.45789-1.34248 1.01631-1.99316 1.66699-.65067.65067-1.2091 1.32674-1.66699 1.99316.47981.7262 1.08084 1.46754 1.79199 2.17871.61051.61051 1.24291 1.14074 1.86914 1.58204.68562-.4653 1.38274-1.03704 2.05273-1.70704.67001-.67001 1.24171-1.3671 1.70701-2.05273-.4413-.62623-.97149-1.25863-1.58201-1.86914-.71117-.71116-1.45251-1.31217-2.17871-1.79199Zm4.80762-1.08692c-.4151-.41489-1.2943-.5471-2.62695-.06738-.3394.12219-.69393.28011-1.05762.47168.64715.46637 1.28982 1.01152 1.9043 1.62598.51897.51894.98787 1.0587 1.40237 1.60351.1796-.34592.3288-.68325.4453-1.00683.4797-1.33278.3476-2.21192-.0674-2.62696ZM4.91197 2.2176c-1.33275-.47972-2.21193-.34765-2.62696.06738-.415.41505-.5471 1.29422-.06738 2.62696.09946.27628.22349.56233.36914.85546.43254-.5787.92797-1.1516 1.47852-1.70214.55055-.55056 1.12343-1.04598 1.70214-1.47852-.29312-.14564-.57919-.26968-.85546-.36914Z"
      fill="currentColor"
    />
  </svg>
);
const ReadToolIcon = () => (
  <Icon>
    <path d="M5 3h10v14H5zM8 7h4M8 10h4" />
  </Icon>
);
const SearchToolIcon = () => (
  <Icon>
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="m12.5 12.5 4 4" />
  </Icon>
);
const TerminalIcon = () => (
  <Icon>
    <path d="m4 6 4 4-4 4M10 14h6" />
  </Icon>
);
const ShieldIcon = () => (
  <Icon>
    <path d="M10 2 16 5v5c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V5l6-3Zm-2 8 1.5 1.5L13 8" />
  </Icon>
);
const LinkIcon = () => (
  <Icon>
    <path d="M8 12 12 8M6.5 13.5l-1 1a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4 0M13.5 6.5l1-1a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 0" />
  </Icon>
);
const FileIcon = () => (
  <Icon>
    <path d="M5 2h7l4 4v12H5V2Zm7 0v5h4" />
  </Icon>
);
const DiffIcon = () => (
  <Icon>
    <path d="M5 3v14M3 5l2-2 2 2M15 17V3M13 15l2 2 2-2M9 7h3M9 13h3" />
  </Icon>
);
const ContextIcon = () => (
  <Icon>
    <path d="M6 5h10v10H6zM3 8v9h9" />
  </Icon>
);
const InfoIcon = () => (
  <Icon>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 9v5M10 6h.01" />
  </Icon>
);
const SparkIcon = () => (
  <Icon>
    <path d="m10 2 1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2ZM15.5 13l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
  </Icon>
);
const FormIcon = () => (
  <Icon>
    <path d="M4 3h12v14H4zM7 7h6M7 10h6M7 13h3" />
  </Icon>
);
