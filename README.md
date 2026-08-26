# pretty-aui

A minimal, composable Agent Client Protocol chat UI for React and static sites.
It ships a framework-neutral controller, one React presentation, and a
standalone Shadow DOM mount of that same presentation. The package is
pre-release and may make breaking changes before 1.0.

## Install

```sh
pnpm add pretty-aui react react-dom
```

## React

```tsx
import { Chat, createWebSocketConnector } from "pretty-aui/react";
import "pretty-aui/styles.css";

export function Assistant() {
  return (
    <Chat
      surface="inline"
      colorScheme="system"
      options={{
        connector: createWebSocketConnector("wss://example.com/acp"),
        session: { cwd: "/workspace/project" },
      }}
    />
  );
}
```

`Chat` includes the header, transcript, interactions, and composer. For custom
assembly, tool rendering, stable data attributes, and CSS variables, see
[Composition](docs/composition.md).

The root `pretty-aui` entry is framework-neutral. React and React DOM are
optional package features used only by `pretty-aui/react`; the bundled
standalone entry does not resolve either peer.

## Static sites

Copy the complete standalone directory because the entry may import relative
chunks:

```sh
cp -R node_modules/pretty-aui/dist/standalone assets/pretty-aui
```

```html
<div id="assistant"></div>

<script type="module">
  import {
    mountChat,
    createWebSocketConnector,
  } from "/assets/pretty-aui/pretty-aui.js";

  const mounted = mountChat(document.querySelector("#assistant"), {
    connector: createWebSocketConnector("wss://example.com/acp"),
    session: { cwd: "/workspace/project" },
    surface: "sidebar",
    colorScheme: "system",
  });

  await mounted.ready;
</script>
```

ACP v1 is the default. Call `mounted.unmount()` for deterministic cleanup; the
standalone mount also destroys itself if its connected host is removed from the
document.

Browsers need an authenticated HTTP or WebSocket ACP gateway. Production
gateways should use their host application's authenticated channel. The local
OpenCode bridge in this repository is a development-only tool with a
short-lived per-process token injected into its loopback-served page and carried
as a WebSocket subprotocol, loopback TCP and browser-Origin checks, and bounded
connections. It does not print or place the token in a page URL.

## Local development

Use the Node.js version pinned in `.node-version` (26.3.1 or newer) and pnpm
10.34. Install dependencies and start the React example:

```sh
pnpm install
pnpm dev -- --surface inline
```

The example uses a deterministic ACP fixture by default, so it does not need an
agent service or credentials. Run the repository checks before submitting a
change:

```sh
pnpm format:check
pnpm check
pnpm test:e2e
```

Reviewed screenshot baselines run only with Chromium on Linux. Other platforms
still run the functional browser suite but skip `visual.spec.ts`.

Run `pnpm build` after changing `src/`. The build writes the distributable files
to `dist/`.

To open the React example with a real local OpenCode session, install the
OpenCode CLI and run:

```sh
pnpm dev:opencode -- --surface sidebar
```

This starts Vite and the localhost bridge, injects a short-lived random bridge
token into the served development page, then opens the live page in your
default browser. It does not print the token, put it in browser history, or send
a prompt. The bridge refuses non-loopback binds and TCP peers; an explicit
origin allowlist permits only the additional browser page origins named by the
developer. The bridge token is not inherited by the spawned OpenCode process.

## License

MIT
