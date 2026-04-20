import { describe, expect, it, vi } from "vitest";

import {
  createWSClient,
  computeBackoffMs,
  JITTER_MAX_MS,
  MAX_BACKOFF_MS,
} from "./wsClient.js";

const NO_JITTER = (): number => 0;

describe("computeBackoffMs", () => {
  it("doubles the delay between attempts (1s, 2s, 4s, 8s, 16s, 32s)", () => {
    expect(computeBackoffMs(1, NO_JITTER)).toBe(1000);
    expect(computeBackoffMs(2, NO_JITTER)).toBe(2000);
    expect(computeBackoffMs(3, NO_JITTER)).toBe(4000);
    expect(computeBackoffMs(4, NO_JITTER)).toBe(8000);
    expect(computeBackoffMs(5, NO_JITTER)).toBe(16_000);
    expect(computeBackoffMs(6, NO_JITTER)).toBe(32_000);
  });

  it("caps at MAX_BACKOFF_MS for high attempt counts", () => {
    expect(computeBackoffMs(7, NO_JITTER)).toBe(MAX_BACKOFF_MS);
    expect(computeBackoffMs(20, NO_JITTER)).toBe(MAX_BACKOFF_MS);
    expect(computeBackoffMs(100, NO_JITTER)).toBe(MAX_BACKOFF_MS);
  });

  it("adds a deterministic jitter when random returns a fixed value", () => {
    const halfJitter = (): number => 0.5;
    expect(computeBackoffMs(1, halfJitter)).toBe(1000 + JITTER_MAX_MS / 2);
    expect(computeBackoffMs(7, halfJitter)).toBe(MAX_BACKOFF_MS + JITTER_MAX_MS / 2);
  });

  it("treats attempt < 1 as attempt 1", () => {
    expect(computeBackoffMs(0, NO_JITTER)).toBe(1000);
    expect(computeBackoffMs(-5, NO_JITTER)).toBe(1000);
  });

  it("keeps the jitter inside [0, JITTER_MAX_MS) over many samples", () => {
    for (let i = 0; i < 100; i++) {
      const delay = computeBackoffMs(1);
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThan(1000 + JITTER_MAX_MS);
    }
  });
});

// === Test d'intégration avec un WebSocket mocké ===

interface FakeWebSocketEvent {
  type: string;
  data?: unknown;
  code?: number;
  reason?: string;
}

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: FakeWebSocket[] = [];

  readyState: number = FakeWebSocket.CONNECTING;
  url: string;
  sent: string[] = [];
  private listeners: Map<string, Array<(event: FakeWebSocketEvent) => void>> = new Map();

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, handler: (event: FakeWebSocketEvent) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(code = 1000, reason = ""): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatch("close", { type: "close", code, reason });
  }

  // Helpers pour piloter le mock depuis les tests
  emitOpen(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.dispatch("open", { type: "open" });
  }

  emitMessage(data: string): void {
    this.dispatch("message", { type: "message", data });
  }

  emitClose(code = 1006, reason = "abnormal closure"): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatch("close", { type: "close", code, reason });
  }

  private dispatch(type: string, event: FakeWebSocketEvent): void {
    const list = this.listeners.get(type) ?? [];
    list.forEach((h) => h(event));
  }
}

describe("createWSClient", () => {
  it("dispatches typed messages to the corresponding handlers", () => {
    FakeWebSocket.instances = [];
    const onWelcome = vi.fn();
    const onAgeTransition = vi.fn();
    const onViewerAction = vi.fn();
    const onEntityBorn = vi.fn();
    const onApocalypse = vi.fn();
    const onTitleEarned = vi.fn();
    const onServerError = vi.fn();
    const onUnknown = vi.fn();

    const client = createWSClient({
      url: "ws://test/ws",
      websocketImpl: FakeWebSocket as unknown as typeof WebSocket,
      handlers: {
        onWelcome,
        onAgeTransition,
        onViewerAction,
        onEntityBorn,
        onApocalypse,
        onTitleEarned,
        onServerError,
        onUnknownMessage: onUnknown,
      },
    });
    client.connect();

    const ws = FakeWebSocket.instances[0]!;
    ws.emitOpen();

    ws.emitMessage(JSON.stringify({ type: "welcome", data: { message: "hi" } }));
    expect(onWelcome).toHaveBeenCalledWith({ message: "hi" });

    ws.emitMessage(
      JSON.stringify({ type: "age_transition", data: { from: "I", to: "II", atTick: 42 } }),
    );
    expect(onAgeTransition).toHaveBeenCalledWith({ from: "I", to: "II", atTick: 42 });

    ws.emitMessage(
      JSON.stringify({
        type: "viewer_action",
        data: { pseudo: "Tom", command: "!rain", resultDescription: "il pleut", timestamp: 1 },
      }),
    );
    expect(onViewerAction).toHaveBeenCalledWith({
      pseudo: "Tom",
      command: "!rain",
      resultDescription: "il pleut",
      timestamp: 1,
    });

    ws.emitMessage(
      JSON.stringify({
        type: "entity_born",
        data: { entityType: "city", entityId: 7, name: "Tomsville", cycleId: 1, bornAtTick: 100 },
      }),
    );
    expect(onEntityBorn).toHaveBeenCalled();

    ws.emitMessage(
      JSON.stringify({
        type: "apocalypse",
        data: {
          apocalypseId: 1,
          type: "celestial_impact",
          typeName: "L'Impact Céleste",
          phase: "trigger",
          startedAtTick: 999,
          triggeringViewerPseudos: [],
        },
      }),
    );
    expect(onApocalypse).toHaveBeenCalled();

    ws.emitMessage(
      JSON.stringify({
        type: "title_earned",
        data: {
          titleKey: "water_bearer",
          titleDisplayName: "Le Porteur d'Eau",
          titleIcon: "💧",
          category: "primordial",
          earnedByViewerPseudo: "Mia",
          earnedAtTick: 1234,
          earnedForAction: "première pluie de l'âge I",
        },
      }),
    );
    expect(onTitleEarned).toHaveBeenCalled();

    ws.emitMessage(
      JSON.stringify({
        type: "error",
        data: { code: "RATE_LIMIT", message: "trop d'actions" },
      }),
    );
    expect(onServerError).toHaveBeenCalledWith({ code: "RATE_LIMIT", message: "trop d'actions" });

    ws.emitMessage(JSON.stringify({ type: "mystery", data: {} }));
    expect(onUnknown).toHaveBeenCalled();
  });

  it("schedules a reconnection on close (with backoff) and resets attempts after open", () => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];

    const client = createWSClient({
      url: "ws://test/ws",
      websocketImpl: FakeWebSocket as unknown as typeof WebSocket,
      random: NO_JITTER,
    });
    client.connect();

    expect(FakeWebSocket.instances).toHaveLength(1);
    FakeWebSocket.instances[0]!.emitClose();

    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);

    FakeWebSocket.instances[1]!.emitOpen();
    FakeWebSocket.instances[1]!.emitClose();

    vi.advanceTimersByTime(999);
    expect(FakeWebSocket.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(3);

    client.disconnect();
    vi.useRealTimers();
  });

  it("does not reconnect after manual disconnect", () => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];

    const client = createWSClient({
      url: "ws://test/ws",
      websocketImpl: FakeWebSocket as unknown as typeof WebSocket,
      random: NO_JITTER,
    });
    client.connect();
    FakeWebSocket.instances[0]!.emitOpen();

    client.disconnect();
    vi.advanceTimersByTime(60_000);

    expect(FakeWebSocket.instances).toHaveLength(1);
    vi.useRealTimers();
  });

  it("throws when send() is called before the socket is OPEN", () => {
    FakeWebSocket.instances = [];
    const client = createWSClient({
      url: "ws://test/ws",
      websocketImpl: FakeWebSocket as unknown as typeof WebSocket,
    });
    client.connect();
    expect(() => client.send({ type: "ping", data: { clientTime: 0 } })).toThrow();

    FakeWebSocket.instances[0]!.emitOpen();
    client.send({ type: "ping", data: { clientTime: 123 } });
    expect(FakeWebSocket.instances[0]!.sent[0]).toBe(
      JSON.stringify({ type: "ping", data: { clientTime: 123 } }),
    );
    client.disconnect();
  });
});
