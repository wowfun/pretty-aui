import type { ChatController, ChatOptions } from "./types.js";
/**
 * Creates a framework-neutral chat controller and starts ACP initialization.
 *
 * The caller owns the returned controller and must call `destroy()` when its
 * lifetime ends.
 */
export declare function createChat(options: ChatOptions): ChatController;
//# sourceMappingURL=chat-controller.d.ts.map