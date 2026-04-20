import { describe, expect, it, vi } from "vitest";
import { WebSocket } from "ws";
import { broadcastHeartbeat } from "./websocket.js";

interface FakeClient {
  readyState: number;
  send: ReturnType<typeof vi.fn>;
}

function makeClient(readyState: number): FakeClient {
  return { readyState, send: vi.fn() };
}

describe("broadcastHeartbeat", () => {
  it("envoie un payload typé { type: 'heartbeat', data: { serverTime } }", () => {
    const client = makeClient(WebSocket.OPEN);
    const wss = { clients: new Set<FakeClient>([client]) };

    const sent = broadcastHeartbeat(
      wss as unknown as Parameters<typeof broadcastHeartbeat>[0],
      1700000000000,
    );

    expect(sent).toBe(1);
    expect(client.send).toHaveBeenCalledOnce();
    expect(JSON.parse(client.send.mock.calls[0]![0] as string)).toEqual({
      type: "heartbeat",
      data: { serverTime: 1700000000000 },
    });
  });

  it("ignore les clients qui ne sont pas en état OPEN", () => {
    const open = makeClient(WebSocket.OPEN);
    const connecting = makeClient(WebSocket.CONNECTING);
    const closing = makeClient(WebSocket.CLOSING);
    const closed = makeClient(WebSocket.CLOSED);
    const wss = { clients: new Set<FakeClient>([open, connecting, closing, closed]) };

    const sent = broadcastHeartbeat(
      wss as unknown as Parameters<typeof broadcastHeartbeat>[0],
      42,
    );

    expect(sent).toBe(1);
    expect(open.send).toHaveBeenCalledOnce();
    expect(connecting.send).not.toHaveBeenCalled();
    expect(closing.send).not.toHaveBeenCalled();
    expect(closed.send).not.toHaveBeenCalled();
  });

  it("retourne 0 si aucun client n'est connecté", () => {
    const wss = { clients: new Set<FakeClient>() };
    const sent = broadcastHeartbeat(
      wss as unknown as Parameters<typeof broadcastHeartbeat>[0],
      0,
    );
    expect(sent).toBe(0);
  });
});
