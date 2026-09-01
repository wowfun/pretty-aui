import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Chat,
  createChat,
  createWebSocketConnector,
  type ChatColorScheme,
  type ContextProvider,
  type ToolActivityRenderer,
} from "../../../src/react/index.js";
import { createV1Harness } from "../../../tests/helpers/agents.js";
import "../../../src/styles.css";
import "./demo.css";

const query = new URLSearchParams(location.search);
const injectedLive = window.__PRETTY_AUI_LIVE__;
const liveUrl = injectedLive?.url ?? null;
const liveProtocols = injectedLive?.protocols;
const initialScheme = asScheme(query.get("scheme"));
const harness = liveUrl
  ? undefined
  : createV1Harness({
      afterThoughtDelayMs: asDelay(query.get("thoughtDelay")),
      afterSubagentDelayMs: asDelay(query.get("subagentDelay")),
      ...(query.get("usage") === "extreme"
        ? { usage: { used: Number.MAX_VALUE, size: Number.MAX_VALUE } }
        : {}),
      ...(query.get("titleSource") === "list"
        ? { listOnlySessionTitles: true }
        : {}),
      ...(query.get("titleAfterPrompt")
        ? { titleAfterPrompt: query.get("titleAfterPrompt")! }
        : {}),
      ...(query.get("commands") === "many"
        ? {
            availableCommands: Array.from({ length: 12 }, (_, index) => ({
              name: `command-${String(index + 1).padStart(2, "0")}`,
              description: `Run fixture command ${index + 1}`,
            })),
          }
        : {}),
    });
const contextProvider = createDemoContextProvider();
const controller = createChat({
  connector: liveUrl
    ? createWebSocketConnector(liveUrl, {
        ...(liveProtocols ? { protocols: liveProtocols } : {}),
      })
    : harness!.connector,
  protocol: 1,
  session: {
    cwd: injectedLive?.cwd ?? "/workspace/pretty-aui",
  },
  context: contextProvider,
  onEvent(event) {
    if (event.type === "error") console.error(event.error);
  },
});

function createDemoContextProvider(): ContextProvider {
  let selection = [
    { id: "workspace-evidence", label: "Workspace evidence" },
    { id: "task-audit", label: "pbench-v1.0 / web-fetch-01" },
  ];
  const listeners = new Set<() => void>();
  return {
    getSelection: () => selection,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add() {
      if (selection.some((item) => item.id === "report")) return;
      selection = [...selection, { id: "report", label: "Failure report" }];
      for (const listener of listeners) listener();
    },
    remove(id) {
      selection = selection.filter((item) => item.id !== id);
      for (const listener of listeners) listener();
    },
    resolve(request) {
      return request.selection.map((item) => ({
        ...item,
        content: [
          {
            type: "text" as const,
            text: `Literal context for ${item.label}`,
          },
        ],
      }));
    },
  };
}

declare global {
  interface Window {
    __PRETTY_AUI__?: typeof controller;
    __PRETTY_AUI_LIVE__?: {
      readonly url: string;
      readonly protocols: readonly string[];
      readonly cwd: string;
    };
  }
}
window.__PRETTY_AUI__ = controller;

function Demo() {
  const [scheme, setScheme] = useState<ChatColorScheme>(initialScheme);
  const selectScheme = (value: ChatColorScheme) => {
    setScheme(value);
    history.replaceState(null, "", previewHref(value));
  };
  return (
    <main className="demo-shell" data-scheme={scheme}>
      <header className="demo-intro">
        <div>
          <span className="demo-kicker">pretty-aui · ACP client</span>
          <h1>Composer context</h1>
          <p>Choose context for the next turn and inspect what was sent.</p>
        </div>
        <div className="demo-controls" aria-label="Preview theme">
          {(["light", "dark", "system"] as const).map((value) => (
            <button
              type="button"
              data-active={scheme === value || undefined}
              onClick={() => selectScheme(value)}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
      </header>
      <section className="demo-stage">
        <Chat
          controller={controller}
          surface="inline"
          colorScheme={scheme}
          toolActivityRenderer={renderDemoTool}
        />
      </section>
      <footer className="demo-foot">
        <span>
          {liveUrl
            ? "Local OpenCode ACP · WebSocket"
            : "Deterministic ACP v1 fixture"}
        </span>
      </footer>
    </main>
  );
}

const renderDemoTool: ToolActivityRenderer = (tool) =>
  tool.kind === "demo" ? <output>{tool.title}</output> : undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);

function asScheme(value: string | null): ChatColorScheme {
  return value === "dark" || value === "system" ? value : "light";
}

function previewHref(scheme: ChatColorScheme): string {
  const params = new URLSearchParams({ scheme });
  for (const key of ["thoughtDelay", "subagentDelay", "usage"] as const) {
    const value = query.get(key);
    if (value !== null) params.set(key, value);
  }
  return `${location.pathname}?${params}${location.hash}`;
}

function asDelay(value: string | null): number {
  if (value === null) return 0;
  const delay = Number(value);
  return Number.isFinite(delay) ? Math.max(0, Math.min(10_000, delay)) : 0;
}

window.addEventListener("beforeunload", () => {
  void controller.destroy();
  void harness?.close();
});
