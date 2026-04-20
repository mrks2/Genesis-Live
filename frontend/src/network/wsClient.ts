import type { InboundData, OutboundWSMessage } from "@genesis-live/shared";

export const MAX_BACKOFF_MS = 60_000;
export const JITTER_MAX_MS = 1000;

/**
 * Backoff exponentiel + jitter pour la reconnexion WebSocket.
 *
 * Séquence sans jitter : 1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s, 60s…
 * Jitter ajouté : aléatoire dans [0, JITTER_MAX_MS) à chaque appel.
 *
 * Exporté en pur pour tester la séquence en isolation
 * (cf. roadmap.md sem. 4 : "tester la logique de backoff en isolation").
 */
export function computeBackoffMs(
  attempt: number,
  random: () => number = Math.random,
): number {
  const safeAttempt = Math.max(1, attempt);
  const baseMs = Math.min(1000 * 2 ** (safeAttempt - 1), MAX_BACKOFF_MS);
  const jitterMs = random() * JITTER_MAX_MS;
  return baseMs + jitterMs;
}

export interface WSClientHandlers {
  onWelcome?: (data: InboundData<"welcome">) => void;
  onHeartbeat?: (data: InboundData<"heartbeat">) => void;
  onStateUpdate?: (data: InboundData<"state_update">) => void;
  onEvent?: (data: InboundData<"event">) => void;
  onViewerAction?: (data: InboundData<"viewer_action">) => void;
  onEntityBorn?: (data: InboundData<"entity_born">) => void;
  onEntityDied?: (data: InboundData<"entity_died">) => void;
  onAgeTransition?: (data: InboundData<"age_transition">) => void;
  onApocalypse?: (data: InboundData<"apocalypse">) => void;
  onTitleEarned?: (data: InboundData<"title_earned">) => void;
  onServerError?: (data: InboundData<"error">) => void;

  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: unknown) => void;
  onUnknownMessage?: (raw: unknown) => void;
}

export interface WSClientOptions {
  url: string;
  handlers?: WSClientHandlers;
  /** Injection pour tester avec un mock de WebSocket (DI). */
  websocketImpl?: typeof WebSocket;
  /** Injection pour rendre le jitter déterministe en test. */
  random?: () => number;
}

export interface WSClient {
  connect(): void;
  disconnect(): void;
  send(message: OutboundWSMessage): void;
  isConnected(): boolean;
}

export function createWSClient(options: WSClientOptions): WSClient {
  const { url } = options;
  const handlers: WSClientHandlers = options.handlers ?? {};
  const WS = options.websocketImpl ?? WebSocket;
  const random = options.random ?? Math.random;

  let socket: WebSocket | null = null;
  let attempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manuallyClosed = false;

  const log = (level: "info" | "warn" | "error", ...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console[level]("[ws]", ...args);
  };

  const dispatch = (raw: string): void => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      log("warn", "message non-JSON ignoré", { raw, err });
      return;
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as { type?: unknown }).type !== "string"
    ) {
      handlers.onUnknownMessage?.(parsed);
      log("warn", "message sans champ type ignoré", parsed);
      return;
    }

    const msg = parsed as { type: string; data?: unknown };

    switch (msg.type) {
      case "welcome":
        handlers.onWelcome?.(msg.data as InboundData<"welcome">);
        return;
      case "heartbeat":
        handlers.onHeartbeat?.(msg.data as InboundData<"heartbeat">);
        return;
      case "state_update":
        handlers.onStateUpdate?.(msg.data as InboundData<"state_update">);
        return;
      case "event":
        handlers.onEvent?.(msg.data as InboundData<"event">);
        return;
      case "viewer_action":
        handlers.onViewerAction?.(msg.data as InboundData<"viewer_action">);
        return;
      case "entity_born":
        handlers.onEntityBorn?.(msg.data as InboundData<"entity_born">);
        return;
      case "entity_died":
        handlers.onEntityDied?.(msg.data as InboundData<"entity_died">);
        return;
      case "age_transition":
        handlers.onAgeTransition?.(msg.data as InboundData<"age_transition">);
        return;
      case "apocalypse":
        handlers.onApocalypse?.(msg.data as InboundData<"apocalypse">);
        return;
      case "title_earned":
        handlers.onTitleEarned?.(msg.data as InboundData<"title_earned">);
        return;
      case "error":
        handlers.onServerError?.(msg.data as InboundData<"error">);
        return;
      default:
        handlers.onUnknownMessage?.(msg);
        log("warn", `type de message inconnu: ${msg.type}`, msg);
    }
  };

  const scheduleReconnect = (): void => {
    if (manuallyClosed) return;
    attempts += 1;
    const delay = computeBackoffMs(attempts, random);
    log(
      "warn",
      `reconnexion dans ${Math.round(delay)} ms (tentative ${attempts})`,
    );
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      doConnect();
    }, delay);
  };

  const doConnect = (): void => {
    if (
      socket !== null &&
      (socket.readyState === WS.OPEN || socket.readyState === WS.CONNECTING)
    ) {
      return;
    }

    log("info", `connexion à ${url}`);
    const ws = new WS(url);
    socket = ws;

    ws.addEventListener("open", () => {
      attempts = 0;
      log("info", "connecté");
      handlers.onConnect?.();
    });

    ws.addEventListener("message", (event) => {
      const data = (event as MessageEvent).data;
      if (typeof data === "string") {
        dispatch(data);
      } else {
        log("warn", "message binaire ignoré (type non supporté en Phase 1)");
      }
    });

    ws.addEventListener("close", (event) => {
      const closeEvent = event as CloseEvent;
      const reason = closeEvent.reason !== "" ? closeEvent.reason : `code=${closeEvent.code}`;
      log("warn", `déconnecté (${reason})`);
      socket = null;
      handlers.onDisconnect?.(reason);
      scheduleReconnect();
    });

    ws.addEventListener("error", (event) => {
      log("error", "erreur WebSocket");
      handlers.onError?.(event);
    });
  };

  return {
    connect(): void {
      manuallyClosed = false;
      doConnect();
    },
    disconnect(): void {
      manuallyClosed = true;
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (socket !== null) {
        socket.close(1000, "client disconnect");
        socket = null;
      }
    },
    send(message: OutboundWSMessage): void {
      if (socket === null || socket.readyState !== WS.OPEN) {
        throw new Error("WebSocket non connecté — impossible d'envoyer le message");
      }
      socket.send(JSON.stringify(message));
    },
    isConnected(): boolean {
      return socket !== null && socket.readyState === WS.OPEN;
    },
  };
}
