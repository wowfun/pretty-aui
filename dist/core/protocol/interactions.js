import { asHttpUrl, asRecordArray, asString, boundedRecord, isRecord, } from "./normalize.js";
export function normalizePermissionOptions(value) {
    return asRecordArray(value).map((option, index) => ({
        id: asString(option.optionId) ?? `option-${index}`,
        name: asString(option.name) ?? `Option ${index + 1}`,
        kind: asString(option.kind) ?? "unknown",
    }));
}
export function normalizeElicitation(raw) {
    const params = isRecord(raw) ? raw : {};
    const mode = params.mode === "form" || params.mode === "url" ? params.mode : "unknown";
    const elicitationId = asString(params.elicitationId);
    const requestedSchema = boundedRecord(params.requestedSchema);
    const url = asHttpUrl(params.url);
    return {
        type: "elicitation",
        ...(elicitationId ? { elicitationId } : {}),
        mode,
        message: asString(params.message) ?? "The agent needs more information.",
        ...(url ? { url } : {}),
        ...(requestedSchema ? { requestedSchema } : {}),
    };
}
export function permissionResponse(decision) {
    return { outcome: decision };
}
export function elicitationResponse(decision) {
    if (decision.action !== "accept")
        return { action: decision.action };
    return {
        action: "accept",
        ...(decision.content
            ? {
                content: Object.fromEntries(Object.entries(decision.content).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? [...value] : value,
                ])),
            }
            : {}),
    };
}
//# sourceMappingURL=interactions.js.map