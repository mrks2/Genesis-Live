import { describe, expect, it } from "vitest";
import request from "supertest";
import { createHttpApp } from "../server/http.js";

describe("GET /health", () => {
  const app = createHttpApp();

  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("includes uptime, timestamp and version", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toMatchObject({
      status: "ok",
      uptime: expect.any(Number),
      timestamp: expect.any(String),
      version: expect.any(String)
    });
    expect(() => new Date(res.body.timestamp as string).toISOString()).not.toThrow();
  });

  it("responds in JSON", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("GET /", () => {
  const app = createHttpApp();

  it("returns a welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Genesis Live");
  });
});

describe("GET /unknown", () => {
  const app = createHttpApp();

  it("returns 404 on unknown routes", async () => {
    const res = await request(app).get("/this-does-not-exist");
    expect(res.status).toBe(404);
  });
});
