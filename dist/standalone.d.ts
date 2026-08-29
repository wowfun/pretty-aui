import type { ChatController, ChatOptions } from "./core/types.js";
import type { ChatColorScheme, ChatLabels, ChatSurface } from "./presentation.js";
interface MountPresentationOptions {
    readonly surface?: ChatSurface | undefined;
    readonly colorScheme?: ChatColorScheme | undefined;
    readonly labels?: Partial<ChatLabels> | undefined;
    readonly styleNonce?: string | undefined;
}
/** Controller ownership plus presentation options accepted by `mountChat`. */
export type MountChatOptions = MountPresentationOptions & ({
    readonly options: ChatOptions;
    readonly controller?: never;
} | {
    readonly controller: ChatController;
    readonly options?: never;
});
/** Handle returned by the standalone Shadow DOM mount. */
export interface MountedChat {
    /** Controller created by or borrowed for this mount. */
    readonly controller: ChatController;
    /** Settles after the controller's initial connection policy completes. */
    readonly ready: Promise<void>;
    /** Replaces the active session draft without traversing the Shadow DOM. */
    setDraft(text: string, options?: {
        readonly focus?: boolean;
    }): void;
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
export declare function mountChat(target: Element, options: MountChatOptions): MountedChat;
export * from "./core/index.js";
//# sourceMappingURL=standalone.d.ts.map