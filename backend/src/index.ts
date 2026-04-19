import { createServer } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./logger/index.js";
import { createHttpApp } from "./server/http.js";
import { attachWebSocketServer } from "./server/websocket.js";

function bootstrap(): void {
  const app = createHttpApp();
  const httpServer = createServer(app);
  const wss = attachWebSocketServer(httpServer);

  httpServer.listen(env.port, () => {
    logger.info(
      { port: env.port, env: env.nodeEnv },
      `🌍 Genesis Live backend listening on http://localhost:${env.port}`
    );
    logger.info(`   HTTP  : GET /health`);
    logger.info(`   WS    : ws://localhost:${env.port}/ws`);
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, "shutting down gracefully");
    wss.close(() => logger.info("ws server closed"));
    httpServer.close((err) => {
      if (err) {
        logger.error({ err: err.message }, "error closing http server");
        process.exit(1);
      }
      logger.info("http server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.warn("forced exit after 10s");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap();
