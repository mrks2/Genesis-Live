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

describe("404 handler", () => {
  const app = createHttpApp();

  it("returns 404 JSON on unknown GET route", async () => {
    const res = await request(app).get("/this-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toMatchObject({
      error: "not_found",
      message: expect.stringContaining("/this-does-not-exist")
    });
  });

  it("returns 404 JSON on unknown POST route with method in message", async () => {
    const res = await request(app).post("/nope").send({});
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("POST");
  });
});

describe("error handler", () => {
  const app = createHttpApp();

  it("returns 400 JSON when body is malformed", async () => {
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send("{not valid json");
    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.error).toBeDefined();
    expect(res.body.message).toBeDefined();
  });

  it("returns 413 JSON when body exceeds 100kb limit", async () => {
    const huge = "x".repeat(200_000);
    const res = await request(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ payload: huge }));
    expect(res.status).toBe(413);
    expect(res.body.error).toBeDefined();
  });
});
