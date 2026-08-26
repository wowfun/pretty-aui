import type { AuthMethod, ChatActivity, ChatCommand, ChatConfigOption, ContentBlock, SessionPage, UsageInfo } from "../types.js";
export declare const MAX_CONTENT_TEXT: number;
export declare const MAX_MEDIA_BASE64: number;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function asString(value: unknown, maxLength?: number): string | undefined;
export declare function asHttpUrl(value: unknown): string | undefined;
export declare function asRecordArray(value: unknown, maxItems?: number): Record<string, unknown>[];
export declare function normalizeContent(value: unknown): ContentBlock[];
export declare function boundedRecord(value: unknown): Readonly<Record<string, unknown>> | undefined;
export declare function normalizeAuthMethods(value: unknown): AuthMethod[];
export declare function normalizeCommands(value: unknown): ChatCommand[];
export declare function normalizeConfigOptions(value: unknown): ChatConfigOption[];
export declare function normalizeModes(value: unknown): ChatConfigOption[];
export declare function normalizeSessions(value: unknown): SessionPage;
export declare function normalizeUsage(value: unknown): UsageInfo | undefined;
export interface ReducerEffect {
    readonly state?: string | undefined;
    readonly stopReason?: string | undefined;
    readonly commands?: readonly ChatCommand[] | undefined;
    readonly configOptions?: readonly ChatConfigOption[] | undefined;
    readonly sessionTitle?: string | null | undefined;
    readonly usage?: UsageInfo | undefined;
    readonly unsupported?: string | undefined;
}
export declare class TimelineStore {
    #private;
    get activities(): readonly ChatActivity[];
    reset(): void;
    beginTurn(): void;
    addUserMessage(content: readonly ContentBlock[], pending: boolean): string;
    markUserAccepted(): void;
    reduce(update: unknown, protocol: 1 | 2): ReducerEffect;
}
//# sourceMappingURL=normalize.d.ts.map