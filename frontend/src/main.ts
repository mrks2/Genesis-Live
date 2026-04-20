// Orchestrateur frontend (cf. architecture.md §main.ts).
//
// Le point d'entrée crée l'application Pixi, la planète placeholder, le client
// WebSocket, et wire les événements réseau vers les mutations du rendu.

import "./style.css";

import type { AgeId } from "@genesis-live/shared";

import {
  createWSClient,
  type WSClient,
  type WSClientHandlers,
} from "./network/wsClient.js";
import {
  createPixiApp,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from "./renderer/pixiApp.js";
import {
  createPlaceholderPlanet,
  type PlaceholderPlanet,
} from "./renderer/planet.js";

const WS_URL = "ws://localhost:3000/ws";
const INITIAL_AGE: AgeId = "I";
const APP_CONTAINER_SELECTOR = "#app";

declare global {
  interface Window {
    // Exposés temporairement pour debug en console (Phase 1).
    // Seront retirés quand le HUD HTML prendra le relais.
    planet?: PlaceholderPlanet;
    wsClient?: WSClient;
  }
}

async function main(): Promise<void> {
  // 1. Préchargement des assets — placeholder Phase 1, branchera Pixi.Assets en Phase 5.
  // await preloadAssets();

  // 2. Initialisation du rendu
  const container = document.querySelector<HTMLDivElement>(APP_CONTAINER_SELECTOR);
  if (!container) {
    throw new Error(
      `Container ${APP_CONTAINER_SELECTOR} introuvable dans index.html`,
    );
  }
  const app = createPixiApp(container);
  const planet = createPlaceholderPlanet(app, INITIAL_AGE);

  // 3. Initialisation du réseau et câblage WebSocket → rendu
  const wsClient = createWSClient({
    url: WS_URL,
    handlers: createRenderHandlers(planet),
  });

  // 4. Démarrage
  wsClient.connect();

  // 5. Exposition debug (Phase 1)
  window.planet = planet;
  window.wsClient = wsClient;

  // 6. Logs d'initialisation
  console.info(
    `[pixi] initialized — ${LOGICAL_WIDTH}×${LOGICAL_HEIGHT} logical, ` +
      "antialias=false, scaleMode=NEAREST, backgroundAlpha=0",
  );
  console.info(
    "[planet] placeholder ready — try `planet.setAge('IV')` in DevTools console",
  );
}

/**
 * Câble les messages WebSocket entrants vers les mutations du rendu.
 *
 * Isolé pour que l'orchestration de `main()` reste lisible et que la table
 * de routage message → action soit modifiable d'un seul endroit.
 */
function createRenderHandlers(planet: PlaceholderPlanet): WSClientHandlers {
  return {
    onConnect: () => console.info("[ws] connected to backend"),
    onDisconnect: (reason) => console.info("[ws] disconnected:", reason),

    onWelcome: (data) => {
      console.info("[ws] welcome:", data);
      if (data.age !== undefined) {
        planet.setAge(data.age);
      }
    },
    onHeartbeat: (data) => console.info("[ws] heartbeat:", data),
    onStateUpdate: ({ state }) => {
      console.debug("[ws] state_update:", state);
      planet.setAge(state.age);
    },
    onAgeTransition: ({ from, to, atTick }) => {
      console.info(`[ws] age transition: ${from} → ${to} @tick ${atTick}`);
      planet.setAge(to);
    },
    onEvent: (event) => console.debug("[ws] event:", event),
    onViewerAction: (action) =>
      console.info(
        `[ws] viewer_action: @${action.pseudo} ${action.command} → ${action.resultDescription}`,
      ),
    onEntityBorn: (entity) =>
      console.info(`[ws] entity_born: ${entity.entityType} "${entity.name}"`),
    onEntityDied: (entity) =>
      console.info(
        `[ws] entity_died: ${entity.entityType} "${entity.name}" — ${entity.causeOfDeath ?? "?"}`,
      ),
    onApocalypse: (apoc) =>
      console.warn(
        `[ws] apocalypse: ${apoc.typeName} (phase ${apoc.phase}) @tick ${apoc.startedAtTick}`,
      ),
    onTitleEarned: (title) =>
      console.info(
        `[ws] title_earned: 🏆 @${title.earnedByViewerPseudo} → ${title.titleDisplayName} (${title.category})`,
      ),
    onServerError: (err) =>
      console.error(`[ws] server_error: ${err.code} — ${err.message}`, err.details),

    onUnknownMessage: (raw) => console.warn("[ws] unknown message:", raw),
  };
}

main().catch((err: unknown) => {
  console.error("[main] fatal error", err);
});
