import type { ContentBlock } from "../core/types.js";
import type { ChatLabels } from "./types.js";
interface MessageActionsProps {
    readonly content: readonly ContentBlock[];
    readonly timestamp?: number | undefined;
    readonly clock: "start" | "end";
    readonly labels: ChatLabels;
}
export declare function MessageActions({ content, timestamp, clock, labels, }: MessageActionsProps): import("react").JSX.Element;
export declare function formatMessageTimestamp(timestamp: number, now?: number): string;
export {};
//# sourceMappingURL=MessageActions.d.ts.map