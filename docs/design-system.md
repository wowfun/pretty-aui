# Design system

pretty-aui presents a conversation as an evidence stream. A user prompt is a
compact bubble, while Agent answers remain open on the transcript. Reasoning,
tool calls, plans, and context sit in quieter flow rows. The composer is the
primary raised surface and the clearest invitation to act.

This reference defines the current visual rules and public styling interface.
It is written for maintainers who change or review the presentation. React
composition and rendering behavior remain in [Composition](composition.md).

## Ownership

Each part of the system has one owner:

| Owner                                 | Responsibility                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| This reference                        | Visual hierarchy, public styling semantics, responsive rules, and maintainer requirements |
| [Composition](composition.md)         | React macros, rendering seams, and interaction behavior                                   |
| [`src/styles.css`](../src/styles.css) | Executable defaults, internal tokens and classes, and container queries                   |
| Visual baselines                      | Reviewed browser output for supported fixtures and container sizes                        |

The public contract consists of `--pretty-aui-*` custom properties and
`data-pretty-aui-slot` selectors documented here. Variables prefixed with
`--paui-*` and classes prefixed with `.paui-*` are implementation details.
Screenshot baselines record the result of the contract. They do not define a
second token or component catalog.

## Visual foundations

### Hierarchy

Structure carries meaning. Human input uses a filled bubble because it starts a
turn. Agent prose uses the background directly so the answer reads as the main
document. Supporting process evidence uses single-line disclosures with muted
labels and compact icons. Borders separate regions and interactive surfaces;
they are not decorative frames around every activity.

The interface spends elevation on the composer, command list, and session
drawer. Ordinary Agent content stays flat. Status colors identify connection,
progress, success, warning, and failure without replacing text labels.

### Color

`colorScheme` selects `light`, `dark`, or `system`. The system scheme follows
`prefers-color-scheme`. Theme changes replace semantic defaults at the root;
component rules do not contain their own light or dark branches.

The table lists the built-in fallbacks. A host value overrides both built-in
schemes for that chat root.

| Public property                     | Light fallback | Dark fallback | Use                                                |
| ----------------------------------- | -------------- | ------------- | -------------------------------------------------- |
| `--pretty-aui-color-background`     | `#ffffff`      | `#151517`     | Root, transcript, and dock background              |
| `--pretty-aui-color-surface`        | `#f7f8fa`      | `#232324`     | Inline code, cards, and hover fills                |
| `--pretty-aui-color-surface-raised` | `#ffffff`      | `#2c2c2e`     | Composer, menus, and floating controls             |
| `--pretty-aui-color-user-bubble`    | `#edf3fe`      | `#2c2c2e`     | User-authored message bubble                       |
| `--pretty-aui-color-text`           | `#0f1115`      | `#f9fafb`     | Primary content and control text                   |
| `--pretty-aui-color-text-muted`     | `#667085`      | `#a4a7ae`     | Metadata, previews, and secondary labels           |
| `--pretty-aui-color-border`         | `#e5e7eb`      | `#343438`     | Region and control boundaries                      |
| `--pretty-aui-color-accent`         | `#4176e6`      | `#679efe`     | Focus, primary actions, links, and active progress |
| `--pretty-aui-color-on-accent`      | `#ffffff`      | `#0f1115`     | Content placed on the accent fill                  |
| `--pretty-aui-color-accent-soft`    | `#edf3fe`      | `#202c43`     | Selected and low-emphasis accent surfaces          |
| `--pretty-aui-color-danger`         | `#c63d4f`      | `#f08a96`     | Failed or cancelled status and error treatment     |
| `--pretty-aui-color-warning`        | `#a86610`      | `#e6ab5e`     | Reserved warning semantic                          |
| `--pretty-aui-color-success`        | `#24845b`      | `#65c99c`     | Ready presence and completed plan items            |

Custom palettes must preserve readable text on the root, user bubble, raised
surface, and accent fill. Muted text still carries operational information, so
it must not be treated as disabled decoration.

### Typography

The sans face carries conversation and controls. The mono face is reserved for
protocol versions, usage, statuses, URLs, code, and terminal-like values.

| Role                   | Size and line height | Treatment                                                  |
| ---------------------- | -------------------- | ---------------------------------------------------------- |
| Agent answer           | `16px / 28px`        | Open prose on the background                               |
| User prompt            | `16px / 24px`        | Compact text inside the user bubble                        |
| Flow title and preview | `14px / 24px`        | Regular weight with muted semantic colors                  |
| Header identity        | `13px`               | `600` weight, truncated to one line                        |
| Supporting UI          | `10px` to `13px`     | Labels and metadata kept subordinate to transcript content |

Markdown headings keep the conversation size and add weight instead of
introducing a display scale. This keeps long Agent output continuous with the
rest of the turn. Code and preformatted output use the mono face and preserve
source columns with horizontal overflow.

### Geometry and spacing

The root fills its host width and defaults to `680px` high with a `420px`
minimum. Transcript content is capped at `748px`; the composer is capped at
`780px`. The wider composer remains visually stable while multiline answers
use a slightly narrower reading measure.

The root uses a `14px` radius. User bubbles and the composer use a `22px`
radius. Cards, fields, disclosures, and icon controls use smaller radii that
match their footprint. The raised shadow belongs to floating or input surfaces,
not ordinary transcript rows.

The transcript owns vertical scrolling. The header, interaction region, and
composer remain inside the chat root. The host owns the root's outer placement,
height, and any inline or sidebar shell.

### Motion

Motion explains state. Short opacity, border, and surface transitions respond
to focus or hover. The empty-state composer moves into its dock when content or
an interaction appears. A running disclosure uses a restrained sweep, and an
active subagent may use a spinner.

`prefers-reduced-motion: reduce` removes scrolling animation, collapses
transition durations, and replaces repeating motion with a static state. New
motion must include an equivalent reduced-motion presentation in the same
change.

## Component rules

### Root and header

The root is a bounded application surface with one border and one background.
It contains the header, transcript, interaction region, and composer without
modifying `body` or the viewport. The header uses a translucent background and
bottom border so transcript content can scroll behind a stable identity row.

The header keeps session identity first and actions second. Protocol and usage
metadata yield before the title. Child-session lineage becomes a back action
when the surface is compact; the UI does not squeeze a full breadcrumb into a
narrow header.

### Session drawer

The modal session drawer remains a flat switcher rather than a second workspace
navigation system. Each session is a compact one-line row with a truncated
title and trailing state or relative time. Running state uses a leading spinner;
the selected row and pointer hover share the same neutral surface fill.
Catalog session ages use bounded minute, hour, day, month, or year values and
flow through `ChatLabels`; invalid Agent timestamps remain visible literally.

For a non-current session with a supported action, pointer hover or keyboard
focus replaces the trailing metadata with an ellipsis without changing row
geometry. The action stays visible on devices without hover. An open menu pins
the row fill and uses the raised menu surface; destructive deletion remains
explicitly named and confirmed. Closing a loaded session is not a row action.

### Transcript and messages

Turns use vertical rhythm instead of enclosing cards. User messages align to
the end and occupy at most `525px` or `82%` of the reading width. Agent messages
use the available reading width without a bubble.

Message actions follow the message they affect. User messages expose their
action row. A completed turn exposes actions only for its last Assistant
message. Timestamps remain visually hidden until pointer hover or keyboard
focus enters the message region. Copy feedback replaces the copy label and icon
without moving the row.

`ChatMessage.timestamp` is a reliable local event time, not an inferred Agent
history time. It is present for locally submitted user messages and for the
last live Assistant answer when its turn completes; replayed history and
cancelled answers omit it unless the Agent protocol later supplies an owning
time contract. The visible clock uses the runtime locale for calendar text:
time only on the current local day, month/day plus time within the current
year, and year/month/day plus time otherwise. Mounted clocks re-evaluate at the
next local midnight.

Images stay within the transcript width and a bounded height. Markdown,
terminal output, diffs, and literal resources own their overflow rather than
widening the root.

### Activity rows

Reasoning, tools, plans, context, host notices, and subagent work share a compact flow-row
language. The row begins with a type icon, then a title, optional preview, and
status. The summary stays one line; long previews truncate. Expanded bodies are
indented under the same leading edge.

Reasoning and tool disclosures start collapsed, including failures. Running
state changes the row's motion and status, not its overall geometry. Danger
color is reserved for failed or cancelled work. Plan marks use success for
completed items and accent for the current item.

Expanded tool bodies use a compact code-surface family. Execute cards keep the
command banner fixed above independently scrolling output. Read cards place
line numbers in an inert gutter, and read and diff cards collapse only their
middle so the beginning and conclusion stay visible. Input/output fallbacks cap
and scroll each section independently. Copy controls stay in the card chrome,
use visible keyboard focus, and replace their label with feedback without
changing card geometry. They copy the complete semantic payload rather than a
folded viewport or its labels.

### Interactions

Permissions, elicitation, authentication, and recoverable errors appear between
the transcript and composer. They share the transcript width, use a bordered
surface, and keep the requested decision and its actions together. Primary,
secondary, and quiet buttons must remain distinguishable without relying on
color alone.

Blocking interactions receive focus when they appear. Error text names the
failure; empty content tells the user what will appear and leaves the composer
as the next action.

### Composer

The composer is the primary raised surface. With no transcript, interaction,
authentication request, or error, it occupies the hero position. Once any of
those exists, it docks at the bottom without becoming a viewport-level fixed
element.

The input grows to a bounded height and then scrolls. Context chips sit above
the draft in a wrapping, bounded region. Configuration stays at the leading
edge of the action row; send or stop occupies the trailing circular action.
Configuration selects use plain text and a disclosure arrow without an
enclosing border. Keyboard focus uses a neutral surface tint without changing
the text color, adding decoration, or restoring a control frame. Their raised
listboxes use the same neutral text and selection surfaces, no visible frame,
and a thin muted scrollbar. The composer uses elevation rather than a visible
border and does not recolor its frame when focus moves among its controls.
The command list uses the same raised surface and width as the composer.

### Drawers and overlays

The session drawer is the only package-owned modal shell. It stays within the
chat root, enters from the trailing edge, and never creates an outer sidebar.
Menus and drawers use the raised surface, border, and shadow tokens. They trap
or manage focus according to their semantic role and restore focus when they
close. A loaded session in the running phase places a small accent spinner
immediately after its bounded title; other phases remain static. Reduced-motion
presentation replaces that repeating motion with a solid status dot.

## Surfaces and container sizes

`surface="inline"` is the default composition. `surface="sidebar"` selects
compact header and lineage semantics even when the container is wide. Surface
is a host intent, not a measurement result.

Layout responds to the `.pretty-aui` container:

| Container        | Adaptation                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Above `560px`    | Full header metadata, `16px` Agent text, and standard gutter                                                                              |
| `560px` or below | Compact header, back-style lineage, `15px` transcript text, wider user bubbles, stretched interaction actions, and tighter composer edges |
| `380px` or below | Protocol metadata hides, user bubbles may use `92%` of the width, and interaction icons yield to the decision text                        |

Viewport media queries are reserved for user preferences such as color scheme
and reduced motion. A host can place the same root in a page column, narrow
panel, or sidebar without changing package code.

## Accessibility and content safety

Keyboard focus normally uses a `2px` accent outline with separation from the
control. The borderless composer configuration trigger is the deliberate
exception and uses its documented neutral surface tint. Buttons, form fields,
disclosures, links, transcript scrolling, and literal context scrolling keep
visible focus. A pointer-only reveal must also appear through `:focus-within`
or an equivalent keyboard state.

The transcript is keyboard-scrollable. Command suggestions use combobox and
listbox semantics. The session drawer traps focus, closes with Escape, and
restores focus to its opener. Blocking interactions move focus to their first
available control.

Only the active streaming Assistant message is a polite live region. The whole
transcript never becomes live, which prevents repeated announcements as content
grows. A newly appended informational notice uses status semantics and an error
notice uses alert semantics. Notice rows are flat text-and-icon evidence: they
have no fill, border, radius, or shadow. Icons that repeat a visible label are
hidden from assistive technology; icon-only controls receive a localized
accessible name.

Rendering safety is part of presentation. Markdown drops raw active content,
unsafe links remain inert, and literal context is never interpreted as
Markdown, HTML, navigable links, or playable media. The complete trust rules
live in [Architecture](architecture.md#trust).

## Public styling interface

### Stable slots

Hosts may select the following elements. A missing optional slot means that its
feature is not rendered in the current snapshot.

| `data-pretty-aui-slot`  | State attributes                            |
| ----------------------- | ------------------------------------------- |
| `root`                  | `data-surface`, `data-scheme`, `data-phase` |
| `header`                | None                                        |
| `transcript`            | None                                        |
| `message`               | `data-role`, optional `data-pending`        |
| `message-actions`       | `data-clock`                                |
| `activity`              | `data-kind`, `data-status`, `data-level`    |
| `interactions`          | None                                        |
| `composer`              | `data-placement`                            |
| `composer-input`        | None                                        |
| `composer-actions`      | None                                        |
| `composer-context`      | None                                        |
| `composer-context-item` | None                                        |

Slot selectors are stable integration points, not permission to depend on the
element type or internal descendants. State values come from the documented
presentation and normalized chat vocabularies. Hosts must tolerate new state
values without hiding the affected content.

### Type, elevation, and layout properties

| Public property                   | Fallback                                                                                     | Use                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `--pretty-aui-font-sans`          | `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Conversation and controls                      |
| `--pretty-aui-font-mono`          | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`                           | Code and compact machine metadata              |
| `--pretty-aui-shadow-raised`      | `0 4px 12px 0 rgb(0 0 0 / 2%), 0 2px 8px 0 rgb(0 0 0 / 4%)`                                  | Composer, menus, drawer, and floating controls |
| `--pretty-aui-height`             | `680px`                                                                                      | Root height                                    |
| `--pretty-aui-min-height`         | `420px`                                                                                      | Root minimum height                            |
| `--pretty-aui-content-max-width`  | `748px`                                                                                      | Transcript and interaction measure             |
| `--pretty-aui-composer-max-width` | `780px`                                                                                      | Composer and command-list measure              |
| `--pretty-aui-gutter`             | `16px`                                                                                       | Inline root gutter                             |

Custom properties cascade through the standalone host into its Shadow DOM. A
host value therefore works for React and standalone rendering:

```css
.my-assistant {
  --pretty-aui-color-accent: #315fcf;
  --pretty-aui-content-max-width: 720px;
  --pretty-aui-height: 100%;
}
```

For `--pretty-aui-height: 100%`, the standalone mount target must provide a
definite height. The package-owned wrapper carries that height to the chat root
without assigning a size to the host or viewport.

## Changing the system

Change the visual contract in this order:

1. Update this reference with the semantic role, component rule, responsive
   behavior, and public customization effect.
2. Update `src/styles.css` and the owning React presentation together. Reusable
   theme values resolve through semantic variables; component-local geometry
   stays local unless a host needs to customize it.
3. Add or update the closest behavior test. Review screenshot changes as
   intentional contract changes, never as a way to clear a failing gate.
4. Run the affected checks and build the tracked distribution when source
   changed.

Add a public custom property or stable slot only for a current host integration
need. Keep scheme selection at the root, container adaptation at the root
container, and package-owned safety behavior inside the renderer.
