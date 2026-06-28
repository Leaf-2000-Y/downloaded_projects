const http = require("http");

const listenHost = process.env.PROXY_LISTEN_HOST || "0.0.0.0";
const listenPort = Number(process.env.PROXY_LISTEN_PORT || 8004);
const targetHost = process.env.PROXY_TARGET_HOST || "127.0.0.1";
const targetPort = Number(process.env.PROXY_TARGET_PORT || 18004);

const server = http.createServer((clientReq, clientRes) => {
  const proxyReq = http.request(
    {
      host: targetHost,
      port: targetPort,
      method: clientReq.method,
      path: clientReq.url,
      headers: {
        ...clientReq.headers,
        host: `${targetHost}:${targetPort}`
      }
    },
    (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(clientRes);
    }
  );

  proxyReq.on("error", (error) => {
    clientRes.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    clientRes.end(`Local tunnel unavailable: ${error.message}\n`);
  });

  clientReq.pipe(proxyReq);
});

server.listen(listenPort, listenHost, () => {
  console.log(`proxy listening on ${listenHost}:${listenPort} -> ${targetHost}:${targetPort}`);
});
