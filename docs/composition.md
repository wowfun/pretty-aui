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

The active session is the full transcript projection exposed to the macros.
The session drawer also receives bounded summaries for every loaded session so
running turns, pending interactions, and failures remain discoverable without
rendering background transcripts. Draft and transcript scroll state are kept
per loaded session. Selecting a session never interrupts work in another one.
The drawer keeps those summaries in one compact line: loaded sessions expose
their phase and pending interactions, while catalog-only sessions expose a
compact relative update time. A non-current session exposes its supported
actions from a keyboard-accessible trailing menu; the built-in menu contains
only Agent-supported deletion and confirms before deleting. Closing a loaded
session remains a controller lifecycle operation and is not presented as a row
action.

Pass a `modelPreference` store in `ChatOptions` when new sessions should reuse
the model selected in another controller lifetime. The controller recognizes
the ACP `model` category, with the conventional `model` option ID as a fallback,
and calls the synchronous store only with one bounded model value. The host owns
the store's scope and durability. Existing or reopened sessions retain their
own Agent configuration; selecting one only makes its current model the
preference for later new sessions.

Pass `newSessionMode` when every genuinely new session should start in one
fixed Agent-advertised mode. The controller recognizes the ACP `mode` category,
with the conventional `mode` option ID as a fallback, and applies the value
before publishing the new session. Existing, reopened, and restored sessions
retain their Agent-owned mode. An unavailable value leaves the new session in
the Agent default; a failed request additionally emits a non-fatal diagnostic.

Composer configuration renders the complete option set published by the Agent.
Selecting a value applies it through the controller while keeping the remaining
choices available for a later change. Select configuration uses a package-owned
listbox so its presentation is themeable across browsers. The trigger retains
focus while Arrow keys move the active option; Enter or Space commits it,
Escape closes without changing it, and pointer selection returns focus to the
trigger. A host `labels.mode` override replaces the presentation label for the
normalized `mode` category (or conventional `mode` option ID); Agent-owned
choice names and all other configuration names remain unchanged.

Call `controller.appendNotice({ text, level, sessionId? })` when a host-owned
status belongs in one loaded transcript. Omitting `sessionId` targets the active
session. A supplied session ID is opaque and matched exactly. Notice text is
limited to 16 KiB measured in UTF-8 bytes. Notices are
bounded, ordered activities retained only by that loaded
controller record: they survive ordinary session selection, but a full Agent
history load or controller destruction removes them, and they are never sent to
the Agent. A resume-based reconnect retains the existing loaded timeline and
its notices. The boolean result reports whether the target record existed;
malformed notice input throws `INVALID_CONFIGURATION`. Hosts that mount
standalone use the same seam through `mounted.controller`.

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

The built-in body gives strictly recognized execute calls a terminal card,
file reads a line-numbered read card, and ACP diff content a diff card. Other
calls use one input/output card. Long read and diff bodies collapse their middle
without changing what Copy writes; terminal, read, and diff Copy actions write
only their semantic result, while generic input and output sections copy
independently. If an Agent omits or changes a recognized shape, the renderer
falls back without discarding its normalized content. These presentation models
are internal; custom renderers continue to receive the unchanged
`ChatToolCall`.

Tool calls and reasoning use package-owned, single-line disclosure rows. Both
start collapsed, including failed tools, and the complete row toggles the
expanded body. A settled reasoning row previews its first line. While the
current reasoning block streams, the preview switches to its latest line and
follows that line's trailing edge as tokens arrive. A custom tool renderer
replaces only the expanded body; it cannot replace this disclosure behavior.

Each context item actually submitted with a turn is shown after that turn's
user message and before Agent output as a package-owned `Context injection`
disclosure. The row starts collapsed and names the item without exposing its
payload. Its bounded scroll body renders model-facing text literally, keeps
resource identifiers inert, and never interprets context as Markdown, HTML, a
link, or playable media. Repeated per-turn injection produces repeated rows.
The controller sends context-bearing prompts with a versioned user-content
envelope while keeping the composer's original content as the canonical user
bubble. Reopening history written with that envelope removes the model-facing
context and framing from the restored bubble, then recreates best-effort Context
injection rows from the preceding prompt blocks. Reserved context metadata, when
preserved by the Agent, retains item boundaries, IDs, and labels. Flattened
blocks are shown as bounded recovered context rather than being discarded or
presented as user input. These rows are historical transcript projections, not
live host references. Legacy history without an envelope and malformed
envelopes remain unchanged because their blocks cannot be classified safely.

When a context-provider adapter is configured, the composer renders its current
selection above the text input as package-owned chips. The leading add action
asks the adapter to capture a new host context; each chip has an individually
named remove action. Chips wrap inside a bounded scroll region on narrow or
crowded surfaces. They describe only the next-turn selection: sending freezes
that ordered selection, and later add or remove operations do not rewrite prior
activities. Stable slots expose the selection as `composer-context` and each
chip as `composer-context-item`; submitted activities remain `data-kind="context"`.
If resolution fails, no prompt is sent and `CONTEXT_FAILED` retains a bounded
provider error message after the package-owned summary so the host can present
an actionable reason.

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
to its opener when closed. A session action menu moves focus to its action;
Escape closes the menu and restores its trigger before Escape can close the
drawer. Command suggestions use listbox semantics and can be selected from the
composer with Up, Down, Enter, Tab, or Escape. Enter and Tab complete the active
suggestion while the list is open; Shift+Tab keeps native reverse focus
navigation. Every normalized prefix match remains
available through the listbox's bounded scroll region, and keyboard movement
scrolls the active option into view. Once arguments have started, Enter
submits the complete slash command instead of reselecting its name. Blocking
permission and elicitation cards move focus to their first available control,
and the transcript itself is keyboard-scrollable. Streaming status is announced
at the active message rather than making the complete transcript a live region.

Host notices render as transcript flow rows independent of user turns.
Consecutive notices use compact spacing; an informational row is a status and
an error row is an alert. Notice rows do not gain message actions, and a
notice-only transcript keeps the empty-session composer in its hero placement.

## Design system

The [Design system](design-system.md) owns visual hierarchy, responsive rules,
stable `data-pretty-aui-slot` selectors, and public `--pretty-aui-*` custom
properties. Internal `.paui-*` classes and `--paui-*` variables remain
implementation details.

The same styling contract applies to React and standalone rendering. Public
custom properties cross the standalone host into its Shadow DOM, while the host
continues to own outer placement and sizing.
