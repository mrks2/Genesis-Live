# 🏛️ GENESIS LIVE — Architecture technique

*Organisation du code, stack technique, modules, communication entre composants et patterns adoptés.*

---

## 📖 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Architecture haut niveau](#architecture-haut-niveau)
4. [Organisation des fichiers](#organisation-des-fichiers)
5. [Modules du backend](#modules-du-backend)
6. [Modules du frontend](#modules-du-frontend)
7. [Communication entre modules](#communication-entre-modules)
8. [Patterns adoptés](#patterns-adoptés)
9. [Gestion de la configuration](#gestion-de-la-configuration)
10. [Déploiement](#déploiement)
11. [Monitoring et observabilité](#monitoring-et-observabilité)
12. [Tests](#tests)
13. [Sécurité](#sécurité)
14. [Roadmap technique](#roadmap-technique)

---

## Vue d'ensemble

### Principes architecturaux

**1. Séparation simulation / rendu**
Le moteur de simulation tourne **indépendamment** du rendu. Le rendu est un "observateur" de l'état, pas un acteur.

**2. Source unique de vérité**
L'état du monde existe à **un seul endroit** (le backend). Le frontend ne fait qu'afficher cet état, jamais le modifier directement.

**3. Architecture event-driven**
Tout changement d'état produit un événement. Les composants s'abonnent aux événements qui les concernent.

**4. Stateless partout où c'est possible**
Sauf le cœur de la simulation, tout doit être stateless pour faciliter la scalabilité et la résilience.

**5. Fail-safe par défaut**
Chaque composant doit pouvoir échouer sans emporter le système entier. Circuit breakers, retry logic, dégradation gracieuse.

### Caractéristiques du système

| Caractéristique | Valeur |
|-----------------|--------|
| Disponibilité cible | 99.5% (24/7 avec quelques interruptions acceptables) |
| Latence tick | < 100ms (p95) |
| Latence chat → effet visible | < 3 secondes |
| Clients connectés simultanément | 1 à 10 000 |
| Persistance | Snapshots fréquents, récupération < 1 minute |
| Évolutivité | Projet de long terme, évolution continue prévue |

---

## Stack technique

### Choix technologiques

**Backend : Node.js + TypeScript**
- Javascript full-stack (partage de code possible avec le frontend)
- Excellente gestion des événements asynchrones
- Écosystème riche (SQLite, WebSocket, APIs tierces)
- TypeScript pour la robustesse du code

*Alternative : Python avec asyncio ou Go si préférence*

**Frontend : Vanilla JS + Canvas API (+ Pixi.js)**
- Pixi.js pour le rendu 2D performant : **globe** (dézoom) et **tilemap isométrique** (zoom), voir [render_spec.md](render_spec.md)
- Pas de framework lourd : on veut du rendu simple et rapide
- HTML/CSS pur pour le HUD superposé
- Dans OBS, on capture juste une fenêtre de navigateur

*Alternative : Godot Engine si on veut un moteur 2D plus intégré (tilemap iso natif)*

**Base de données**
- **SQLite** pour la persistance principale (simple, fiable, zéro config)
- Fichiers **JSON** pour les archives long terme
- **Redis** (optionnel) pour les caches partagés si multi-instance

**Chat et intégrations externes**
- API YouTube Live Streaming **ET** Twitch tmi.js en parallèle (les deux chats sont agrégés — voir [chat_integration.md](chat_integration.md))
- OBS Studio en sortie unique + relais multistream pour diffuser simultanément sur YouTube Live et Twitch (voir [§Diffusion multi-plateforme](#diffusion-multi-plateforme))
- OBS WebSocket API pour contrôler les scènes (optionnel)
- Discord webhook pour notifications admin (optionnel)

**Outils de développement**
- **Vite** pour le build frontend
- **ESLint + Prettier** pour le code quality
- **Vitest** ou **Jest** pour les tests
- **pm2** pour gérer le processus en production
- **Docker** pour l'environnement reproductible

### Dépendances principales

**Backend (package.json)**
```json
{
  "dependencies": {
    "better-sqlite3": "^11.x",        // SQLite performant sync
    "ws": "^8.x",                     // WebSocket server
    "express": "^4.x",                // HTTP server pour API REST
    "youtube-live-chat": "^x.x",      // ou librairie équivalente
    "winston": "^3.x",                // Logging structuré
    "dotenv": "^16.x",                // Variables d'env
    "zod": "^3.x",                    // Validation de schémas
    "pino": "^8.x"                    // Logging haute perf (alternative)
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^1.x",
    "@types/node": "^20.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

**Frontend (package.json séparé)**
```json
{
  "dependencies": {
    "pixi.js": "^7.x",                // Rendu 2D
    "howler": "^2.x"                  // Audio (ambiances, SFX)
  },
  "devDependencies": {
    "vite": "^5.x",
    "typescript": "^5.x"
  }
}
```

### Versions minimales

- **Node.js** : 20 LTS ou supérieur
- **SQLite** : 3.40+
- **Navigateur cible (pour la capture OBS)** : Chromium récent
- **OBS Studio** : 29+

---

## Architecture haut niveau

### Schéma global

```
┌────────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                                │
│  YouTube Chat ──────┐         Viewers du stream                    │
│  Twitch Chat ───────┤              │                                │
│                     │              │                                │
└─────────────────────┼──────────────┼────────────────────────────────┘
                      │              │
                      ▼              ▼
┌────────────────────────────────────────────────────────────────────┐
│                      GENESIS LIVE                                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  CHAT ADAPTER                                                 │ │
│  │  - Connexion plateformes                                      │ │
│  │  - Parsing commandes                                          │ │
│  │  - Rate limiting                                              │ │
│  └─────────────────────────────┬────────────────────────────────┘ │
│                                │                                    │
│                    Event queue │                                    │
│                                ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  SIMULATION ENGINE (core)                                     │ │
│  │  - Tick loop                                                  │ │
│  │  - State management                                           │ │
│  │  - Rules evaluation                                           │ │
│  │  - Event processing                                           │ │
│  └────────┬──────────────────────────────────┬──────────────────┘ │
│           │                                  │                      │
│           │ State updates                    │ History logs         │
│           ▼                                  ▼                      │
│  ┌─────────────────────┐        ┌─────────────────────────┐       │
│  │  PERSISTENCE         │        │  EVENT BUS               │       │
│  │  - SQLite             │        │  - Pub/Sub               │       │
│  │  - Snapshots          │        │  - Distribute events     │       │
│  │  - HistoryLog         │        │                          │       │
│  └─────────────────────┘        └──────────┬──────────────┘       │
│                                             │                       │
│                                 ┌───────────┼──────────────┐       │
│                                 ▼           ▼              ▼       │
│                        ┌──────────┐ ┌──────────┐  ┌──────────┐    │
│                        │ WEB      │ │ LORE     │  │ OBS       │    │
│                        │ SOCKET   │ │ GEN      │  │ CONTROL   │    │
│                        │ SERVER   │ │          │  │           │    │
│                        └────┬─────┘ └──────────┘  └───────────┘    │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND (navigateur capturé par OBS)                              │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  RENDERER (Pixi.js)                                         │   │
│  │  - Planète, biomes, entités                                 │   │
│  │  - Caméra cinématique                                        │   │
│  │  - Effets particules                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  HUD (HTML/CSS)                                              │   │
│  │  - État du monde                                             │   │
│  │  - Historique des événements                                 │   │
│  │  - Top viewers                                               │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  AUDIO (Howler.js)                                           │   │
│  │  - Musique ambient par âge                                   │   │
│  │  - SFX événements                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Flux de données typique

**Exemple : un viewer tape `!rain`**

```
1. [Chat Adapter] reçoit "!rain" depuis YouTube API
2. [Chat Adapter] valide : viewer existe, cooldown OK, PI suffisants
3. [Chat Adapter] pousse ChatAction dans l'event queue
4. [Simulation Engine] consomme l'event au prochain tick
5. [Simulation Engine] applique l'effet : waterCoverage += X
6. [Simulation Engine] produit un événement "RainEvent"
7. [Event Bus] distribue l'événement :
   - [Persistence] l'écrit dans HistoryLog
   - [WebSocket Server] le broadcast aux clients connectés
   - [Lore Gen] génère la phrase narrative
8. [Frontend] reçoit l'événement WebSocket
9. [Renderer] affiche les particules de pluie à l'écran
10. [HUD] affiche "@pseudo a fait pleuvoir"
11. [Audio] joue le SFX de pluie
```

Temps total : **< 3 secondes** entre le moment où le viewer envoie et le moment où il voit l'effet.

### Séparation des responsabilités

| Composant | Responsabilité principale | Ce qu'il ne fait JAMAIS |
|-----------|---------------------------|-------------------------|
| Chat Adapter | Lire le chat, parser les commandes | Modifier l'état du monde |
| Simulation Engine | Gérer l'état et les règles | Dessiner quoi que ce soit |
| Event Bus | Distribuer les événements | Stocker l'état |
| Persistence | Sauvegarder/charger | Calculer des règles |
| WebSocket Server | Diffuser aux clients | Modifier l'état |
| Renderer | Afficher la planète | Demander au serveur de changer |
| HUD | Afficher les infos | Muter l'état local |

---

## Organisation des fichiers

### Structure globale du projet

```
genesis-live/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json              # Workspace root
│
├── docs/                     # Tous les .md de spécification
│   ├── genesis_live_lore.md
│   ├── simulation_rules.md
│   ├── genesis_live_commands.md
│   ├── data_model.md
│   ├── architecture.md
│   ├── render_spec.md
│   ├── color_palette.md
│   ├── audio_design.md
│   ├── chat_integration.md
│   ├── content_moderation.md
│   ├── coding_best_practices.md
│   └── roadmap.md
│
├── backend/                  # Serveur Node.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── config/
│   │   ├── core/                 # Simulation engine
│   │   ├── chat/                 # Chat adapter
│   │   ├── persistence/          # DB, snapshots
│   │   ├── websocket/            # WS server
│   │   ├── lore/                 # Génération narrative
│   │   ├── api/                  # REST API
│   │   ├── utils/                # Utilitaires (RNG, etc.)
│   │   └── types/                # Types TypeScript partagés
│   ├── tests/
│   └── data/                     # Runtime data (gitignored)
│       ├── db/                   # SQLite
│       ├── snapshots/
│       └── archives/
│
├── frontend/                 # Client web
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.ts
│   │   ├── renderer/         # Rendu Pixi.js
│   │   ├── hud/              # HUD HTML/CSS
│   │   ├── audio/            # Gestion sonore
│   │   ├── network/          # WebSocket client
│   │   └── types/            # Types partagés
│   ├── public/
│   │   └── assets/           # Assets statiques
│   │       ├── sprites/
│   │       │   ├── globe/    # Textures planète, biomes polygonaux, nuages globaux
│   │       │   └── iso/      # Tilesets iso par biome, sprites créatures/cités iso
│   │       ├── audio/
│   │       └── fonts/
│   └── dist/                 # Build output (gitignored)
│
├── shared/                   # Code partagé backend/frontend
│   ├── package.json
│   ├── src/
│   │   ├── types.ts          # Types d'événements, entités
│   │   └── constants.ts      # Constantes partagées
│
├── tools/                    # Outils de dev/maintenance
│   ├── seed-generator.ts     # Générer des seeds initiales
│   ├── snapshot-viewer.ts    # Inspecter un snapshot
│   └── lore-exporter.ts      # Exporter le lore en md
│
└── scripts/
    ├── setup.sh              # Setup initial
    ├── start.sh              # Lancer en production
    └── backup.sh             # Backup manuel
```

### Monorepo avec workspaces

Le `package.json` racine utilise npm/pnpm workspaces :

```json
{
  "name": "genesis-live",
  "private": true,
  "workspaces": [
    "backend",
    "frontend",
    "shared",
    "tools"
  ],
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:backend": "npm run dev -w backend",
    "dev:frontend": "npm run dev -w frontend",
    "build": "npm run build -w shared && npm run build -w backend && npm run build -w frontend",
    "test": "npm run test -w backend && npm run test -w frontend",
    "lint": "eslint ."
  }
}
```

---

## Modules du backend

### 📦 core/ — Simulation Engine

**Responsabilité** : cœur du moteur, boucle de tick, gestion de l'état.

```
core/
├── engine.ts                # Boucle principale, orchestration
├── state/
│   ├── planetState.ts       # État global de la planète
│   ├── stateManager.ts      # Lecture/écriture de l'état
│   └── stateSnapshot.ts     # Sérialisation
├── ticker/
│   ├── tickLoop.ts          # Boucle de tick
│   ├── tickScheduler.ts     # Vitesse adaptative
│   └── tickPhases.ts        # 7 phases du tick
├── rules/
│   ├── ageTransitions.ts    # Règles de progression entre âges
│   ├── pressure.ts          # Système de Pression
│   ├── evolution.ts         # Règles d'évolution
│   ├── civilization.ts      # Règles civilisationnelles
│   ├── apocalypse.ts        # Règles d'apocalypse
│   └── titles.ts            # Attribution des titres
├── entities/
│   ├── cycle.ts
│   ├── species.ts
│   ├── city.ts
│   ├── civilization.ts
│   └── ... (un fichier par entité)
├── events/
│   ├── eventTypes.ts
│   ├── eventBus.ts          # Pub/sub interne
│   └── eventEmitter.ts
└── rng/
    ├── mulberry32.ts        # PRNG déterministe
    └── randomUtils.ts       # Helpers (pickRandom, etc.)
```

**Principe clé** : le core est **pur** autant que possible. Pas d'appels réseau, pas d'I/O direct. Il reçoit des inputs, modifie l'état, émet des events. Les I/O sont déléguées à d'autres modules.

### 📦 chat/ — Chat Adapter

**Responsabilité** : connexion aux plateformes, parsing, validation.

```
chat/
├── adapters/
│   ├── youtubeAdapter.ts    # YouTube Live Chat API
│   ├── twitchAdapter.ts     # Twitch IRC (tmi.js)
│   └── mockAdapter.ts       # Pour tests/dev local
├── parser/
│   ├── commandParser.ts     # Parse les "!commandes"
│   ├── commandRegistry.ts   # Liste des commandes valides
│   └── aliasResolver.ts     # "!pluie" → "!rain"
├── validation/
│   ├── rateLimiter.ts       # Cooldowns par viewer
│   ├── piValidator.ts       # Vérifie les PI
│   └── permissionCheck.ts   # Sub only, streamer only, etc.
├── actions/
│   └── actionEmitter.ts     # Émet vers event queue
└── viewerTracker.ts         # Track qui est présent
```

**Pattern** : chaque adapter implémente une interface commune `ChatAdapter`. Facile d'ajouter de nouvelles plateformes.

```typescript
interface ChatAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onMessage(handler: (msg: ChatMessage) => void): void;
  onViewerJoin(handler: (viewer: ViewerInfo) => void): void;
  onSubscribe(handler: (event: SubEvent) => void): void;
}
```

### 📦 persistence/ — Données

**Responsabilité** : tout ce qui touche au stockage.

```
persistence/
├── db/
│   ├── database.ts          # Connexion SQLite
│   ├── migrations/          # Scripts de migration
│   │   ├── 001_initial.sql
│   │   ├── 002_add_titles.sql
│   │   └── ...
│   └── queries/             # Queries préparées
│       ├── entities.ts
│       ├── events.ts
│       └── viewers.ts
├── repositories/
│   ├── cycleRepo.ts         # Pattern repository par entité
│   ├── speciesRepo.ts
│   ├── cityRepo.ts
│   ├── eventRepo.ts
│   ├── viewerRepo.ts
│   ├── viewerActionRepo.ts  # Historique des !commandes (voir data_model.md §ViewerAction)
│   ├── titleRepo.ts         # Titres attribués aux viewers
│   └── piHistoryRepo.ts     # Journal append-only des deltas de PI
├── snapshots/
│   ├── snapshotManager.ts   # Coordination des snapshots
│   ├── snapshotSerializer.ts
│   └── snapshotLoader.ts
├── archives/
│   └── cycleArchiver.ts     # Export fin de cycle
└── historyLog/
    ├── historyLogger.ts     # Écriture append-only
    └── historyQuery.ts      # Lecture, recherche
```

**Pattern Repository** : chaque entité a son repo qui expose des méthodes CRUD. Le core n'accède jamais directement à la DB.

```typescript
// Exemple
class CityRepo {
  create(city: CityData): City { ... }
  findById(id: number): City | null { ... }
  findActiveInCycle(cycleId: number): City[] { ... }
  update(id: number, changes: Partial<CityData>): void { ... }
  // Note : pas de delete ! Seulement markAsDestroyed()
  markAsDestroyed(id: number, tick: number, cause: string): void { ... }
}
```

### 📦 websocket/ — Communication temps réel

**Responsabilité** : diffusion des événements aux clients.

```
websocket/
├── wsServer.ts              # Serveur WebSocket
├── clientManager.ts         # Gestion connexions
├── broadcaster.ts           # Diffusion des events
├── subscriptions.ts         # Qui écoute quoi
└── protocol.ts              # Format des messages
```

**Protocole** : JSON simple. Chaque message a un `type` et un `data`.

```typescript
// Exemples
{ type: "STATE_UPDATE", data: { pressure: 0.5, ... } }
{ type: "EVENT", data: { id: 123, description: "...", ... } }
{ type: "VIEWER_ACTION", data: { pseudo: "Tom", command: "!rain" } }
{ type: "AGE_TRANSITION", data: { from: "III", to: "IV" } }
```

### 📦 api/ — API REST

**Responsabilité** : exposer les données pour le wiki, outils tiers, etc.

```
api/
├── server.ts                # Express setup
├── routes/
│   ├── planet.ts            # /api/planet/*
│   ├── cycles.ts            # /api/cycles/*
│   ├── viewers.ts           # /api/viewers/*
│   ├── entities.ts          # /api/species, /api/cities, etc.
│   ├── lore.ts              # /api/lore/*
│   └── stats.ts             # /api/stats/*
├── middleware/
│   ├── logging.ts
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── cors.ts
└── controllers/
    └── ... (logique métier des routes)
```

### 📦 lore/ — Génération narrative

**Responsabilité** : transformer les événements en texte narratif.

```
lore/
├── generators/
│   ├── eventNarrator.ts     # "@Tom a fait pleuvoir sur..."
│   ├── ageAnnouncer.ts      # Annonces de nouveaux âges
│   ├── apocalypseNarrator.ts
│   ├── mythGenerator.ts     # Mythes émergents
│   └── prophecyGenerator.ts # Prophéties (!prophecy)
├── templates/
│   ├── events.json          # Templates d'événements
│   ├── names/               # Pools de noms
│   │   ├── civilizations.json
│   │   ├── cities.json
│   │   ├── religions.json
│   │   └── species.json
│   └── myths.json           # Structures de mythes
├── nameGenerator.ts         # Fonction générique
└── languageEvolution.ts     # Dérive linguistique
```

### 📦 utils/ — Utilitaires

```
utils/
├── logger.ts                # Winston/Pino config
├── errors.ts                # Classes d'erreurs custom
├── time.ts                  # Helpers de temps/ticks
├── hash.ts                  # Hashing déterministe
├── validator.ts             # Zod schemas
└── testing/
    └── fixtures.ts          # Données de test
```

### 📦 config/ — Configuration

```
config/
├── index.ts                 # Point d'entrée, charge .env
├── simulation.ts            # Tuning de la simulation
├── commands.ts              # Définition des commandes
└── environment.ts           # Prod / dev / test
```

---

## Modules du frontend

### 📦 renderer/ — Rendu Pixi.js

**Responsabilité** : afficher la planète et ses entités.

```
renderer/
├── pixiApp.ts               # Setup Pixi
├── projection/
│   ├── projectionManager.ts # Bascule globe ↔ iso ↔ spatial selon le zoom
│   └── isoMath.ts           # Conversion monde ↔ iso (tile 32×16)
├── scenes/
│   ├── planetScene.ts       # Scène globe (disque planète)
│   ├── isoScene.ts          # Scène isométrique (tilemap chunk)
│   ├── spaceScene.ts        # Vue spatiale (Âge VII, dézoom au-delà du globe)
│   └── apocalypseScene.ts   # Cinématiques
├── layers/
│   ├── backgroundLayer.ts   # Espace, étoiles
│   ├── planetLayer.ts       # Disque planète (mode globe)
│   ├── atmosphereLayer.ts   # Nuages, couches
│   ├── terrainLayer.ts      # Biomes polygonaux (globe) ou tilemap (iso)
│   ├── isoTilemapLayer.ts   # Grille iso du chunk actif (mode iso)
│   ├── entityLayer.ts       # Espèces, cités (z-sort iso quand en iso)
│   ├── effectsLayer.ts      # Particules, événements
│   └── uiOverlayLayer.ts    # Liaison avec HUD HTML
├── camera/
│   ├── camera.ts            # Position, zoom
│   ├── cinematicCamera.ts   # Caméra auto cinématique
│   └── cameraTargets.ts     # Détection points d'intérêt
├── assetLoader.ts           # Chargement sprites (atlas globe + iso paresseux)
└── animator.ts              # Animations
```

Voir [render_spec.md §Projection adaptative au zoom](render_spec.md#projection-adaptative-au-zoom) pour la spec détaillée.

### 📦 hud/ — HUD HTML/CSS

**Responsabilité** : afficher les informations au-dessus du rendu.

```
hud/
├── HUD.ts                   # Conteneur principal
├── components/
│   ├── AgeBanner.ts         # Banner "Âge IV"
│   ├── StatusPanel.ts       # Température, pop, etc.
│   ├── EventFeed.ts         # Fil des derniers événements
│   ├── ViewerFeed.ts        # Actions récentes des viewers
│   ├── TopViewers.ts        # Classement
│   ├── ApocalypseWarning.ts # Alerte apocalypse
│   ├── CycleCounter.ts      # "Cycle n°14"
│   └── NarrativeBox.ts      # Textes narratifs
├── styles/
│   └── hud.css
└── notifications/
    ├── TitleNotification.ts # "@Tom a gagné Le Forgeron !"
    └── MajorEventToast.ts
```

### 📦 audio/ — Son et musique

```
audio/
├── audioManager.ts          # Howler setup
├── musicPlayer.ts           # Musiques d'ambiance
├── sfxPlayer.ts             # Effets sonores
├── audioMixer.ts            # Volume, transitions
└── ageThemes.ts             # Musique par âge
```

**Principe** : transitions douces entre les pistes selon les événements. Fade in/out lors des changements d'âge.

### 📦 network/ — Client WebSocket

```
network/
├── wsClient.ts              # Connexion WebSocket
├── messageHandler.ts        # Dispatch des messages
├── reconnectLogic.ts        # Auto-reconnect
└── eventSubscriptions.ts    # S'abonne aux events
```

### 📦 main.ts

Point d'entrée qui orchestre tout :

```typescript
// main.ts (simplifié)
import { PixiApp } from './renderer/pixiApp';
import { HUD } from './hud/HUD';
import { AudioManager } from './audio/audioManager';
import { WSClient } from './network/wsClient';

async function main() {
  // 1. Charger les assets
  await preloadAssets();
  
  // 2. Initialiser les composants
  const renderer = new PixiApp(document.getElementById('app'));
  const hud = new HUD(document.getElementById('hud'));
  const audio = new AudioManager();
  const network = new WSClient('wss://genesis-live.server/ws');
  
  // 3. Brancher les événements
  network.on('STATE_UPDATE', state => {
    renderer.updateState(state);
    hud.updateState(state);
    audio.updateAmbience(state.currentAge);
  });
  
  network.on('EVENT', event => {
    renderer.playEventEffect(event);
    hud.showEvent(event);
    audio.playEventSFX(event);
  });
  
  // 4. Démarrer
  await network.connect();
  renderer.start();
}

main().catch(console.error);
```

---

## Communication entre modules

### Backend : Event Bus interne

Tous les modules communiquent via un **Event Bus** central (pattern Observer).

```typescript
// Définition d'un event
interface AgeTransitionEvent {
  type: 'AGE_TRANSITION';
  from: string;
  to: string;
  atTick: number;
}

// Émission
eventBus.emit('AGE_TRANSITION', {
  from: 'III',
  to: 'IV',
  atTick: 12345
});

// Écoute
eventBus.on('AGE_TRANSITION', (event) => {
  // Réagir
});
```

**Pourquoi ?**
- Découplage : le core ne sait pas qui écoute
- Extensibilité : facile d'ajouter un listener (logging, notifications, etc.)
- Testabilité : on peut vérifier que les events sont émis

**Liste des events principaux** :
- `TICK_COMPLETED`
- `CHAT_COMMAND_RECEIVED`
- `ENTITY_CREATED` / `ENTITY_DESTROYED`
- `AGE_TRANSITION`
- `APOCALYPSE_STARTED` / `APOCALYPSE_ENDED`
- `TITLE_EARNED`
- `CYCLE_STARTED` / `CYCLE_ENDED`
- `ERROR_OCCURRED`

### Backend ↔ Frontend : WebSocket

Format des messages (JSON) :

```typescript
// Message générique
interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
}

// Types principaux (côté frontend attendus)
type InboundMessage =
  | { type: 'WELCOME'; data: { cycleId: number, age: string, ... } }
  | { type: 'STATE_UPDATE'; data: PlanetState }
  | { type: 'EVENT'; data: GameEvent }
  | { type: 'VIEWER_ACTION'; data: ViewerActionDisplay }
  | { type: 'ENTITY_BORN'; data: EntityInfo }
  | { type: 'ENTITY_DIED'; data: EntityInfo }
  | { type: 'AGE_TRANSITION'; data: { from: string; to: string } }
  | { type: 'APOCALYPSE'; data: ApocalypseInfo }
  | { type: 'TITLE_EARNED'; data: TitleInfo };
```

**Stratégie de bande passante** :
- STATE_UPDATE uniquement tous les N ticks (pas chaque tick)
- EVENTS pushés immédiatement
- Compression (gzip) activée côté serveur
- Au max : 100 messages/seconde vers un client

### REST API

Format standard REST :

```
GET  /api/planet/current                    → État actuel
GET  /api/cycles                            → Liste cycles
GET  /api/cycles/:id                        → Détails cycle
GET  /api/viewer/:pseudo                    → Profil viewer
GET  /api/viewer/:pseudo/entities           → Ses créations
GET  /api/entities/species/:id              → Détails espèce
GET  /api/entities/cities/:id               → Détails cité
GET  /api/events?cycle=X&severity=major     → Events filtrés
GET  /api/stats/leaderboard                 → Top viewers
GET  /api/lore/search?q=...                 → Recherche lore
```

**Cache** : agressif (1-5 minutes) sur les données historiques, 0 sur l'état courant.

---

## Patterns adoptés

### 1. Command Pattern (pour les commandes chat)

Chaque commande est une classe avec une interface commune :

```typescript
interface Command {
  name: string;
  aliases: string[];
  cost: number;
  cooldownMs: number;
  requiresSub: boolean;
  execute(context: CommandContext): CommandResult;
}

class RainCommand implements Command {
  name = 'rain';
  aliases = ['pluie'];
  cost = 0;
  cooldownMs = 3 * 60 * 1000;
  requiresSub = false;
  
  execute(context) {
    const amount = context.params.duration === 'storm' ? 0.05 : 0.02;
    context.state.waterCoverage += amount;
    return { success: true, effect: 'RAIN_EFFECT' };
  }
}
```

**Avantage** : ajouter une commande = ajouter un fichier. Pas de switch géant.

### 2. Repository Pattern (pour la persistance)

Chaque type d'entité a son repository — une interface unique qui cache le backend (SQLite, fichiers, cache mémoire) :

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: object): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;  // soft-delete uniquement
}

class SpeciesRepository implements Repository<Species> { ... }
class CityRepository implements Repository<City> { ... }
```

**Pourquoi** : le moteur n'a jamais à savoir *où* sont stockées les entités. Permet de basculer SQLite → Postgres plus tard sans toucher la logique métier.

### 3. Observer / Pub-Sub (Event Bus)

Les modules ne s'appellent jamais directement — ils émettent et écoutent des événements :

```typescript
// Dans le chat adapter
eventBus.emit('chat:command', { user, command, args });

// Dans le moteur
eventBus.on('chat:command', handleCommand);

// Dans le logger
eventBus.on('chat:command', logCommand);
```

**Pourquoi** : permet d'ajouter des consommateurs (analytics, modération, wiki) sans modifier les émetteurs. Tests plus simples (on mock l'EventBus). Trace complète des événements possibles pour debug.

### 4. Strategy Pattern (pour les apocalypses)

Chaque type d'apocalypse est une stratégie :

```typescript
interface ApocalypseStrategy {
  name: string;
  canTrigger(state: PlanetState): boolean;
  phases: ApocalypsePhase[];
  apply(state: PlanetState, phase: number): void;
}

class NuclearWinterApocalypse implements ApocalypseStrategy { ... }
class MeteorImpactApocalypse implements ApocalypseStrategy { ... }
// etc.
```

### 5. Factory Pattern (pour les entités)

Création d'entités centralisée :

```typescript
class EntityFactory {
  static createSpecies(params: SpeciesParams): Species {
    // Validation, génération d'ID, nommage scientifique, etc.
    return new Species({...});
  }
}
```

### 6. State Machine (pour les cycles)

Les cycles suivent une state machine explicite :

```
IDLE → STARTING → RUNNING → APOCALYPSE → ENDED → ARCHIVING → IDLE (nouveau cycle)
```

### 7. Circuit Breaker (pour les APIs externes)

Si YouTube API est HS, on n'essaie pas en boucle :

```typescript
if (circuitBreaker.isOpen('youtube-api')) {
  // Skip, retry dans X secondes
  return;
}
```

### 8. Dependency Injection (léger)

Les modules reçoivent leurs dépendances, ne les créent pas :

```typescript
class SimulationEngine {
  constructor(
    private state: StateManager,
    private eventBus: EventBus,
    private rng: RNG,
    private logger: Logger
  ) {}
}
```

Facilite les tests et la modularité.

---

## Gestion de la configuration

### Variables d'environnement

**`.env.example`** (committé, sans secrets) :
```bash
# Serveur
PORT=3000
WS_PORT=3001
NODE_ENV=development

# Chat plateformes
YOUTUBE_API_KEY=
YOUTUBE_LIVE_CHAT_ID=
TWITCH_CHANNEL=

# Base de données
DB_PATH=./data/db/genesis.sqlite
SNAPSHOT_DIR=./data/snapshots
ARCHIVE_DIR=./data/archives

# Simulation
TICK_INTERVAL_MS=2000
SPEED_MULTIPLIER=1.0

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Admin
ADMIN_SECRET=change-me
```

**`.env`** (gitignored, avec les vraies valeurs).

### Configuration de simulation

Dans `backend/src/config/simulation.ts` :

```typescript
export const SIMULATION_CONFIG = {
  tick: {
    defaultIntervalMs: 2000,
    maxDurationMs: 500,
    adaptiveSpeed: true
  },
  
  ages: {
    transitionCheckInterval: 10, // tous les 10 ticks
  },
  
  pressure: {
    baseIncreasePerTick: 0.0001,
    apocalypseThreshold: 0.95,
    sustainedApocalypseDuration: 100
  },
  
  entities: {
    maxActiveSpecies: 100,
    maxActiveCities: 500,
    // ...
  },
  
  rng: {
    algorithm: 'mulberry32',
    initialSeedFormula: (timestamp, cycle) => hash(timestamp + cycle)
  }
};
```

### Feature flags

Pour tester des features en production sans les activer pour tout le monde :

```typescript
export const FEATURE_FLAGS = {
  ENABLE_AGE_VII: true,
  ENABLE_IA_COMMANDS: false,     // work in progress
  ENABLE_RUINS_PERSISTENCE: true,
  ENABLE_DYNAMIC_MUSIC: false    // beta
};
```

---

## Déploiement

### Environnements

**Local (dev)** :
- Backend en `npm run dev` (avec tsx watch)
- Frontend en `npm run dev` (Vite HMR)
- SQLite en local
- Chat en mode mock ou compte test

**Staging** :
- Un cycle de test sur une petite audience
- Monitoring en place
- Rollback facile

**Production** :
- Déployé sur un VPS ou cloud (DigitalOcean, Hetzner, OVH...)
- Configuration : 2-4 vCPU, 4-8 GB RAM minimum
- SSD recommandé pour les snapshots
- Uptime monitoring externe

### Processus de déploiement

```bash
# 1. Build
npm run build

# 2. Migration DB si nécessaire
npm run migrate

# 3. Démarrage via pm2
pm2 start ecosystem.config.js

# 4. Vérification santé
curl http://localhost:3000/api/health

# 5. Activer OBS pour capture
```

### pm2 configuration

**`ecosystem.config.js`** :
```javascript
module.exports = {
  apps: [
    {
      name: 'genesis-backend',
      script: './backend/dist/index.js',
      instances: 1,           // Ne pas scaler en horizontal : une seule simu
      autorestart: true,
      max_memory_restart: '2G',
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### Docker (optionnel)

**`Dockerfile`** :
```dockerfile
FROM node:20-slim

WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000 3001

CMD ["node", "backend/dist/index.js"]
```

**`docker-compose.yml`** pour le dev :
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=development
```

### Stratégie de mise à jour

**Hot updates (sans downtime)** :
- Modifications UI, assets frontend : rechargement client suffit
- Modifications config : API d'admin pour recharger

**Updates avec downtime court (< 1 minute)** :
- Modifications mineures du moteur
- Snapshot avant, redémarrage, reprise du snapshot

**Updates avec migration de données** :
- Backup complet
- Script de migration testé en staging
- Fenêtre de maintenance annoncée à l'avance

---

## Diffusion multi-plateforme

Genesis Live est diffusé **simultanément sur YouTube Live et Twitch** dès le lancement public. Les deux plateformes reçoivent le même flux vidéo et contribuent toutes les deux au chat unifié.

### Schéma de diffusion

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (navigateur capturé par OBS Studio)            │
└──────────────────────┬──────────────────────────────────┘
                       │ capture 1080p / 30fps
                       ▼
┌─────────────────────────────────────────────────────────┐
│ OBS Studio (machine du streamer)                         │
│ - Scène unique, sortie RTMP unique                       │
└──────────────────────┬──────────────────────────────────┘
                       │ flux RTMP
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Relais multistream (Restream.io, Aitum, ou serveur NGINX-RTMP) │
└───────────┬────────────────────────────┬────────────────┘
            │                            │
            ▼                            ▼
┌──────────────────────┐      ┌──────────────────────┐
│ YouTube Live         │      │ Twitch               │
│ rtmp://.../live2     │      │ rtmp://.../app       │
└──────────┬───────────┘      └──────────┬───────────┘
           │ viewers + chat              │ viewers + chat
           ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│ Backend Genesis Live                                     │
│ - YouTubeAdapter (poll)  ◄── chats reçus ──► TwitchAdapter (IRC) │
│ - UnifiedChatManager : agrège dans le même monde         │
└─────────────────────────────────────────────────────────┘
```

### Options techniques pour le relais

| Solution | Coût | Complexité | Latence ajoutée |
|----------|------|------------|------------------|
| **Restream.io** | Gratuit (3 plateformes) → payant | Zéro | ~2s |
| **Aitum Multistream** | Abonnement | Faible (plugin OBS) | ~1s |
| **NGINX-RTMP self-hosted** | Coût serveur | Moyenne (config RTMP) | < 1s |
| **OBS avec 2 sorties directes** | Gratuit | Faible (plugin Multi-RTMP) | Charge CPU upload ×2 |

**Recommandation** : commencer avec Restream.io (plan gratuit) pour valider le concept, basculer sur NGINX-RTMP self-hosted quand le stream est stabilisé (économie long terme + latence minimale).

### Latence et synchronisation

- La latence de diffusion diffère entre YouTube (3-5s) et Twitch (1-2s). **Ne pas chercher à la synchroniser** — chaque plateforme a son rythme.
- Le backend traite les commandes chat dans l'ordre d'arrivée côté serveur, pas côté viewer. Un viewer YouTube voyant un événement 2s après un viewer Twitch verra simplement ses commandes traitées dans un ordre global cohérent.
- Les `!prophecy`, votes et commandes consensuelles ont une fenêtre temporelle (ex: 30s) assez large pour absorber les écarts de latence.

### Identité et attribution cross-platform

- Un viewer actif sur les deux plateformes peut lier ses pseudos via `!link youtube MonPseudoYT` / `!link twitch MonPseudoTW` (voir [genesis_live_commands.md:137](genesis_live_commands.md#L137)).
- Sans liaison explicite, les deux pseudos sont traités comme deux viewers distincts — PI et titres séparés.
- Les superchats YouTube et les Bits/abonnements Twitch sont convertis en PI selon des barèmes distincts mais additifs.

### Opérations et monitoring

- Surveiller indépendamment : ingest YouTube OK ? ingest Twitch OK ? relais OK ?
- Alertes : si une plateforme tombe (flux coupé, API down), continuer sur l'autre mais notifier.
- Stats séparées par plateforme (viewers, messages/min) pour détecter les déséquilibres d'audience.

### Considérations légales et ToS

- Les ToS YouTube et Twitch autorisent le multistream (pas de clause d'exclusivité pour les chaînes non-partenaires).
- **Partenariat Twitch** : si un jour acquis, vérifier la clause d'exclusivité (Twitch Partner impose souvent 24h d'exclusivité live sur Twitch pour certaines catégories).
- **YouTube Partner** : pas de clause d'exclusivité à ce jour.
- Genesis Live n'étant pas une catégorie « Just Chatting » ni un jeu licencié, le multistream est sûr.

---

## Monitoring et observabilité

### Logging structuré

Tous les logs sont en JSON structuré :

```json
{
  "timestamp": "2026-04-19T12:34:56Z",
  "level": "info",
  "module": "simulation",
  "event": "age_transition",
  "from": "III",
  "to": "IV",
  "tick": 12345,
  "cycle": 7
}
```

**Niveaux** :
- `error` : erreurs critiques, demande intervention
- `warn` : situations anormales mais gérables
- `info` : événements notables (transitions, apocalypses)
- `debug` : détails techniques (désactivé en prod par défaut)

### Métriques à suivre

**Métriques système** :
- CPU usage
- Mémoire
- Latence des ticks (p50, p95, p99)
- Taille de la DB
- Espace disque

**Métriques métier** :
- Nombre de viewers actifs
- Actions par minute
- Événements par tick
- Âge en cours, pression
- Titre attribué / jour

**Métriques de santé** :
- Uptime du backend
- Connexions WebSocket actives
- Taux d'erreur des commandes
- Latence chat → effet

### Dashboard

Un dashboard simple (Grafana ou custom HTML) affichant :
- Métriques système
- Métriques métier
- Logs récents
- Alertes actives

### Alertes

Conditions qui déclenchent une notification (Discord webhook, email, SMS) :
- Backend down
- Erreurs > 10/minute
- Tick latency > 1 seconde en moyenne
- Chat déconnecté depuis > 5 minutes
- Pression à 1.0 sans apocalypse déclenchée (bug)
- Espace disque < 10%

### Healthcheck endpoint

```
GET /api/health
→ 200 { status: "ok", uptime: 12345, version: "1.2.0" }
```

Vérifie :
- Backend répond
- DB accessible
- Dernière mise à jour < 30s (la simulation tourne)
- Memory < seuil critique

---

## Tests

### Pyramide des tests

```
         /\
        /E2E\         5-10 tests (scénarios complets)
       /------\
      /Integr.\       30-50 tests (modules ensemble)
     /----------\
    /  Unitaires \    200-500 tests (fonctions isolées)
   /--------------\
```

### Tests unitaires

**Priorité absolue** pour :
- Règles de simulation (évolution, apocalypse, etc.)
- Parser de commandes
- Calculs de fitness, probabilités
- Générateurs de noms, drift

**Exemple** :
```typescript
describe('AgeTransitions', () => {
  it('should transition from I to II when water coverage >= 5%', () => {
    const state = makeState({ age: 'I', waterCoverage: 0.06 });
    const result = checkAgeTransition(state);
    expect(result.shouldTransition).toBe(true);
    expect(result.nextAge).toBe('II');
  });
});
```

### Tests d'intégration

Vérifier les interactions entre modules :
- Commande chat → event → mutation d'état → broadcast
- Chargement d'un snapshot complet
- Déroulement d'un cycle complet (accéléré)

### Tests E2E

Scénarios complets :
- Démarrage du serveur → connexion client → affichage planète
- Simulation d'un cycle entier en mode rapide
- Crash + recovery depuis snapshot

### Tests de charge

Avant un gros événement (stream live attendu), vérifier :
- 1000 commandes en 1 minute
- 500 connexions WebSocket simultanées
- Simulation sans dégradation

### Organisation des tests

```
backend/tests/
├── unit/
│   ├── core/
│   │   ├── rules/
│   │   └── rng/
│   ├── chat/
│   └── persistence/
├── integration/
│   └── scenarios/
└── e2e/
    └── full-cycle.test.ts
```

---

## Sécurité

### Principes de sécurité

**1. Trust no input**
Toutes les entrées (chat, API, WebSocket) sont hostiles jusqu'à validation.

**2. Least privilege**
Chaque module a les permissions minimales nécessaires.

**3. Defense in depth**
Plusieurs couches de sécurité, même si redondantes.

### Chat sécurisé

- **Validation stricte** des commandes (longueur, caractères autorisés)
- **Rate limiting** global + par viewer
- **Filtrage** des noms offensants (liste + détection)
- **Blacklist** de viewers malveillants
- **Détection de spam** (pattern matching)

### API REST

- **CORS** restrictif (seulement les domaines autorisés)
- **Rate limiting** par IP (100 req/min par défaut)
- **Input validation** avec Zod schemas
- **Headers sécurité** : Helmet.js

### WebSocket

- **Limite de connexions** par IP (5 simultanées max)
- **Taille des messages** limitée (4KB)
- **Timeout** sur connexions inactives (5 min)

### Secrets

- **JAMAIS** dans le code, toujours dans `.env`
- Utiliser un gestionnaire de secrets pour la production (AWS Secrets Manager, Vault...)
- Rotation régulière des API keys

### Backup et recovery

- Backups automatiques quotidiens
- Backups hors site (cloud)
- Procédure de restauration testée régulièrement
- RPO (Recovery Point Objective) : < 1 heure
- RTO (Recovery Time Objective) : < 30 minutes

### Données personnelles (RGPD)

- Pas de collecte de données personnelles au-delà du pseudo public
- Pas de cookies de tracking
- Droit à l'oubli : suppression possible sur demande (pseudo remplacé par "Anonyme_XXXX")
- Pas de partage de données avec des tiers

---

## Roadmap technique

### Phase 0 — Setup (1-2 semaines)

- [ ] Structure du repo
- [ ] Stack technique installée
- [ ] Config de base (TS, ESLint, Prettier, tests)
- [ ] CI/CD (GitHub Actions)
- [ ] Premier "hello world" frontend + backend + WebSocket

### Phase 1 — MVP simulation (3-4 semaines)

- [ ] Boucle de tick basique
- [ ] Modèle de données SQLite
- [ ] 3 premiers âges (I, II, III) avec règles minimales
- [ ] 10-20 commandes chat essentielles
- [ ] Mock chat adapter pour tests
- [ ] Rendu simple (planète qui change de couleur)

### Phase 2 — Intégration chat réelle (2 semaines)

- [ ] Adapter YouTube Live Chat
- [ ] Système de PI et cooldowns
- [ ] Validation, rate limiting
- [ ] Broadcasting WebSocket
- [ ] Premier HUD simple

### Phase 3 — Les 7 âges complets (4-6 semaines)

- [ ] Âge IV : écosystèmes
- [ ] Âge V : tribus
- [ ] Âge VI : civilisations complètes
- [ ] Âge VII : spatial
- [ ] Toutes les commandes implémentées
- [ ] Système de titres

### Phase 4 — Apocalypses et cycles (2-3 semaines)

- [ ] 9 types d'apocalypses
- [ ] Transitions entre cycles
- [ ] Persistance des ruines
- [ ] Artefacts légendaires

### Phase 5 — Polish visuel et sonore (3-4 semaines)

- [ ] Tous les assets graphiques intégrés
- [ ] Caméra cinématique
- [ ] Effets de particules
- [ ] Musique adaptative par âge
- [ ] SFX complets

### Phase 6 — API publique et wiki (2 semaines)

- [ ] REST API complète
- [ ] Site wiki auto-généré
- [ ] Profils viewers consultables
- [ ] Export markdown/JSON des cycles

### Phase 7 — Production et scaling (1-2 semaines)

- [ ] Déploiement production
- [ ] Monitoring complet
- [ ] Tests de charge
- [ ] Documentation d'ops

### Phase 8+ — Évolution continue

- [ ] Ajustements équilibrage
- [ ] Nouveaux événements émergents
- [ ] Commandes secrètes
- [ ] Événements saisonniers (Halloween, Noël...)
- [ ] Features communautaires

### Estimation totale

**Solo dev à temps partiel** : 6-9 mois pour avoir une V1 solide
**Solo dev à temps plein** : 3-4 mois
**Équipe de 2-3** : 2-3 mois

---

## ✨ Conclusion

Cette architecture vise trois objectifs :

**1. Simplicité**
Pas de microservices, pas de Kubernetes. Un backend, un frontend, une DB. Le projet doit rester compréhensible par une personne seule.

**2. Évolutivité**
L'architecture modulaire permet d'ajouter des features (nouveaux âges, nouvelles plateformes chat, nouveaux modes de jeu) sans tout casser.

**3. Robustesse**
Logging, monitoring, tests, persistance régulière. Un stream 24/7 doit survivre aux crashes, aux pics de charge, aux erreurs.

### Principes à ne jamais violer

1. **Séparation simulation / rendu**
2. **Source unique de vérité (backend)**
3. **Événements immutables**
4. **Attribution des actions aux viewers**
5. **Persistance régulière (pas de perte de données)**

### Principes à ajuster selon besoins

1. **Stack technique** (peut évoluer, mais coûteux)
2. **Structure des modules** (peut être refactoré si nécessaire)
3. **Performances** (optimiser seulement ce qui est mesuré)
4. **Formats de communication** (avec versioning)

### Ce que cette architecture **ne résout pas** (à prévoir plus tard)

- Scaling horizontal : une seule instance de simulation. Pour gérer des millions de viewers, il faudrait repenser.
- Multijeu : un seul stream, une seule planète. Pas de support de plusieurs streams en parallèle.
- Multilangue : l'UI est prévue en une langue. Traduction possible mais demande du refactor.

Ces limites sont **acceptables** pour la v1. À revoir si le succès explose.

---

*Document d'architecture — v1.0*
*À mettre à jour à chaque refactor majeur ou changement de stack.*
