import { RequestError } from "@agentclientprotocol/sdk";
import { PrettyAuiError } from "../errors.js";
import { MAX_CONTENT_TEXT, MAX_MEDIA_BASE64 } from "./normalize.js";
export function validateSessionOptions(options, initialization, protocol, phase) {
    if (!isAbsolutePath(options.cwd)) {
        throw invalidConfiguration(`ACP cwd must be an absolute path: ${options.cwd}`, protocol, phase);
    }
    if (options.additionalDirectories?.some((path) => !isAbsolutePath(path))) {
        throw invalidConfiguration("ACP additionalDirectories must contain only absolute paths", protocol, phase);
    }
    if (options.additionalDirectories?.length &&
        !initialization.additionalDirectories) {
        throw invalidConfiguration("The agent does not support additionalDirectories", protocol, phase);
    }
    if ((options.additionalDirectories?.length ?? 0) > 64) {
        throw invalidConfiguration("ACP additionalDirectories is limited to 64 entries", protocol, phase);
    }
    if ((options.mcpServers?.length ?? 0) > 32) {
        throw invalidConfiguration("ACP MCP configuration is limited to 32 servers", protocol, phase);
    }
    for (const server of options.mcpServers ?? [])
        validateMcpServer(server, initialization, protocol, phase);
}
export function validatePrompt(blocks, capabilities, protocol) {
    if (blocks.length > 256)
        throw invalidConfiguration("ACP prompts are limited to 256 content blocks", protocol, "prompt");
    for (const block of blocks) {
        validateContentBlockBounds(block, protocol);
        if (block.type === "text" || block.type === "resource_link")
            continue;
        if (block.type === "image" && capabilities.image)
            continue;
        if (block.type === "audio" && capabilities.audio)
            continue;
        if (block.type === "resource" && capabilities.embeddedContext)
            continue;
        throw invalidConfiguration(`The agent does not support prompt content type '${block.type}'`, protocol, "prompt");
    }
}
export async function requestSessionWithAuthMapping(request, protocol, phase) {
    try {
        return await request();
    }
    catch (error) {
        if (!(error instanceof RequestError))
            throw error;
        if (error.code === -32000) {
            throw new PrettyAuiError("AUTHENTICATION_REQUIRED", "The agent requires authentication for this session operation", { cause: error, protocol, phase });
        }
        throw new PrettyAuiError("SESSION_REJECTED", `The agent rejected ${phase}`, { cause: error, protocol, phase, retryable: phase === "session/open" });
    }
}
function validateContentBlockBounds(block, protocol) {
    if (block.type === "text" &&
        typeof block.text === "string" &&
        block.text.length > MAX_CONTENT_TEXT) {
        throw invalidConfiguration("ACP text content is limited to 1 MiB", protocol, "prompt");
    }
    if ((block.type === "image" || block.type === "audio") &&
        typeof block.data === "string" &&
        block.data.length > MAX_MEDIA_BASE64) {
        throw invalidConfiguration("ACP media content is limited to 8 MiB of base64 data", protocol, "prompt");
    }
    if (block.type === "resource" &&
        typeof block.resource === "object" &&
        block.resource !== null) {
        const resource = block.resource;
        if (typeof resource.text === "string" &&
            resource.text.length > MAX_CONTENT_TEXT) {
            throw invalidConfiguration("ACP embedded resource text is limited to 1 MiB", protocol, "prompt");
        }
        if (typeof resource.blob === "string" &&
            resource.blob.length > MAX_MEDIA_BASE64) {
            throw invalidConfiguration("ACP embedded resource data is limited to 8 MiB", protocol, "prompt");
        }
    }
}
function validateMcpServer(server, initialization, protocol, phase) {
    if (server.type === "sse" && protocol !== 1) {
        throw invalidConfiguration("SSE MCP servers are available only with protocol: 1", protocol, phase);
    }
    if (!initialization.mcp[server.type]) {
        throw invalidConfiguration(`The agent does not support ${server.type} MCP servers`, protocol, phase);
    }
}
function invalidConfiguration(message, protocol, phase) {
    return new PrettyAuiError("INVALID_CONFIGURATION", message, {
        ...(protocol === undefined ? {} : { protocol }),
        phase,
    });
}
function isAbsolutePath(value) {
    return (value.startsWith("/") ||
        /^[A-Za-z]:[\\/]/.test(value) ||
        value.startsWith("\\\\"));
}
//# sourceMappingURL=types.js.map