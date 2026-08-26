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

interface MountState {
  readonly shadow: ShadowRoot;
  readonly style: HTMLStyleElement;
  readonly container: HTMLDivElement;
}

const mountedTargets = new WeakMap<Element, MountState>();
const ownedShadowRoots = new WeakMap<Element, ShadowRoot>();

/** Core construction plus presentation options accepted by `mountChat`. */
export type MountChatOptions = ChatOptions & {
  readonly surface?: ChatSurface | undefined;
  readonly colorScheme?: ChatColorScheme | undefined;
  readonly labels?: Partial<ChatLabels> | undefined;
};

/** Handle returned by the standalone Shadow DOM mount. */
export interface MountedChat {
  /** Controller created and owned by this mount. */
  readonly controller: ChatController;
  /** Settles after the controller has connected and created a session. */
  readonly ready: Promise<void>;
  /** Unmounts the renderer, destroys the controller, and removes owned nodes. */
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
  const ownedShadow = ownedShadowRoots.get(target);
  if (target.shadowRoot && target.shadowRoot !== ownedShadow) {
    throw new Error(
      "pretty-aui: mountChat requires a target without an existing shadow root",
    );
  }
  const shadow = ownedShadow ?? target.attachShadow({ mode: "open" });
  ownedShadowRoots.set(target, shadow);
  const style = document.createElement("style");
  style.textContent = styles;
  const container = document.createElement("div");
  container.className = "pretty-aui-standalone-root";
  shadow.append(style, container);
  const state: MountState = { shadow, style, container };
  mountedTargets.set(target, state);

  const { surface, colorScheme, labels, ...controllerOptions } = options;
  const controller = createChat(controllerOptions);
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
        await controller.destroy();
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
    unmount,
  };
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
