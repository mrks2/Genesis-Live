import { pino } from "pino";
import { env } from "../config/env.js";

const isDev = env.nodeEnv === "development";

export const logger = pino({
  level: env.logLevel,
  base: { service: "genesis-live-backend" },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname,service"
          }
        }
      }
    : {})
});

export type Logger = typeof logger;
