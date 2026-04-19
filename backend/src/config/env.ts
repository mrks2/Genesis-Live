import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";

loadDotenv({ path: resolve(process.cwd(), "../.env") });
loadDotenv();

type NodeEnv = "development" | "test" | "production";
type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

function readInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Env var ${key} must be an integer, got: ${raw}`);
  }
  return parsed;
}

function readEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const raw = process.env[key];
  if (!raw) return fallback;
  if (!allowed.includes(raw as T)) {
    throw new Error(`Env var ${key} must be one of [${allowed.join(", ")}], got: ${raw}`);
  }
  return raw as T;
}

export const env = {
  nodeEnv: readEnum<NodeEnv>("NODE_ENV", ["development", "test", "production"], "development"),
  port: readInt("PORT", 3000),
  logLevel: readEnum<LogLevel>(
    "LOG_LEVEL",
    ["fatal", "error", "warn", "info", "debug", "trace"],
    "info"
  )
} as const;

export type Env = typeof env;
