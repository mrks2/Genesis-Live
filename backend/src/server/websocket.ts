import type { Server as HttpServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { logger } from "../logger/index.js";

export function attachWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket: WebSocket, request) => {
    const clientIp = request.socket.remoteAddress ?? "unknown";
    logger.info({ clientIp, clients: wss.clients.size }, "ws client connected");

    socket.send(
      JSON.stringify({
        type: "welcome",
        message: "Bienvenue sur Genesis Live. La planète vous attend."
      })
    );

    socket.on("message", (raw) => {
      const text = raw.toString();
      logger.debug({ clientIp, text }, "ws message received");

      socket.send(JSON.stringify({ type: "echo", received: text }));
    });

    socket.on("close", () => {
      logger.info({ clientIp, clients: wss.clients.size }, "ws client disconnected");
    });

    socket.on("error", (err) => {
      logger.error({ clientIp, err: err.message }, "ws client error");
    });
  });

  return wss;
}
