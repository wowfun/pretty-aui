export declare const MAX_WIRE_MESSAGE_BYTES: number;
/** Measures the JSON wire representation exactly in UTF-8 bytes. */
export declare function wireMessageWithinBudget(value: unknown, limit?: number): boolean;
/** Checks a string without scanning beyond the first byte over the limit. */
export declare function utf8StringWithinBudget(value: string, limit: number): boolean;
//# sourceMappingURL=wire-budget.d.ts.map