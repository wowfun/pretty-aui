import type { ChatController, ChatOptions } from "./core/types.js";
import type { ChatColorScheme, ChatLabels, ChatSurface } from "./presentation.js";
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
export declare function mountChat(target: Element, options: MountChatOptions): MountedChat;
export * from "./core/index.js";
//# sourceMappingURL=standalone.d.ts.map