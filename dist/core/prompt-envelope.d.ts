import type { ContentBlock } from "./types.js";
export declare function createUserMessageEnvelopeToken(): string;
export declare function envelopeUserPrompt(input: readonly ContentBlock[], token: string): ContentBlock[];
export declare function restoreUserPrompt(content: readonly ContentBlock[]): {
    readonly status: "none" | "malformed";
    readonly content: ContentBlock[];
} | {
    readonly status: "restored";
    readonly content: ContentBlock[];
    readonly context: readonly {
        readonly id: string;
        readonly label: string;
        readonly content: readonly ContentBlock[];
    }[];
};
//# sourceMappingURL=prompt-envelope.d.ts.map