// Types et utilitaires partagés entre backend et frontend.
// Source de vérité pour le contrat de communication WebSocket.

// ============================================================================
// Identité, plateformes, viewers
// ============================================================================

export type Platform = "youtube" | "twitch" | "kick" | "discord" | "mock";

export type AgeId = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";

export interface ViewerInfo {
  platformId: string;
  pseudo: string;
  isSubscriber: boolean;
  isModerator: boolean;
  isBroadcaster: boolean;
}

export interface ChatMessage {
  id: string;
  platform: Platform;
  receivedAt: number;
  viewer: ViewerInfo;
  text: string;
}

// ============================================================================
// Événements de simulation (cf. data_model.md §Event)
// ============================================================================

export type EventCategory =
  | "chat_action"
  | "natural"
  | "emergent"
  | "historical"
  | "apocalypse"
  | "meta";

export type EventSeverity = "trivial" | "minor" | "notable" | "major" | "catastrophic";

export type ActorType = "viewer" | "nature" | "rng" | "system";

/**
 * Projection narrative légère d'un événement de simulation envoyée au frontend.
 * Le format complet (cf. data_model.md §Event) reste côté backend.
 */
export interface GameEvent {
  eventId: number;
  cycleId: number;
  tickNumber: number;
  category: EventCategory;
  eventType: string;
  severity: EventSeverity;
  actorType: ActorType;
  actorName: string;
  description: string;
  timestamp: number;
}

// ============================================================================
// Apocalypses (cf. genesis_live_lore.md §Apocalypses)
// ============================================================================

export type ApocalypseType =
  | "celestial_impact"
  | "ash_winter"
  | "greenhouse"
  | "great_plague"
  | "singularity"
  | "final_deluge"
  | "contact"
  | "inner_collapse"
  | "oblivion";

export type ApocalypsePhase = "premise" | "trigger" | "devastation" | "cessation";

export interface ApocalypseInfo {
  apocalypseId: number;
  type: ApocalypseType;
  typeName: string;
  phase: ApocalypsePhase;
  startedAtTick: number;
  estimatedEndAtTick?: number;
  triggeringViewerPseudos: string[];
}

// ============================================================================
// Titres du Panthéon (cf. genesis_live_lore.md §Panthéon des Viewers)
// ============================================================================

export type TitleCategory = "primordial" | "obscure" | "rare" | "legendary" | "forbidden";

export interface TitleInfo {
  titleKey: string;
  titleDisplayName: string;
  titleIcon: string;
  category: TitleCategory;
  earnedByViewerPseudo: string;
  earnedAtTick: number;
  earnedForAction: string;
}

// ============================================================================
// Entités projetées vers le rendu
// ============================================================================

export type EntityType =
  | "strain"
  | "species"
  | "plant"
  | "tribe"
  | "city"
  | "religion"
  | "civilization";

export interface EntityInfo {
  entityType: EntityType;
  entityId: number;
  name: string;
  scientificName?: string;
  founderViewerPseudo?: string;
  cycleId: number;
  bornAtTick: number;
  diedAtTick?: number;
  causeOfDeath?: string;
}

// ============================================================================
// État planétaire (projection légère pour rendu/HUD)
// ============================================================================

/**
 * Sous-ensemble de PlanetState (cf. data_model.md §PlanetState) envoyé au
 * frontend toutes les N ticks. Volontairement réduit pour la bande passante.
 */
export interface PlanetStateProjection {
  cycleId: number;
  cycleNumber: number;
  currentPlanetName: string;

  age: AgeId;
  ageProgress: number;
  tickCount: number;

  temperature: number;
  waterCoverage: number;
  oxygenLevel: number;
  pressure: number;

  populationTotal: number;
  techLevel: number;
  biodiversity: number;

  isInApocalypse: boolean;
  apocalypsePhase?: ApocalypsePhase;
  apocalypseType?: ApocalypseType;
}

// ============================================================================
// Action viewer affichée
// ============================================================================

export interface ViewerActionDisplay {
  pseudo: string;
  command: string;
  resultDescription: string;
  affectedEntityType?: EntityType;
  affectedEntityName?: string;
  timestamp: number;
}

// ============================================================================
// Messages WebSocket — payloads de chaque type
// ============================================================================

export interface WelcomeData {
  message: string;
  serverVersion?: string;
  cycleId?: number;
  age?: AgeId;
  tickCount?: number;
}

export interface HeartbeatData {
  serverTime: number;
}

export interface StateUpdateData {
  state: PlanetStateProjection;
}

export interface AgeTransitionData {
  from: AgeId;
  to: AgeId;
  atTick: number;
  cinematicId?: string;
}

export interface ServerErrorData {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// Messages WebSocket entrants (backend → frontend)
// Format unifié { type, data }, cf. architecture.md §Communication.
// ============================================================================

export type InboundWSMessage =
  | { type: "welcome"; data: WelcomeData }
  | { type: "heartbeat"; data: HeartbeatData }
  | { type: "state_update"; data: StateUpdateData }
  | { type: "event"; data: GameEvent }
  | { type: "viewer_action"; data: ViewerActionDisplay }
  | { type: "entity_born"; data: EntityInfo }
  | { type: "entity_died"; data: EntityInfo }
  | { type: "age_transition"; data: AgeTransitionData }
  | { type: "apocalypse"; data: ApocalypseInfo }
  | { type: "title_earned"; data: TitleInfo }
  | { type: "error"; data: ServerErrorData };

export type InboundWSMessageType = InboundWSMessage["type"];

/**
 * Helper pour extraire le payload d'un message inbound par son `type`
 * (utile pour typer les handlers : `DataOf<"welcome">` → `WelcomeData`).
 */
export type InboundData<T extends InboundWSMessageType> = Extract<
  InboundWSMessage,
  { type: T }
>["data"];

// ============================================================================
// Messages WebSocket sortants (frontend → backend)
// Phase 1 minimal mais extensible.
// ============================================================================

export interface PingData {
  clientTime: number;
}

export interface SubscribeData {
  /** Liste de canaux à recevoir (ex: "events", "state"). Vide = tout reçoit. */
  channels: string[];
}

export type OutboundWSMessage =
  | { type: "ping"; data: PingData }
  | { type: "subscribe"; data: SubscribeData };

export type OutboundWSMessageType = OutboundWSMessage["type"];
