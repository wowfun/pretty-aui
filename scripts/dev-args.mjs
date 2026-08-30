/** Extracts the Vite server options used by the programmatic live command. */
export function parseViteServerArgs(args) {
  const server = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--") {
      continue;
    } else if (argument === "--host") {
      const value = args[index + 1];
      if (value && !value.startsWith("--")) {
        server.host = value;
        index += 1;
      } else {
        server.host = true;
      }
    } else if (argument?.startsWith("--host=")) {
      server.host = argument.slice("--host=".length) || true;
    } else if (argument === "--port") {
      server.port = parseVitePort(args[index + 1]);
      index += 1;
    } else if (argument?.startsWith("--port=")) {
      server.port = parseVitePort(argument.slice("--port=".length));
    } else if (argument === "--strictPort") {
      server.strictPort = true;
    } else if (argument === "--force") {
      // Forwarded through Vite's top-level config rather than the server block.
    } else {
      throw new Error(
        `Unsupported Vite argument for dev:opencode: ${argument}`,
      );
    }
  }
  return { server, force: args.includes("--force") };
}

function parseVitePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid Vite port: ${value ?? "missing"}`);
  }
  return port;
}
