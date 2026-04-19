# 🗄️ GENESIS LIVE — Modèle de données

*Structure complète des données : entités, relations, persistance, requêtes types.*

---

## 📖 Table des matières

1. [Principes du modèle](#principes-du-modèle)
2. [Architecture de persistance](#architecture-de-persistance)
3. [Schéma global](#schéma-global)
4. [Entités racines](#entités-racines)
5. [Entités biologiques](#entités-biologiques)
6. [Entités civilisationnelles](#entités-civilisationnelles)
7. [Entités géographiques](#entités-géographiques)
8. [Entités sociales (viewers)](#entités-sociales-viewers)
9. [Entités événementielles](#entités-événementielles)
10. [Entités méta](#entités-méta)
11. [Relations et index](#relations-et-index)
12. [Requêtes types](#requêtes-types)
13. [Migrations et versioning](#migrations-et-versioning)
14. [Exports et API](#exports-et-api)

---

## Principes du modèle

### Les 5 règles du modèle de données

**1. Immutabilité des événements**
Tout événement enregistré ne peut **jamais** être modifié ou supprimé. On peut ajouter, jamais altérer. Le passé est sacré.

**2. Identifiants stables**
Chaque entité a un ID unique permanent. Les IDs ne sont jamais réutilisés, même après extinction/destruction.

**3. Dénormalisation stratégique**
On privilégie les lectures rapides aux écritures parfaites. Certaines données sont dupliquées (snapshot du pseudo au moment de l'action) pour préserver le contexte historique.

**4. Références molles**
Les relations utilisent des IDs, pas des pointeurs directs. Une entité supprimée peut toujours être référencée (on sait qu'elle a existé).

**5. Timestamps partout**
Chaque donnée a ses timestamps : créé_à, modifié_à, détruit_à (si applicable). Toujours en UTC, toujours en secondes Unix.

### Distinction état vs événements

Le modèle sépare deux types de données :

**Données d'état** (mutables, reflètent le "maintenant")

- Populations actuelles, températures, stats d'empires...
- Stockées sous forme optimisée pour la lecture rapide
- Reconstructibles à partir des événements

**Données événementielles** (immutables, reflètent le "ce qui s'est passé")

- Actions du chat, naissances, morts, apocalypses
- Append-only, jamais modifiées
- Source de vérité absolue

---

## Architecture de persistance

### Stack de stockage recommandée

```
┌─────────────────────────────────────────────────┐
│  RAM (état vivant — optimisé lecture)           │
│  - PlanetState, entités actives, caches         │
│  - Mis à jour à chaque tick                     │
├─────────────────────────────────────────────────┤
│  SQLite (état persistant — snapshot)            │
│  - Snapshots complets                           │
│  - HistoryLog indexé                            │
│  - Lecture rapide pour le Grand Registre        │
├─────────────────────────────────────────────────┤
│  Fichiers JSON (archives long terme)            │
│  - Snapshots de fin de cycle                    │
│  - Exports narratifs                            │
│  - Backups rotatifs                             │
├─────────────────────────────────────────────────┤
│  Optionnel : Redis (caches partagés)            │
│  - Si le stream se déploie en distribué         │
└─────────────────────────────────────────────────┘
```

### Volumes de données attendus

Pour un cycle typique de 6-12 mois (180-365 jours) :

- **Entités actives simultanées** : 100 - 10 000
- **Entités créées au total** : 1 000 000 - 10 000 000
- **Événements chat** : 3 000 000 - 30 000 000
- **Taille HistoryLog** : 3 GB - 25 GB
- **Taille snapshots** : 50 MB - 500 MB chacun

Sur un stream qui tourne plusieurs années = 1 à 2 cycles par an :

- **Volume total archivé** : 30 - 300 GB / an
- **HistoryLog cumulé** : 10 - 100 GB / an (compressable)

### Politiques de rétention

| Donnée | Rétention |
|--------|-----------|
| État actif en RAM | Permanent pendant le cycle |
| Snapshots intra-cycle | Jusqu'à la fin du cycle en cours (6-12 mois), puis rotation : ne garder que N snapshots jalons |
| Snapshots fin de cycle | Permanent |
| HistoryLog complet | Permanent |
| Logs techniques (debug) | 90 jours |
| Caches | Volatile |

---

## Schéma global

### Vue d'ensemble des entités

```
┌──────────────────────────────────────────────────────────────────┐
│                         RACINES                                   │
│  Cycle ─── PlanetState ─── Tick                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼──────┐      ┌───────▼───────┐     ┌──────▼──────┐
│ GÉOGRAPHIE   │      │ BIOLOGIE      │     │ CIVILISATION│
│ Continent    │      │ Species       │     │ Civilization│
│ Biome        │      │ Strain        │     │ City        │
│ Region       │      │ Creature      │     │ Religion    │
│ PointOfInt.  │      │ Plant         │     │ Dynasty     │
└──────────────┘      └───────────────┘     └─────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  ÉVÉNEMENTS      │
                    │  ChatAction      │
                    │  NaturalEvent    │
                    │  HistoricalEvent │
                    │  Apocalypse      │
                    └──────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  SOCIAL          │
                    │  Viewer          │
                    │  Title           │
                    │  ViewerStats     │
                    └──────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  MÉTA            │
                    │  Artifact        │
                    │  Myth            │
                    │  LoreEntry       │
                    └──────────────────┘
```

### Conventions de nommage

- **Entités** : PascalCase singulier (`Species`, `City`, pas `Specieses`)
- **Champs** : camelCase (`createdAt`, `populationTotal`)
- **IDs** : suffixés `Id` (`speciesId`, `cityId`)
- **Booléens** : préfixés is/has/can (`isActive`, `hasReligion`, `canEvolve`)
- **Dates** : suffixées At (`createdAt`, `destroyedAt`)
- **Collections** : suffixées `Ids` au pluriel (`allyIds`, `childSpeciesIds`)

---

## Entités racines

### Cycle

Représente une "vie" complète de la planète entre deux apocalypses.

```
Cycle {
  cycleId: int (auto-increment, unique globalement)
  cycleNumber: int (numéroté 1, 2, 3...)
  
  // Temps
  startedAt: timestamp
  endedAt: timestamp | null
  totalTicks: int
  realDuration: int (secondes)
  
  // État final (null tant que le cycle est actif)
  endedByApocalypse: string | null ("Impact", "Singularité"...)
  ageReached: string (ex: "VII")
  
  // Statistiques agrégées
  totalActions: int
  uniqueViewers: int
  peakPopulation: int
  peakTechLevel: int
  speciesCreated: int
  civilizationsFounded: int
  
  // Méta
  seedInitial: int
  planetNames: [string] (tous les noms que la planète a reçus durant ce cycle)
  
  // Relations
  previousCycleId: int | null
  nextCycleId: int | null
}
```

### PlanetState

L'état actuel de la planète. **Une seule instance existe à la fois** (remplacée à chaque nouveau cycle).

```
PlanetState {
  planetStateId: string (singleton: "current")
  cycleId: int (référence au Cycle actif)
  
  // Temps
  tickCount: int
  lastUpdatedAt: timestamp
  currentAge: enum ("I", "II", "III", "IV", "V", "VI", "VII")
  ageProgress: float [0, 1]
  
  // Climat
  temperature: float (°C)
  waterCoverage: float [0, 1]
  oxygenLevel: float [0, 1]
  co2Level: float [0, 1]
  radiation: float [0, 1]
  pollution: float [0, 1]
  
  // Biosphère
  biomass: float
  biodiversity: int (nombre d'espèces vivantes)
  averageComplexity: float
  
  // Civilisation
  populationTotal: int
  techLevel: int [0, 10]
  culturalComplexity: float
  numCivilizations: int
  numCities: int
  numReligions: int
  
  // Dynamique
  pressure: float [0, 1]
  stability: float [0, 1]
  
  // Atmosphère narrative
  dominantMood: enum ("peaceful", "tense", "chaotic", "apocalyptic"...)
  currentNarrative: string (phrase contextuelle mise à jour)
  
  // Nom actuel
  currentPlanetName: string
  
  // État RNG
  rngSeed: int
  rngState: blob (état sérialisé du PRNG)
  
  // Flags
  isInApocalypse: boolean
  apocalypsePhase: enum | null ("premise", "trigger", "devastation", "cessation")
  apocalypseType: string | null
}
```

### Tick

Un tick individuel. Très nombreux mais essentiels pour le replay.

```
Tick {
  tickId: int (auto-increment)
  cycleId: int
  tickNumber: int (dans le cycle)
  
  // Temps
  executedAt: timestamp
  realDurationMs: int (combien de temps a pris l'exécution)
  
  // Delta de l'état
  stateChanges: object (JSON compact des changements)
  eventsCount: int (nombre d'événements ce tick)
  
  // Pour debug
  rngStateSnapshot: blob | null (seulement stocké 1 tick sur 100)
}
```

**Note d'implémentation** : les ticks peuvent être nombreux (des millions par cycle). Pour économiser l'espace, on ne stocke que les **deltas** et on agrège régulièrement (un snapshot complet suffit tous les 1000 ticks).

---

## Entités biologiques

### Strain (Souche - Âge III)

Micro-organisme introduit par un viewer ou créé naturellement.

```
Strain {
  strainId: int
  
  // Identité
  name: string (pseudo du viewer ou dérivé)
  displayColor: string (hex, ex: "#8B4FE8")
  scientificName: string (généré, ex: "Baciliformis baconkurii")
  
  // Origine
  founderViewerId: int | null (null si apparue naturellement)
  foundedAtTick: int
  cycleId: int
  
  // Généalogie
  parentStrainId: int | null
  generation: int
  childrenStrainIds: [int]
  
  // Biologie
  traits: {
    isPhotosynthetic: boolean,
    isAnaerobic: boolean,
    isPredatory: boolean,
    heatResistance: float [0, 1],
    coldResistance: float [0, 1],
    toxinResistance: float [0, 1],
    reproductionRate: float,
    mutationRate: float
  }
  
  // État
  population: bigint (peut atteindre 10^12)
  habitat: enum ("surface_water", "deep_water", "coastal", "hydrothermal"...)
  isAlive: boolean
  
  // Relations écologiques
  competesWithStrainIds: [int]
  symbioticWithStrainIds: [int]
  
  // Historique
  extinctAtTick: int | null
  causeOfExtinction: string | null
  maxPopulationReached: bigint
  
  // Descendance
  leadToSpeciesIds: [int] (si a donné naissance à des espèces de l'Âge IV)
}
```

### Species (Espèce - Âge IV+)

Créature complexe.

```
Species {
  speciesId: int
  
  // Identité
  name: string (pseudo viewer ou dérivé)
  scientificName: string (ex: "Dracosaurus tomsgxi")
  displayName: string (nom vernaculaire, ex: "Grand dragon de Tom")
  
  // Origine
  founderViewerId: int | null
  foundedAtTick: int
  cycleId: int
  
  // Généalogie
  parentSpeciesId: int | null
  ancestorStrainId: int | null
  generation: int
  childrenSpeciesIds: [int]
  
  // Biologie
  traits: {
    size: float (mètres, 0.001 à 100),
    weight: float (kg),
    diet: enum ("herbivore", "carnivore", "omnivore", "photosynthetic", "detritivore"),
    locomotion: enum ("aquatic", "terrestrial", "aerial", "amphibious", "subterranean"),
    intelligence: float [0, 1],
    aggressiveness: float [0, 1],
    reproductionRate: float,
    lifespan: int (en ticks-années équivalents),
    
    // Capacités
    canUseTools: boolean,
    canCommunicate: boolean,
    isSocial: boolean,
    isVenomous: boolean,
    hasArmor: boolean,
    
    // Traits légendaires (rares)
    hasSpecialAbility: string | null ("telepathy", "silicon_based", "multi_body"...)
  }
  
  // Apparence
  appearance: {
    primaryColor: string,
    secondaryColor: string,
    bodyType: enum,
    features: [string] ("horns", "wings", "scales", "fur"...)
  }
  
  // État écologique
  population: bigint
  biome: string
  habitatRegionIds: [int]
  isAlive: boolean
  isApexPredator: boolean
  
  // Relations
  predatorSpeciesIds: [int]
  preySpeciesIds: [int]
  competitorSpeciesIds: [int]
  
  // Historique
  extinctAtTick: int | null
  causeOfExtinction: string | null
  maxPopulationReached: bigint
  
  // Descendance vers intelligence (Âge V)
  becameIntelligent: boolean
  leadToTribeIds: [int]
}
```

### Plant (Plante)

Végétation. Plus simple que les espèces animales mais critique pour les écosystèmes.

```
Plant {
  plantId: int
  
  name: string
  scientificName: string
  
  founderViewerId: int | null
  foundedAtTick: int
  cycleId: int
  
  traits: {
    type: enum ("algae", "moss", "fern", "conifer", "flowering", "tree", "grass"),
    height: float,
    photosynthesisRate: float,
    oxygenProduction: float,
    reproductionRate: float,
    lifespan: int,
    
    // Spécialités
    producesFruit: boolean,
    isEdible: boolean,
    isMedicinal: boolean,
    isPoisonous: boolean
  }
  
  coverage: float (% de la surface terrestre occupée)
  biomes: [string]
  
  isAlive: boolean
  extinctAtTick: int | null
}
```

---

## Entités civilisationnelles

### Tribe (Tribu - Âge V)

Groupe humanoïde pré-civilisation.

```
Tribe {
  tribeId: int
  
  // Identité
  name: string (pseudo ou dérivé)
  
  // Origine
  founderViewerId: int | null
  parentSpeciesId: int (espèce intelligente d'origine)
  foundedAtTick: int
  cycleId: int
  
  // Démographie
  population: int
  birthRate: float
  deathRate: float
  
  // Culture
  languageId: int | null
  religionId: int | null
  culturalTraits: [string] ("hunter_gatherer", "pastoral", "fishermen"...)
  
  // Technologies
  hasFire: boolean
  hasLanguage: boolean
  hasAgriculture: boolean
  hasMetallurgy: boolean
  tools: [string] ("stone_axe", "bow", "spear"...)
  
  // Géographie
  currentRegionId: int
  migratedFromRegions: [int]
  
  // Relations
  alliedTribeIds: [int]
  enemyTribeIds: [int]
  
  // Évolution
  hasBecomeCivilization: boolean
  evolvedToCivilizationId: int | null
  
  // Historique
  extinctAtTick: int | null
  causeOfExtinction: string | null
}
```

### Civilization (Civilisation - Âge VI+)

Ensemble culturel et politique de cités.

```
Civilization {
  civilizationId: int
  
  // Identité
  name: string
  originTribeId: int | null
  founderViewerId: int | null
  foundedAtTick: int
  cycleId: int
  
  // Trait dominant (Tirage des Destinées)
  archetype: enum ("solar", "lunar", "volcanic", "abyssal", "troglodyte", "celestial")
  mainTrait: enum ("warlike", "peaceful", "mystical", "mercantile", "scientific", "artistic")
  
  // Démographie
  population: bigint
  
  // Pouvoir
  techLevel: int [0, 10]
  militaryPower: float
  economicPower: float
  culturalInfluence: float
  
  // Organisation
  governmentType: enum ("tribal_council", "monarchy", "oligarchy", "republic", "empire", "theocracy", "dictatorship", "ai_ruled"...)
  capitalCityId: int | null
  cityIds: [int]
  
  // Culture
  dominantReligionIds: [int]
  officialLanguage: string
  writingSystem: string | null
  
  // Relations
  alliedCivilizationIds: [int]
  enemyCivilizationIds: [int]
  tradePartnerCivilizationIds: [int]
  atWarWithCivilizationIds: [int]
  
  // Technologies développées
  technologies: [string] ("bronze", "iron", "writing", "wheel", "printing", "gunpowder", "steam", "electricity", "computing", "space"...)
  
  // Historique
  collapsedAtTick: int | null
  causeOfCollapse: string | null
  peakPopulation: bigint
  peakTechLevel: int
  longestWar: int | null (warEventId)
  
  // Méta
  isCurrentDominant: boolean
  hasReachedSpace: boolean
  hasCreatedAI: boolean
}
```

### City (Cité)

Unité urbaine de base des civilisations.

```
City {
  cityId: int
  
  // Identité
  name: string (pseudo viewer ou dérivé)
  founderViewerId: int | null
  foundedAtTick: int
  cycleId: int
  
  // Géographie
  regionId: int
  coordinates: { lat: float, lng: float }
  
  // Appartenance
  civilizationId: int
  isCapital: boolean
  
  // Démographie
  population: int
  growthRate: float
  happiness: float [0, 1]
  
  // Économie
  wealth: float
  productionOutput: float
  foodProduction: float
  
  // Infrastructure
  buildings: [
    {
      buildingId: int,
      type: string ("temple", "castle", "university", "factory"...),
      builtAtTick: int,
      destroyedAtTick: int | null
    }
  ]
  
  // État
  isActive: boolean
  isUnderSiege: boolean
  isInRevolt: boolean
  isRuined: boolean
  
  // Relations
  tradeRoutesCityIds: [int]
  currentEnemyCityIds: [int]
  
  // Historique
  destroyedAtTick: int | null
  causeOfDestruction: string | null
  peakPopulation: int
  
  // Dynasty
  currentDynastyId: int | null
  historicalDynastyIds: [int]
}
```

### Religion

```
Religion {
  religionId: int
  
  // Identité
  name: string
  founderViewerId: int | null
  foundedAtTick: int
  cycleId: int
  
  // Théologie
  type: enum ("monotheistic", "polytheistic", "pantheistic", "ancestral", "animist", "philosophical")
  primaryDeity: string | null (ex: "SOL", "NOX", "KHRON", "VOX" ou nom personnalisé — voir genesis_live_lore.md §Forces primordiales)
  deities: [string]
  
  // Doctrine
  coreBeliefs: [string]
  moralCode: [string]
  taboos: [string]
  
  // Influence
  followerCount: bigint
  cityIds: [int] (cités où la religion est dominante)
  civilizationIds: [int] (civilisations influencées)
  
  // Histoire
  schismsIds: [int] (religionIds qui ont divergé de celle-ci)
  parentReligionId: int | null (si elle est elle-même issue d'un schisme)
  
  // État
  isActive: boolean
  extinctAtTick: int | null
  peakFollowers: bigint
}
```

### Dynasty

Lignée royale ou dirigeante.

```
Dynasty {
  dynastyId: int
  
  name: string (ex: "Maison de Tomsgx")
  founderViewerId: int
  foundedAtTick: int
  cycleId: int
  
  cityId: int (cité principale)
  civilizationId: int
  
  currentRulerName: string
  rulersSuccession: [
    {
      name: string,
      reignStartTick: int,
      reignEndTick: int | null,
      causeOfEnd: string | null ("natural_death", "assassination", "overthrow", "abdication")
    }
  ]
  
  isActive: boolean
  endedAtTick: int | null
  causeOfEnd: string | null
}
```

---

## Entités géographiques

### Continent

```
Continent {
  continentId: int
  
  name: string (peut être nommé par les civilisations)
  namedByCivilizationId: int | null
  
  formedAtTick: int
  cycleId: int
  
  // Géométrie (simplifiée)
  shape: polygon | string (représentation vectorielle)
  surface: float (km² équivalents)
  
  // Géologie
  elevation: {
    min: float,
    max: float,
    average: float
  }
  
  // Relations
  regionIds: [int]
  cityIds: [int]
  
  // Climat dominant
  climateZones: [enum] ("tropical", "temperate", "arctic", "desert", "tundra")
  
  // Historique
  splitFromContinentId: int | null (si issue d'une séparation)
  mergedWithContinentIds: [int] (si a fusionné)
  submergedAtTick: int | null
}
```

### Region

Subdivision d'un continent, porte les biomes.

```
Region {
  regionId: int
  continentId: int | null (null si océanique)
  
  name: string | null
  
  biome: enum ("forest", "desert", "mountain", "plains", "tundra", "jungle", "swamp", "ocean", "reef"...)
  climate: enum ("tropical", "temperate", "cold", "arid", "polar")
  
  coordinates: { lat: float, lng: float }
  surface: float
  
  // Ressources
  resources: {
    freshWater: float [0, 1],
    minerals: [string],
    soilFertility: float [0, 1]
  }
  
  // Entités présentes
  speciesIds: [int]
  tribeIds: [int]
  cityIds: [int]
  
  // État
  isHabitable: boolean
  isContaminated: boolean
  contaminationLevel: float [0, 1]
  
  // Historique
  formedAtTick: int
  destroyedAtTick: int | null
}
```

### PointOfInterest

Lieux mémorables : ruines, temples, artefacts localisés, etc.

```
PointOfInterest {
  poiId: int
  
  name: string
  type: enum ("ruins", "temple", "monument", "battlefield", "tomb", "crater", "artifact_site", "natural_wonder")
  
  regionId: int
  coordinates: { lat: float, lng: float }
  
  // Origine
  createdAtTick: int
  cycleId: int (cycle d'origine — peut être différent du cycle actuel)
  associatedEntityType: string (ex: "City", "Species", "Civilization")
  associatedEntityId: int | null
  
  // Lore
  description: string
  significance: string
  
  // Persistance
  persistsAcrossCycles: boolean
  discoveredInCycles: [int] (quels cycles l'ont redécouvert)
  
  // État
  isHidden: boolean (pas encore découvert par la civilisation actuelle)
  isDestroyed: boolean
}
```

---

## Entités sociales (viewers)

### Viewer

Représente une personne qui interagit avec le stream, à travers tous les cycles.

```
Viewer {
  viewerId: int (interne, = unifiedId cross-plateforme)
  
  // Identité publique
  pseudo: string (pseudo canonique actuel)
  pseudoHistory: [string] (tous les anciens pseudos s'il a changé)
  
  // Plateformes liées (un viewer peut apparaître sur plusieurs plateformes)
  platforms: [{
    platform: enum ("youtube", "twitch", "kick", "discord", "mock"),
    platformId: string,       // ID natif sur la plateforme
    pseudoOnPlatform: string, // pseudo sur CETTE plateforme
    linkedAt: timestamp,
    accountCreatedAt: timestamp | null  // âge du compte source (anti-bot)
  }]
  
  // Premières traces
  firstSeenAt: timestamp
  firstSeenInCycleId: int
  
  // Dernières traces
  lastSeenAt: timestamp
  lastActionAt: timestamp | null
  
  // Stats globales (tous cycles)
  totalActions: int
  totalPresenceMinutes: int
  cyclesPresent: [int]
  
  // Économie
  currentPI: int (Points d'Influence)
  lifetimePI: int (total gagné)
  lifetimePISpent: int
  
  // Subs (agrégé sur toutes les plateformes — meilleur tier gagne)
  isSubscriber: boolean
  subscriberSince: timestamp | null
  subscriberTier: int (0 = non-sub, 1 = standard, 2 = premium, 3 = prime...)
  
  // Dons
  totalDonated: float (en euros équivalents)
  
  // Relations
  titleIds: [int]
  
  // Modération
  isBanned: boolean
  banReason: string | null
  isShadowbanned: boolean
  shadowbanReason: string | null
  shadowbannedAt: timestamp | null
  
  // Préférences
  preferredLanguage: string
  
  // Flags spéciaux
  isModerator: boolean
  isStreamerFriend: boolean
  isVIP: boolean
}
```

**Note cross-plateforme** : la résolution d'identité multi-plateforme est décrite dans [chat_integration.md §Résolution d'identité cross-platform](chat_integration.md#résolution-didentité-cross-platform). Commande `!link [platform] [pseudo]` pour lier manuellement.

### Title

Titre attribué à un viewer pour un exploit.

```
Title {
  titleId: int (auto-increment)
  
  // Attribution
  viewerId: int
  titleKey: string (ex: "water_bearer", "forgeron"...)
  titleDisplayName: string (ex: "Le Porteur d'Eau")
  titleIcon: string (emoji ou référence à sprite)
  titleCategory: enum ("primordial", "obscure", "rare", "legendary", "forbidden")
  
  // Contexte
  earnedAtTick: int
  earnedInCycleId: int
  earnedForAction: string (description de l'action qui a valu le titre)
  relatedEntityType: string | null
  relatedEntityId: int | null
  
  // Propriétés
  isPermanent: boolean (certains titres peuvent être perdus au profit d'un meilleur performer)
  isVisible: boolean
  
  // Méta
  rarityScore: float (combien d'autres viewers l'ont gagné)
}
```

### ViewerAction

Historique des actions de viewers (distincte de l'événement global).

```
ViewerAction {
  actionId: int
  
  viewerId: int
  viewerPseudoSnapshot: string (pseudo au moment de l'action — dénormalisé pour préserver le contexte)
  
  cycleId: int
  tickNumber: int
  timestamp: timestamp
  
  commandType: string (ex: "!rain", "!city")
  commandParams: object
  piCost: int
  
  // Résultat
  wasSuccessful: boolean
  failureReason: string | null
  
  // Effet
  resultDescription: string (ex: "a fait pleuvoir sur le continent Nord")
  affectedEntityType: string | null
  affectedEntityId: int | null
  
  // Impact cumulé
  pressureDelta: float
  titleEarned: int | null (titleId si l'action a donné un titre)
}
```

### PIHistory

Journal append-only des deltas de PI d'un viewer. Utilisé pour audit, anti-fraud et affichage historique (voir [chat_integration.md §PIManager](chat_integration.md#système-de-points-dinfluence-pi)).

```
PIHistory {
  entryId: int (auto-increment)
  viewerId: int
  
  // Delta
  delta: int (positif = gain, négatif = dépense)
  reason: string (ex: "presence", "message", "subscribe", "command:!rain")
  
  // Contexte
  balanceAfter: int
  cycleId: int
  tickNumber: int | null
  timestamp: timestamp
  
  // Référence optionnelle à une action
  relatedActionId: int | null (ViewerAction.actionId)
}
```

---

## Entités événementielles

### Event (générique)

Toute chose qui se passe dans le monde est un événement.

```
Event {
  eventId: int
  
  cycleId: int
  tickNumber: int
  timestamp: timestamp
  
  // Catégorie
  category: enum ("chat_action", "natural", "emergent", "historical", "apocalypse", "meta")
  eventType: string (plus spécifique)
  severity: enum ("trivial", "minor", "notable", "major", "catastrophic")
  
  // Acteurs
  actorType: enum ("viewer", "nature", "rng", "system")
  actorId: int | null (viewerId, speciesId, etc.)
  actorSnapshot: string (nom au moment de l'événement)
  
  // Cibles
  targetType: string | null
  targetId: int | null
  targetSnapshot: string | null
  
  // Description
  description: string (texte généré, narrativement agréable)
  technicalDescription: string (pour debug)
  
  // Données
  data: object (JSON avec détails spécifiques)
  
  // Relations
  causedByEventId: int | null (si cet événement a été causé par un autre)
  consequencesEventIds: [int]
  
  // Visibilité
  wasDisplayedOnStream: boolean
  displayedAt: timestamp | null
  
  // Persistance
  isInHistoryLog: boolean
  isPartOfMyth: boolean
}
```

### Apocalypse

Événement catastrophique marquant la fin d'un cycle.

```
Apocalypse {
  apocalypseId: int
  
  cycleId: int (cycle terminé)
  
  type: enum ("celestial_impact", "ash_winter", "greenhouse", "great_plague", "singularity", "final_deluge", "contact", "inner_collapse", "oblivion")
  typeName: string (nom narratif, ex: "L'Hiver des Cendres")
  
  // Timing
  startedAtTick: int
  endedAtTick: int
  
  // Cause
  triggeredBy: enum ("pressure", "commands", "random", "forced")
  triggeringViewerIds: [int] (si causée par actions de viewers)
  triggeringEventId: int | null
  
  // Phases
  phases: [
    {
      phase: enum ("premise", "trigger", "devastation", "cessation"),
      startedAtTick: int,
      endedAtTick: int | null,
      keyEvents: [int] (eventIds)
    }
  ]
  
  // Statistiques
  populationBefore: bigint
  populationAfter: bigint
  speciesExtinct: int
  citiesDestroyed: int
  civilizationsCollapsed: int
  
  // Survivants
  survivingSpeciesIds: [int]
  survivingCivilizationIds: [int]
  
  // Lore
  narrativeSummary: string
  lastWordsOfCivilizations: [string]
}
```

---

## Entités méta

### Artifact

Objets persistants traversant les cycles (Obélisque, Livre Brûlé...).

```
Artifact {
  artifactId: int
  
  name: string (ex: "L'Obélisque Sans Origine")
  type: enum ("monument", "text", "object", "creature", "location")
  
  // Origine (mystérieuse pour les viewers, connue du système)
  firstAppearedInCycleId: int
  trueOrigin: string | null (secret du système)
  
  // Persistance
  appearsInCycleIds: [int]
  probabilityToAppear: float [0, 1]
  
  // État dans le cycle actuel
  isPresentInCurrentCycle: boolean
  currentLocationRegionId: int | null
  currentCoordinates: { lat: float, lng: float } | null
  
  // Propriétés
  isIndestructible: boolean
  interactsWithEntities: [string]
  
  // Lore
  description: string
  mythologicalSignificance: string
  interpretationsByCivilizations: [
    {
      civilizationId: int,
      interpretation: string,
      belief: string
    }
  ]
  
  // Effets
  specialEffects: [string]
}
```

### Myth

Mythe émergent d'une civilisation.

```
Myth {
  mythId: int
  
  cycleId: int
  originCivilizationId: int | null
  
  // Identité
  name: string
  archetype: enum ("creation", "hero_journey", "flood", "first_fire", "prophecy", "fall"...)
  
  // Origine
  createdAtTick: int
  inspiredByEvents: [int] (eventIds qui ont inspiré le mythe)
  inspiredByViewers: [int] (viewerIds qui sont des figures mythiques)
  
  // Contenu
  narrative: string (le texte du mythe)
  characters: [
    {
      name: string,
      role: string,
      basedOnViewerId: int | null
    }
  ]
  
  // Transmission
  believedByCivilizationIds: [int]
  variationsAcrossCultures: [
    {
      civilizationId: int,
      localVariant: string
    }
  ]
  
  // Persistance
  persistsAcrossCycles: boolean
  appearsInCycleIds: [int]
  
  // État
  isActive: boolean (croyance vivante dans le cycle actuel)
}
```

### LoreEntry

Entrée du Grand Registre — texte narratif consultable.

```
LoreEntry {
  loreEntryId: int
  
  // Catégorisation
  category: enum ("age_description", "civilization_history", "species_profile", "viewer_profile", "cycle_summary", "event_narrative", "myth", "artifact_lore")
  
  // Liens
  relatedEntityType: string | null
  relatedEntityId: int | null
  relatedCycleId: int | null
  
  // Contenu
  title: string
  content: string (markdown ou plain text)
  tags: [string]
  
  // Méta
  createdAtTick: int | null
  createdAt: timestamp
  lastUpdatedAt: timestamp
  
  // Visibilité
  isPublic: boolean (consultable par les viewers via !lore)
  language: string
  
  // Auto-généré ou manuel
  isAutoGenerated: boolean
}
```

### Language

Langue générée procéduralement pour les civilisations.

```
Language {
  languageId: int
  
  name: string (ex: "Tomsgxien")
  originCivilizationId: int
  
  // Caractéristiques procédurales
  phonemes: [string]
  commonPrefixes: [string]
  commonSuffixes: [string]
  rootWords: [string]
  grammarRules: object
  
  // Généalogie linguistique
  parentLanguageId: int | null
  childrenLanguageIds: [int]
  
  // Usage
  speakerCount: bigint
  civilizationIds: [int]
  
  // État
  isExtinct: boolean
  extinctAtTick: int | null
}
```

---

## Relations et index

### Diagramme de relations clés

```
Viewer (1) ────────< (N) Title
Viewer (1) ────────< (N) ViewerAction
Viewer (1) ────────< (N) Species.founderViewerId
Viewer (1) ────────< (N) City.founderViewerId
Viewer (1) ────────< (N) Religion.founderViewerId

Cycle (1) ────────< (N) Species
Cycle (1) ────────< (N) Civilization
Cycle (1) ────────< (N) Event
Cycle (1) ────────── (1) Apocalypse

Species (1) ──< (N) Species (parent/children)
Species (1) ──< (N) Tribe (evolved from)

Tribe (1) ──── (1) Civilization (evolved into)

Civilization (1) ──< (N) City
Civilization (1) ──< (N) Religion (dominantReligionIds)
Civilization (N) ──< (N) Civilization (enemies, allies)

City (1) ──────── (1) Dynasty
City (1) ──< (N) Building

Religion (1) ──< (N) Religion (schisms)
```

### Index critiques pour les performances

**Index sur Event** (table à forte volumétrie) :

- `(cycleId, tickNumber)` — pour le replay chronologique
- `(eventType)` — pour filtrer par type
- `(actorId, actorType)` — pour l'historique d'un viewer
- `(severity, tickNumber)` — pour retrouver les gros événements

**Index sur ViewerAction** :

- `(viewerId, timestamp)` — historique personnel
- `(cycleId, tickNumber)` — ordre chronologique
- `(commandType)` — stats par commande

**Index sur Species / City / Civilization** :

- `(cycleId, isAlive)` — entités actives
- `(founderViewerId)` — entités créées par un viewer
- `(parentSpeciesId)` — phylogénie

**Index sur Viewer** :

- `(pseudo)` unique — recherche par pseudo
- `(platformId, platform)` unique — lien avec la plateforme
- `(lastActionAt)` — viewers récemment actifs

### Contraintes d'intégrité

**Suppressions** :

- Aucune suppression d'entités. Les entités "détruites" ont juste `isAlive/isActive = false` et `destroyedAtTick`.
- Exception : données techniques (caches, ticks > 1000 anciens qui ne sont pas snapshots).

**Références orphelines** :

- Autorisées volontairement. Si un `parentSpeciesId` pointe vers une espèce "détruite", c'est normal et voulu.

**Unicité** :

- Un viewer ne peut pas avoir deux fois le même titre "permanent unique" (ex: "Le Premier d'un cycle")
- Un pseudo + plateforme est unique
- Un ID d'entité est unique globalement

---

## Requêtes types

### Pour le HUD en temps réel

```
-- État actuel de la planète
SELECT * FROM PlanetState WHERE planetStateId = 'current';

-- Top 5 espèces les plus populeuses
SELECT * FROM Species 
WHERE cycleId = [current] AND isAlive = true
ORDER BY population DESC LIMIT 5;

-- Derniers 10 événements majeurs
SELECT * FROM Event
WHERE cycleId = [current] 
AND severity IN ('major', 'catastrophic')
ORDER BY tickNumber DESC LIMIT 10;
```

### Pour le Grand Registre / Wiki

```
-- Toutes les cités fondées par un viewer
SELECT * FROM City
WHERE founderViewerId = [viewerId]
ORDER BY foundedAtTick;

-- Arbre phylogénétique d'une espèce
WITH RECURSIVE species_tree AS (
  SELECT * FROM Species WHERE speciesId = [root]
  UNION ALL
  SELECT s.* FROM Species s
  JOIN species_tree st ON s.parentSpeciesId = st.speciesId
)
SELECT * FROM species_tree;

-- Histoire complète d'une civilisation
SELECT * FROM Event
WHERE (targetType = 'Civilization' AND targetId = [civId])
   OR (actorType = 'Civilization' AND actorId = [civId])
ORDER BY tickNumber;
```

### Pour les statistiques de viewers

```
-- Classement des viewers par nombre de titres
SELECT v.pseudo, COUNT(t.titleId) as titleCount
FROM Viewer v
LEFT JOIN Title t ON t.viewerId = v.viewerId
GROUP BY v.viewerId
ORDER BY titleCount DESC
LIMIT 50;

-- Profil complet d'un viewer
SELECT 
  v.*,
  (SELECT COUNT(*) FROM Title WHERE viewerId = v.viewerId) as totalTitles,
  (SELECT COUNT(*) FROM ViewerAction WHERE viewerId = v.viewerId) as totalActions,
  (SELECT COUNT(*) FROM Species WHERE founderViewerId = v.viewerId) as speciesCreated,
  (SELECT COUNT(*) FROM City WHERE founderViewerId = v.viewerId) as citiesFounded
FROM Viewer v
WHERE v.viewerId = [id];
```

### Pour le moteur de simulation

```
-- Espèces actives à faire évoluer ce tick
SELECT * FROM Species
WHERE cycleId = [current] AND isAlive = true;

-- Cités qui risquent la rébellion
SELECT * FROM City
WHERE happiness < 0.3 AND isActive = true;

-- Mise à jour de la pression
UPDATE PlanetState
SET pressure = pressure + [delta]
WHERE planetStateId = 'current';
```

### Pour les analyses long-terme

```
-- Durée moyenne de chaque âge sur tous les cycles
SELECT 
  ageKey,
  AVG(durationTicks) as avgDuration
FROM AgeHistoryLog
GROUP BY ageKey;

-- Type d'apocalypse le plus fréquent
SELECT type, COUNT(*) as freq
FROM Apocalypse
GROUP BY type
ORDER BY freq DESC;

-- Viewers présents dans le plus de cycles (récurrence)
SELECT pseudo, ARRAY_LENGTH(cyclesPresent) as cycleCount
FROM Viewer
ORDER BY cycleCount DESC
LIMIT 20;
```

---

## Migrations et versioning

### Versioning du schéma

Chaque modification du modèle de données doit être **versionnée**.

```
schema_version {
  version: int (1, 2, 3...)
  appliedAt: timestamp
  description: string
  migrationScript: string
}
```

### Règles de migration

**1. Ajouts OK, suppressions NON**
On peut ajouter des champs/tables, mais on ne supprime jamais de champs existants (ils peuvent être marqués `deprecated` mais restent).

**2. Valeurs par défaut obligatoires**
Tout nouveau champ doit avoir une valeur par défaut pour les anciennes données.

**3. Backward compatibility**
Le moteur doit pouvoir lire les données des schémas précédents (au moins les 3 dernières versions).

**4. Forward compatibility ATTENDUE**
Un moteur ancien peut ignorer les champs inconnus sans crasher.

### Stratégie de migration

```
1. Détecter la version du schéma actuel
2. Identifier les migrations à appliquer
3. Pour chaque migration :
   a. Backup complet avant application
   b. Appliquer la migration
   c. Vérifier l'intégrité
   d. Marquer la version comme appliquée
4. Valider que le moteur démarre correctement
```

---

## Exports et API

### Export narratif (pour le wiki public)

Chaque fin de cycle génère automatiquement :

```
Export par cycle {
  cycleSummary.md       - Récap narratif complet
  viewerHighlights.md   - Viewers marquants du cycle
  timeline.md           - Événements majeurs chronologiques
  bestiary.md           - Toutes les espèces créées
  civilizationHistory.md - Histoire des civilisations
  apocalypseChronicle.md - Détails de l'apocalypse
  lorebook.md           - Mythes et légendes nés
}
```

### API publique (pour les viewers curieux)

Endpoints REST simples :

```
GET /api/planet/current
  → état actuel

GET /api/cycles
  → liste de tous les cycles

GET /api/cycle/:id
  → détails d'un cycle

GET /api/viewer/:pseudo
  → profil public d'un viewer

GET /api/viewer/:pseudo/entities
  → entités créées par ce viewer

GET /api/species/:id
  → profil d'une espèce + arbre phylogénétique

GET /api/civilization/:id
  → histoire d'une civilisation

GET /api/events?cycleId=X&severity=major
  → événements filtrés

GET /api/titles/leaderboard
  → classement des viewers par titres

GET /api/lore/search?q=...
  → recherche dans le Grand Registre
```

### Export brut (pour archivage)

À la fin de chaque cycle, export JSON complet :

```
cycle_XXX_complete.json {
  cycleMetadata: {...},
  planetStateHistory: [...snapshots tous les 1000 ticks],
  allEntities: {
    species: [...],
    cities: [...],
    civilizations: [...],
    ...
  },
  allEvents: [...],
  allActions: [...],
  apocalypseDetails: {...}
}
```

Compressé en gzip, peut faire 100 MB - 1 GB par cycle.

### Streaming de données en direct

Pour permettre des visualisations externes ou un dashboard en temps réel :

```
WebSocket /ws/live
  → stream de TOUS les événements en temps réel
  → format JSON : { type, data, timestamp }
  → permet à des outils tiers de se connecter
```

---

## ✨ Conclusion

Ce modèle de données est **la colonne vertébrale** de Genesis Live. Tout le reste — le moteur, l'UI, le narratif — en dépend.

### Principes à ne jamais violer

1. **Rien n'est perdu** : pas de suppression destructive
2. **Attribution permanente** : chaque création reste liée à son créateur
3. **Versioning strict** : pas de casse arrière des données existantes
4. **Intégrité des relations** : références toujours valides (même si pointant vers des entités "mortes")

### Principes à faire évoluer avec prudence

1. **Structure des entités** : ajouts OK, suppressions interdites
2. **Schémas d'événements** : garder retro-compatibilité
3. **Formats d'export** : permettre le chargement de formats anciens

### Évolutions futures envisageables

- Système de "saisons" (méta-cycle traversant plusieurs cycles)
- Relations inter-planétaires (si jamais multivers)
- Gestion de "joueurs" distincts (équipes de viewers)
- NFTs d'entités (si ça fait sens un jour 😄)

### Volume de données à anticiper

Pour un stream qui tourne **1 an** (1 à 2 cycles complets au rythme nominal 6-12 mois) :

- 1 à 20 millions d'entités créées (selon la complexité du cycle et la durée réelle)
- 3 à 60 millions d'événements
- 3 à 50 GB de données compressées (HistoryLog inclus)
- 1 à 2 snapshots de fin de cycle (permanents) + snapshots intra-cycle (rotation continue)

Sur **3 ans** (~3-6 cycles) : prévoir 10-150 GB archivés. La compression et la rotation sont indispensables dès le premier cycle, pas optionnelles.

---

*Document de référence technique — v1.0*
*À mettre à jour à chaque modification du schéma. Documenter chaque migration.*
