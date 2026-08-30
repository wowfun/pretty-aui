import { type ReactNode } from "react";
import type { ChatToolCall } from "../core/types.js";
import type { ChatLabels } from "./types.js";
interface BuiltInToolBodyProps {
    readonly tool: ChatToolCall;
    readonly labels: ChatLabels;
    readonly renderContent: (value: unknown, index: number) => ReactNode;
}
export declare function BuiltInToolBody({ tool, labels, renderContent, }: BuiltInToolBodyProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ToolBlocks.d.ts.map