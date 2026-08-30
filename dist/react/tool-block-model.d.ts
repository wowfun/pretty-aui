import type { ChatToolCall } from "../core/types.js";
export interface ToolTerminalBlockModel {
    readonly kind: "terminal";
    readonly command: string;
    readonly cwd?: string | undefined;
    readonly output: string;
    readonly displayOutput: string;
    readonly running: boolean;
    readonly failed: boolean;
    readonly supplementary: readonly unknown[];
}
export interface ToolReadLine {
    readonly number: number;
    readonly text: string;
}
export interface ToolReadBlockModel {
    readonly kind: "read";
    readonly label: string;
    readonly lines: readonly ToolReadLine[];
    readonly copyText: string;
    readonly supplementary: readonly unknown[];
}
export interface ToolDiffRow {
    readonly kind: "meta" | "context" | "add" | "delete";
    readonly text: string;
}
export interface ToolDiffBlockModel {
    readonly kind: "diff";
    readonly rows: readonly ToolDiffRow[];
    readonly copyText: string;
    readonly added: number;
    readonly removed: number;
    readonly files: number;
    readonly supplementary: readonly unknown[];
}
export interface ToolIoSectionModel {
    readonly text?: string | undefined;
    readonly values?: readonly unknown[] | undefined;
    readonly copyText: string;
}
export interface ToolIoBlockModel {
    readonly kind: "io";
    readonly input?: ToolIoSectionModel | undefined;
    readonly output?: ToolIoSectionModel | undefined;
}
export type ToolBlockModel = ToolTerminalBlockModel | ToolReadBlockModel | ToolDiffBlockModel | ToolIoBlockModel;
export declare function deriveToolBlock(tool: ChatToolCall): ToolBlockModel;
export declare function formatToolValue(value: unknown): string;
//# sourceMappingURL=tool-block-model.d.ts.map