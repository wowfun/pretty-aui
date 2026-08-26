import type { AcpConnector, AcpProtocolPolicy, ChatHost, ClientInfo } from "../types.js";
import type { ProtocolDriver, ProtocolSink } from "./types.js";
export interface ConnectProtocolOptions {
    readonly connector: AcpConnector;
    readonly protocol: AcpProtocolPolicy;
    readonly signal: AbortSignal;
    readonly sink: ProtocolSink;
    readonly clientInfo: Required<Pick<ClientInfo, "name" | "version">> & Pick<ClientInfo, "title">;
    readonly host?: ChatHost;
}
export declare function connectProtocol(options: ConnectProtocolOptions): Promise<ProtocolDriver>;
//# sourceMappingURL=connect.d.ts.map