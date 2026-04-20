import type { Server as HttpServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import type { HeartbeatData } from "@genesis-live/shared";
import { logger } from "../logger/index.js";

export const HEARTBEAT_INTERVAL_MS = 5_000;

export function attachWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket: WebSocket, request) => {
    const clientIp = request.socket.remoteAddress ?? "unknown";
    logger.info({ clientIp, clients: wss.clients.size }, "ws client connected");

    socket.send(
      JSON.stringify({
        type: "welcome",
        data: { message: "Bienvenue sur Genesis Live. La planète vous attend." }
      })
    );

    socket.on("message", (raw) => {
      const text = raw.toString();
      logger.debug({ clientIp, text }, "ws message received");

      socket.send(JSON.stringify({ type: "echo", data: { received: text } }));
    });

    socket.on("close", () => {
      logger.info({ clientIp, clients: wss.clients.size }, "ws client disconnected");
    });

    socket.on("error", (err) => {
      logger.error({ clientIp, err: err.message }, "ws client error");
    });
  });

  // Heartbeat : broadcast d'un ping typé toutes les 5 secondes (cf. roadmap.md sem. 4).
  // Permet au frontend de valider la liaison.
  const heartbeatTimer = setInterval(() => {
    const sent = broadcastHeartbeat(wss, Date.now());
    if (sent > 0) {
      logger.debug({ recipients: sent }, "ws heartbeat broadcast");
    }
  }, HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref();

  wss.on("close", () => {
    clearInterval(heartbeatTimer);
  });

  return wss;
}

/**
 * Diffuse un message `heartbeat` typé à tous les clients en état OPEN.
 *
 * Exporté en pur (pas d'effet timer) pour être testable en isolation
 * avec un mock minimal de WebSocketServer.
 *
 * @returns le nombre de clients à qui le message a été envoyé.
 */
export function broadcastHeartbeat(
  wss: Pick<WebSocketServer, "clients">,
  serverTime: number
): number {
  const data: HeartbeatData = { serverTime };
  const payload = JSON.stringify({ type: "heartbeat", data });
  let sent = 0;
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
      sent += 1;
    }
  }
  return sent;
}
