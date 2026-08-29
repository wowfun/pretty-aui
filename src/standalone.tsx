import { createRoot } from "react-dom/client";
import { createChat } from "./core/chat-controller.js";
import type { ChatController, ChatOptions } from "./core/types.js";
import { Chat } from "./react/Chat.js";
import type {
  ChatColorScheme,
  ChatLabels,
  ChatSurface,
} from "./presentation.js";
import styles from "./styles.css?inline";

const MAX_DRAFT_LENGTH = 1_048_576;
const MAX_NONCE_LENGTH = 256;
const CSP_NONCE_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/;

interface MountState {
  readonly shadow: ShadowRoot;
  readonly style: HTMLStyleElement;
  readonly container: HTMLDivElement;
}

const mountedTargets = new WeakMap<Element, MountState>();
const ownedShadowRoots = new WeakMap<Element, ShadowRoot>();

interface MountPresentationOptions {
  readonly surface?: ChatSurface | undefined;
  readonly colorScheme?: ChatColorScheme | undefined;
  readonly labels?: Partial<ChatLabels> | undefined;
  readonly styleNonce?: string | undefined;
}

/** Controller ownership plus presentation options accepted by `mountChat`. */
export type MountChatOptions = MountPresentationOptions &
  (
    | {
        readonly options: ChatOptions;
        readonly controller?: never;
      }
    | {
        readonly controller: ChatController;
        readonly options?: never;
      }
  );

/** Handle returned by the standalone Shadow DOM mount. */
export interface MountedChat {
  /** Controller created by or borrowed for this mount. */
  readonly controller: ChatController;
  /** Settles after the controller's initial connection policy completes. */
  readonly ready: Promise<void>;
  /** Replaces the active session draft without traversing the Shadow DOM. */
  setDraft(text: string, options?: { readonly focus?: boolean }): void;
  /** Focuses the composer without traversing the Shadow DOM. */
  focusComposer(): void;
  /** Unmounts the renderer and removes owned nodes. Owned controllers are destroyed. */
  unmount(): Promise<void>;
}

/**
 * Mounts a self-contained chat into an open Shadow DOM on `target`.
 *
 * `unmount()` is deterministic and repeated calls are safe. A connected host
 * is also unmounted automatically when it is removed from the document.
 */
export function mountChat(
  target: Element,
  options: MountChatOptions,
): MountedChat {
  if (mountedTargets.has(target)) {
    throw new Error("pretty-aui: this target is already mounted");
  }
  const ownsController = Object.hasOwn(options, "options");
  const borrowsController = Object.hasOwn(options, "controller");
  if (ownsController === borrowsController) {
    throw new TypeError(
      "pretty-aui: mountChat requires exactly one of options or controller",
    );
  }
  if (options.styleNonce !== undefined) assertStyleNonce(options.styleNonce);
  const ownedShadow = ownedShadowRoots.get(target);
  if (target.shadowRoot && target.shadowRoot !== ownedShadow) {
    throw new Error(
      "pretty-aui: mountChat requires a target without an existing shadow root",
    );
  }
  const shadow = ownedShadow ?? target.attachShadow({ mode: "open" });
  ownedShadowRoots.set(target, shadow);
  const style = document.createElement("style");
  if (options.styleNonce !== undefined) {
    style.nonce = options.styleNonce;
  }
  style.textContent = styles;
  const container = document.createElement("div");
  container.className = "pretty-aui-standalone-root";
  shadow.append(style, container);
  const state: MountState = { shadow, style, container };
  mountedTargets.set(target, state);

  const { surface, colorScheme, labels } = options;
  const controller = ownsController
    ? createChat(options.options as ChatOptions)
    : (options.controller as ChatController);
  const root = createRoot(container);
  root.render(
    <Chat
      controller={controller}
      surface={surface}
      colorScheme={colorScheme}
      labels={labels}
    />,
  );
  let unmounted = false;
  let removalObserver: MutationObserver | undefined;
  const unmount = async () => {
    if (unmounted) return;
    unmounted = true;
    removalObserver?.disconnect();
    try {
      root.unmount();
    } finally {
      try {
        if (ownsController) await controller.destroy();
      } finally {
        if (mountedTargets.get(target) === state) {
          style.remove();
          container.remove();
          mountedTargets.delete(target);
        }
      }
    }
  };
  if (typeof MutationObserver !== "undefined") {
    removalObserver = observeTargetRemoval(target, () => void unmount());
  }
  return {
    controller,
    ready: controller.ready,
    setDraft(text, draftOptions) {
      assertMounted(unmounted);
      if (text.length > MAX_DRAFT_LENGTH) {
        throw new RangeError(
          `pretty-aui: draft exceeds ${MAX_DRAFT_LENGTH} characters`,
        );
      }
      const textarea = composerTextarea(shadow);
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      setter?.call(textarea, text);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      if (draftOptions?.focus) textarea.focus();
    },
    focusComposer() {
      assertMounted(unmounted);
      composerTextarea(shadow).focus();
    },
    unmount,
  };
}

function assertStyleNonce(nonce: string): void {
  if (
    nonce.length === 0 ||
    nonce.length > MAX_NONCE_LENGTH ||
    !CSP_NONCE_PATTERN.test(nonce)
  ) {
    throw new TypeError("pretty-aui: styleNonce is not a valid CSP nonce");
  }
}

function assertMounted(unmounted: boolean): void {
  if (unmounted) throw new Error("pretty-aui: mount has been unmounted");
}

function composerTextarea(shadow: ShadowRoot): HTMLTextAreaElement {
  const textarea = shadow.querySelector<HTMLTextAreaElement>(
    '[data-pretty-aui-slot="composer-input"] textarea',
  );
  if (!textarea) {
    throw new Error("pretty-aui: composer is not mounted yet");
  }
  return textarea;
}

function observeTargetRemoval(
  target: Element,
  onRemove: () => void,
): MutationObserver {
  let wasConnected = target.isConnected;
  const observer = new MutationObserver(() => {
    if (wasConnected && !target.isConnected) {
      onRemove();
      return;
    }
    watchCurrentAncestry();
  });
  const watchCurrentAncestry = () => {
    observer.disconnect();
    if (!target.isConnected) {
      observer.observe(target.ownerDocument.documentElement, {
        childList: true,
        subtree: true,
      });
      return;
    }
    wasConnected = true;
    let current: Node = target;
    while (true) {
      if (current.parentNode) {
        observer.observe(current.parentNode, { childList: true });
        current = current.parentNode;
        continue;
      }
      const root = current.getRootNode();
      if (root instanceof ShadowRoot) {
        current = root.host;
        continue;
      }
      break;
    }
  };
  watchCurrentAncestry();
  return observer;
}

export * from "./core/index.js";
