# pretty-aui

A minimal, composable Agent Client Protocol chat UI for React and static sites.
It ships a framework-neutral controller, one React presentation, and a
standalone Shadow DOM mount of that same presentation. The package is
pre-release and may make breaking changes before 1.0.

## Install

```sh
pnpm add pretty-aui react react-dom
```

The published package supports Node.js `^22.22.2`, `^24.15.0`, or `>=26.0.0`,
matching the server-safe sanitizer used by the React entry. The copied
standalone bundle runs in the browser and has no Node.js runtime dependency.

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
assembly and tool rendering, see [Composition](docs/composition.md). For visual
rules, stable data attributes, and CSS variables, see the
[Design system](docs/design-system.md).

The root `pretty-aui` entry is framework-neutral. React and React DOM are
optional package features used only by `pretty-aui/react`; the bundled
standalone entry does not resolve either peer.

## Static sites

Copy the complete standalone directory because the entry may import relative
chunks. The directory's `LICENSE` and `THIRD_PARTY_LICENSES.txt` files cover
pretty-aui and the dependencies embedded in the browser bundle; retain both in
every redistributed copy:

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
    options: {
      connector: createWebSocketConnector("wss://example.com/acp"),
      session: { cwd: "/workspace/project" },
    },
    surface: "sidebar",
    colorScheme: "system",
  });

  await mounted.ready;
</script>
```

ACP v1 is the default. Passing `options` creates a controller owned by the
mount; pass `controller` instead to borrow an existing controller. The two
modes are mutually exclusive. `styleNonce` nonces the package style element for
a strict host CSP. `setDraft()` and `focusComposer()` provide host integration
without Shadow DOM traversal. Call `mounted.unmount()` for deterministic
cleanup; the standalone mount also unmounts itself if its connected host is
removed from the document.

Browsers need an authenticated HTTP or WebSocket ACP gateway. Production
gateways should use their host application's authenticated channel. The local
OpenCode bridge in this repository is a development-only tool with a
short-lived per-process token injected into its loopback-served page and carried
as a WebSocket subprotocol, loopback TCP and browser-Origin checks, and bounded
connections. It does not print or place the token in a page URL.

## Local development

Repository development uses the Node.js version pinned in `.node-version`
(26.3.1 or newer) and pnpm 10.34. Install dependencies and start the React
example:

```sh
pnpm install
pnpm dev
```

The page uses a deterministic ACP fixture by default, so it does not need an
agent service or credentials. It is a single Composer context playground:
selectable context is editable before a turn and disclosed in the transcript
after submission. The renderer adapts to the width of its host container. The
theme controls preserve the `thoughtDelay`, `subagentDelay`, and
`usage=extreme` diagnostics in the page URL.

Run the repository checks before submitting a change:

```sh
pnpm check
pnpm test:e2e
```

`pnpm test:e2e` is the Chromium browser gate; reviewed screenshot baselines run
only with Chromium on Linux. Firefox and WebKit are non-blocking compatibility
signals and can be run explicitly with `pnpm test:e2e:compat`; they skip
`visual.spec.ts`.

Run `pnpm build` after changing `src/`. The build writes the distributable files
to `dist/`.

To open the React example with a real local OpenCode session, install the
OpenCode CLI and run:

```sh
pnpm dev:opencode
```

This starts Vite and the localhost bridge, injects a short-lived random bridge
token into the served development page, then opens the live page in your
default browser. The same Composer context playground is used, while the page
source is fixed to OpenCode for that run. It does not print the token, put it in
browser history, or send a prompt. The bridge refuses non-loopback binds and TCP
peers; an explicit origin allowlist permits only the additional browser page
origins named by the developer. The bridge token is not inherited by the
spawned OpenCode process.

## License

MIT
