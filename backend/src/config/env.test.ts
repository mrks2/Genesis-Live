import { describe, expect, it } from "vitest";
import { readEnum, readInt } from "./env.js";

describe("readInt", () => {
  it("returns the fallback when the env var is absent", () => {
    expect(readInt("MISSING_KEY", 42, {})).toBe(42);
  });

  it("returns the fallback when the env var is an empty string", () => {
    expect(readInt("EMPTY_KEY", 42, { EMPTY_KEY: "" })).toBe(42);
  });

  it("parses a valid integer", () => {
    expect(readInt("PORT", 3000, { PORT: "8080" })).toBe(8080);
  });

  it("parses a negative integer", () => {
    expect(readInt("OFFSET", 0, { OFFSET: "-5" })).toBe(-5);
  });

  it("throws when the value is not an integer", () => {
    expect(() => readInt("PORT", 3000, { PORT: "not-a-number" })).toThrow(
      /Env var PORT must be an integer/
    );
  });
});

describe("readEnum", () => {
  const levels = ["info", "debug", "error"] as const;

  it("returns the fallback when the env var is absent", () => {
    expect(readEnum("LOG_LEVEL", levels, "info", {})).toBe("info");
  });

  it("returns a valid value", () => {
    expect(readEnum("LOG_LEVEL", levels, "info", { LOG_LEVEL: "debug" })).toBe("debug");
  });

  it("throws on a value outside the allowed list", () => {
    expect(() =>
      readEnum("LOG_LEVEL", levels, "info", { LOG_LEVEL: "verbose" })
    ).toThrow(/LOG_LEVEL must be one of \[info, debug, error\]/);
  });
});
