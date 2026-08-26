import type { AcpConnector, StreamableHttpConnectorOptions, WebSocketConnectorOptions } from "./types.js";
/**
 * Creates an ACP connector backed by the SDK Streamable HTTP transport.
 *
 * Browser CORS and credential rules still apply to the configured endpoint.
 * Redirects are followed only while they remain on the endpoint's origin so
 * caller-provided authorization headers cannot cross an origin boundary.
 */
export declare function createStreamableHttpConnector(url: string, options?: StreamableHttpConnectorOptions): AcpConnector;
/**
 * Creates an ACP connector backed by the SDK WebSocket transport.
 *
 * Native browser WebSocket constructors ignore custom request headers. An
 * injected constructor such as Node `ws` may support them.
 */
export declare function createWebSocketConnector(url: string, options?: WebSocketConnectorOptions): AcpConnector;
//# sourceMappingURL=transport.d.ts.map