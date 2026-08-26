import type { ElicitationDecision, ElicitationInteraction, PermissionDecision, PermissionOption } from "../types.js";
export declare function normalizePermissionOptions(value: unknown): PermissionOption[];
export declare function normalizeElicitation(raw: unknown): Omit<ElicitationInteraction, "id">;
export declare function permissionResponse(decision: PermissionDecision): {
    outcome: PermissionDecision;
};
export declare function elicitationResponse(decision: ElicitationDecision): {
    action: "cancel" | "decline";
} | {
    action: "accept";
    content?: {
        [k: string]: string | number | boolean | any[] | readonly string[];
    };
};
//# sourceMappingURL=interactions.d.ts.map