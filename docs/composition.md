# Composition

`Chat` is the complete default UI. Use the flat macros only when the host needs
to place its own content between chat regions or omit a region.

```tsx
import {
  ChatComposer,
  ChatHeader,
  ChatInteractions,
  ChatRoot,
  ChatTranscript,
} from "pretty-aui/react";

<ChatRoot controller={controller} surface="sidebar" colorScheme="system">
  <ChatHeader />
  <ChatTranscript />
  <ChatInteractions />
  <ChatComposer />
</ChatRoot>;
```

Every macro must be a descendant of one `ChatRoot`; rendering one outside the
root throws a descriptive error. A root accepts either immutable `options` or
a caller-owned `controller`, never both. Remount an options-owned root to
replace construction options. The root destroys only the controller it creates.

`surface="inline"` is the default. `surface="sidebar"` makes header and spacing
compact, but the host still owns the sidebar shell. Both surfaces respond to
their container width, not the browser viewport. `colorScheme` accepts `light`,
`dark`, or `system`.

## Tool activity renderer

Tool activity is the only public rendering seam. The renderer receives one
normalized `ChatToolCall`. Return `undefined` to keep the built-in body.
Message, thought, plan, terminal, permission, elicitation, and error rendering
remain package-owned so their safety and response behavior stay coherent.

```tsx
<Chat
  controller={controller}
  toolActivityRenderer={(tool) =>
    tool.kind === "search" ? <SearchResult tool={tool} /> : undefined
  }
/>
```

The package always renders the disclosure summary, status, and semantic
wrapper. If a custom renderer throws, the built-in body is rendered for the
remainder of that tool activity; later streaming updates do not retry it or
repeat its browser-console diagnostic.

Tool calls and reasoning use package-owned, single-line disclosure rows. Both
start collapsed, including failed tools, and the complete row toggles the
expanded body. A settled reasoning row previews its first line. While the
current reasoning block streams, the preview switches to its latest line and
follows that line's trailing edge as tokens arrive. A custom tool renderer
replaces only the expanded body; it cannot replace this disclosure behavior.

An OpenCode task reported as a `think` tool is presented as a distinct Agent
row when its normalized input contains `subagent_type` plus a task description
and prompt. Its collapsed row shows the agent type, task description, ACP
status, and an observation timer that starts when the current UI first sees the
live call; the timer is not the child session's authoritative runtime. A child
session action appears after a bounded session ID is available and is enabled
only while the controller can perform a session mutation. Entering it adds the
parent to the header title trail, whose ancestor actions load the corresponding
transcript. The stable activity slot exposes Agent rows as
`data-kind="subagent"`. Ordinary `think` tools keep the generic tool row.

Current OpenCode ACP does not publish a newly created foreground child ID or
the child's internal activity while its parent tool is running. Consequently,
the parent row does not invent step text and can open a new child only after
the ID arrives in settled task metadata. A settled background launch is labeled
as started rather than tracked because its eventual job result is not applied
to the original ACP tool call.

The built-in session drawer traps keyboard focus while modal and restores focus
to its opener when closed. Command suggestions use listbox semantics and can be
selected from the composer with Up, Down, Enter, or Escape. Once arguments have
started, Enter submits the complete slash command instead of reselecting its
name. Blocking permission and elicitation cards move focus to their first
available control, and the transcript itself is keyboard-scrollable. Streaming status is
announced at the active message rather than making the complete transcript a
live region.

## Styling contract

Internal `.paui-*` class names are implementation details. Stable selectors
use `data-pretty-aui-slot`:

- `root`, `header`, `transcript`, `message`, `activity`, `interactions`
- `composer`, `composer-input`, `composer-actions`

Depending on the slot, state is exposed through `data-surface`, `data-scheme`,
`data-phase`, `data-role`, `data-kind`, `data-status`, and `data-placement`.
The root accepts these public custom properties:

```css
.my-assistant {
  --pretty-aui-color-background: #ffffff;
  --pretty-aui-color-surface: #f7f8fa;
  --pretty-aui-color-surface-raised: #ffffff;
  --pretty-aui-color-user-bubble: #edf3fe;
  --pretty-aui-color-text: #0f1115;
  --pretty-aui-color-text-muted: #667085;
  --pretty-aui-color-border: #e5e7eb;
  --pretty-aui-color-accent: #4176e6;
  --pretty-aui-color-on-accent: #ffffff;
  --pretty-aui-color-accent-soft: #edf3fe;
  --pretty-aui-color-danger: #c63d4f;
  --pretty-aui-color-warning: #a86610;
  --pretty-aui-color-success: #24845b;
  --pretty-aui-font-sans: ui-sans-serif, system-ui, sans-serif;
  --pretty-aui-font-mono: ui-monospace, monospace;
  --pretty-aui-shadow-raised:
    0 4px 12px 0 rgb(0 0 0 / 2%), 0 2px 8px 0 rgb(0 0 0 / 4%);
  --pretty-aui-height: 680px;
  --pretty-aui-content-max-width: 748px;
  --pretty-aui-composer-max-width: 780px;
  --pretty-aui-gutter: 16px;
}
```

These properties cross the standalone Shadow DOM through the host element.
The package supplies fallback values at consumption sites, so host values win.
