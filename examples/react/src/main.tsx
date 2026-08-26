import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Chat,
  ChatComposer,
  ChatHeader,
  ChatInteractions,
  ChatRoot,
  ChatTranscript,
  createChat,
  createWebSocketConnector,
  type ChatColorScheme,
  type ChatSurface,
  type ToolActivityRenderer,
} from "../../../src/react/index.js";
import { createV1Harness } from "../../../tests/helpers/agents.js";
import "../../../src/styles.css";
import "./demo.css";

const query = new URLSearchParams(location.search);
const injectedLive = window.__PRETTY_AUI_LIVE__;
const liveUrl = query.get("live") ?? injectedLive?.url ?? null;
const liveProtocols =
  liveUrl === injectedLive?.url ? injectedLive.protocols : undefined;
const initialScheme = asScheme(query.get("scheme"));
const environmentSurface = (
  import.meta as ImportMeta & {
    readonly env?: { readonly VITE_PRETTY_AUI_SURFACE?: string };
  }
).env?.VITE_PRETTY_AUI_SURFACE;
const surface = asSurface(query.get("surface") ?? environmentSurface ?? null);
const manualComposition = query.get("composition") === "manual";
const harness = liveUrl
  ? undefined
  : createV1Harness({
      afterThoughtDelayMs: asDelay(query.get("thoughtDelay")),
      afterSubagentDelayMs: asDelay(query.get("subagentDelay")),
    });
const controller = createChat({
  connector: liveUrl
    ? createWebSocketConnector(liveUrl, {
        ...(liveProtocols ? { protocols: liveProtocols } : {}),
      })
    : harness!.connector,
  protocol: 1,
  session: {
    cwd: query.get("cwd") ?? injectedLive?.cwd ?? "/workspace/pretty-aui",
  },
  onEvent(event) {
    if (event.type === "error") console.error(event.error);
  },
});

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
  return (
    <main className="demo-shell" data-scheme={scheme} data-surface={surface}>
      <header className="demo-intro">
        <div>
          <span className="demo-kicker">pretty-aui · ACP client</span>
          <h1>Chat that stays close to the protocol.</h1>
        </div>
        <div className="demo-controls" aria-label="Preview theme">
          {(["light", "dark", "system"] as const).map((value) => (
            <button
              type="button"
              data-active={scheme === value || undefined}
              onClick={() => setScheme(value)}
              key={value}
            >
              {value}
            </button>
          ))}
        </div>
      </header>
      <section className="demo-stage">
        {manualComposition ? (
          <ChatRoot
            controller={controller}
            surface={surface}
            colorScheme={scheme}
            toolActivityRenderer={renderDemoTool}
          >
            <ChatHeader />
            <ChatTranscript />
            <ChatInteractions />
            <ChatComposer />
          </ChatRoot>
        ) : (
          <Chat
            controller={controller}
            surface={surface}
            colorScheme={scheme}
            toolActivityRenderer={renderDemoTool}
          />
        )}
      </section>
      <footer className="demo-foot">
        <span>
          {liveUrl
            ? "Local OpenCode ACP · WebSocket"
            : "Deterministic ACP v1 fixture"}
        </span>
        <span>React · standalone ESM · Jekyll</span>
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

function asSurface(value: string | null): ChatSurface {
  return value === "sidebar" ? "sidebar" : "inline";
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
