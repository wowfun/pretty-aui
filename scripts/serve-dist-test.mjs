import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number(process.env.PRETTY_AUI_DIST_TEST_PORT ?? 4174);
const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const fixture = fileURLToPath(
  new URL("../tests/fixtures/dist-standalone.html", import.meta.url),
);

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const path = pathname === "/" ? fixture : resolve(root, `.${pathname}`);
    if (
      pathname !== "/" &&
      path !== root &&
      !path.startsWith(`${root}${sep}`)
    ) {
      respond(response, 403, "Forbidden");
      return;
    }
    const metadata = await stat(path);
    if (!metadata.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": contentType(path),
      "Cache-Control": "no-store",
      ...(pathname === "/"
        ? {
            "Content-Security-Policy":
              "default-src 'none'; script-src 'self' 'nonce-pretty-aui-test'; style-src 'nonce-pretty-aui-test'; img-src data:; media-src data:",
          }
        : {}),
    });
    const stream = createReadStream(path);
    stream.on("error", (error) => response.destroy(error));
    stream.pipe(response);
  } catch {
    respond(response, 404, "Not found");
  }
});

server.listen(port, host, () => {
  console.log(`pretty-aui dist fixture: http://${host}:${port}/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close(() => process.exit(0)));
}

function respond(response, status, body) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

function contentType(path) {
  switch (extname(path)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".map":
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
