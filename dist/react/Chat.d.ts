import type { ChatProps, ChatRootProps } from "./types.js";
/**
 * Renders the normalized chat timeline and ACP interactions.
 *
 * A controller created from `options` is destroyed on unmount. A controller
 * passed through `controller` remains owned by the caller.
 */
export declare function Chat(props: ChatProps): import("react").JSX.Element;
/** Owns or borrows one controller and provides one snapshot subscription. */
export declare function ChatRoot(props: ChatRootProps): import("react").JSX.Element;
/** Renders session identity, protocol state, new-session, and history actions. */
export declare function ChatHeader(): import("react").JSX.Element;
/** Renders normalized conversation history and owns transcript scrolling. */
export declare function ChatTranscript(): import("react").JSX.Element;
/** Renders authentication, ACP interactions, and reconnectable errors. */
export declare function ChatInteractions(): import("react").JSX.Element;
/** Renders draft entry, commands, context, configuration, send, and cancel. */
export declare function ChatComposer(): import("react").JSX.Element;
//# sourceMappingURL=Chat.d.ts.map