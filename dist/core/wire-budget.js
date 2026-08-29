export const MAX_WIRE_MESSAGE_BYTES = 2 * 1024 * 1024;
/** Measures the JSON wire representation exactly in UTF-8 bytes. */
export function wireMessageWithinBudget(value, limit = MAX_WIRE_MESSAGE_BYTES) {
    let serialized;
    try {
        serialized = JSON.stringify(value);
    }
    catch {
        return false;
    }
    if (serialized === undefined)
        return false;
    return utf8ByteLength(serialized, limit) <= limit;
}
function utf8ByteLength(value, limit) {
    let bytes = 0;
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        if (code <= 0x7f)
            bytes += 1;
        else if (code <= 0x7ff)
            bytes += 2;
        else if (code >= 0xd800 &&
            code <= 0xdbff &&
            index + 1 < value.length &&
            value.charCodeAt(index + 1) >= 0xdc00 &&
            value.charCodeAt(index + 1) <= 0xdfff) {
            bytes += 4;
            index += 1;
        }
        else {
            bytes += 3;
        }
        if (bytes > limit)
            return bytes;
    }
    return bytes;
}
//# sourceMappingURL=wire-budget.js.map