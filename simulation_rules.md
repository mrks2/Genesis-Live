# ⚙️ GENESIS LIVE — Règles de simulation

*Le cœur logique du moteur : comment le monde évolue, comment les paramètres interagissent, comment le hasard et les actions du chat se combinent.*

---

## 📖 Table des matières

1. [Philosophie du moteur](#philosophie-du-moteur)
2. [Boucle de simulation](#boucle-de-simulation)
3. [État global de la planète](#état-global-de-la-planète)
4. [Système de ticks et de temps](#système-de-ticks-et-de-temps)
5. [Règles de progression entre âges](#règles-de-progression-entre-âges)
6. [Système de Pression](#système-de-pression)
7. [Moteur d'aléatoire](#moteur-daléatoire)
8. [Règles par âge](#règles-par-âge)
9. [Règles d'apocalypse](#règles-dapocalypse)
10. [Règles de renaissance](#règles-de-renaissance)
11. [Règles d'évolution et mutation](#règles-dévolution-et-mutation)
12. [Règles d'attribution de titres](#règles-dattribution-de-titres)
13. [Règles de persistance](#règles-de-persistance)
14. [Équilibrage et tuning](#équilibrage-et-tuning)

---

## Philosophie du moteur

### Les trois principes fondamentaux

**1. Déterminisme avec seed**
La simulation est **déterministe** : mêmes entrées (état + commandes + seed RNG) → mêmes sorties. Cela permet le replay, le debug, et la reproductibilité. L'aléatoire est un PRNG seedé, jamais `Math.random()`.

**2. Émergence, pas scripting**
Aucune narration n'est écrite à l'avance. Les événements émergent de l'interaction entre règles simples. Une guerre n'est pas scriptée : elle survient quand deux civilisations satisfont les conditions.

**3. Conservation de l'histoire**
Rien n'est jamais perdu. Chaque événement, chaque mort, chaque naissance est consigné dans le **HistoryLog**. Les supprimés de la réalité physique survivent dans les archives.

### Les trois forces en action

Chaque tick, trois forces modifient le monde :

| Force | Origine | Poids |
|-------|---------|-------|
| **Chat** (VOX) | Commandes des viewers | ~40% |
| **Aléatoire** (KHRON) | PRNG seedé, événements naturels | ~30% |
| **Inertie** (SOL) | Conséquences des états passés | ~30% |

Ces poids ne sont pas absolus — ils varient selon la Pression, l'âge, et la saturation du chat.

---

## Boucle de simulation

### Structure du tick

Chaque tick de simulation exécute les phases suivantes **dans l'ordre** :

```
┌─────────────────────────────────────────┐
│ PHASE 1 : Ingestion des événements      │
│  - Traite la queue des commandes chat   │
│  - Applique les rate limits             │
│  - Valide et enregistre les actions     │
├─────────────────────────────────────────┤
│ PHASE 2 : Mise à jour des entités       │
│  - Évolution des espèces                │
│  - Naissance/mort, reproduction         │
│  - Mouvements, migrations               │
├─────────────────────────────────────────┤
│ PHASE 3 : Physique & environnement      │
│  - Climat, température, atmosphère      │
│  - Tectonique, érosion                  │
│  - Cycles (jour/nuit, saisons)          │
├─────────────────────────────────────────┤
│ PHASE 4 : Événements aléatoires         │
│  - Tirage selon la Pression             │
│  - Événements naturels                  │
│  - Mutations spontanées                 │
├─────────────────────────────────────────┤
│ PHASE 5 : Détection de transitions      │
│  - Passage d'âge ?                      │
│  - Conditions d'apocalypse ?            │
│  - Nouveau titre à attribuer ?          │
├─────────────────────────────────────────┤
│ PHASE 6 : Journalisation                │
│  - Écriture dans HistoryLog             │
│  - Mise à jour des stats globales       │
│  - Génération de narration              │
├─────────────────────────────────────────┤
│ PHASE 7 : Snapshot (si applicable)      │
│  - Sauvegarde périodique                │
│  - Backup rotatif                       │
└─────────────────────────────────────────┘
```

### Ordre important

L'ordre des phases **garantit la cohérence** :
- Les commandes du chat sont appliquées **avant** l'évolution naturelle (le viewer influence, puis la nature réagit)
- Les événements aléatoires viennent **après** les commandes (le hasard s'ajuste au nouveau contexte)
- Les transitions d'âge sont détectées **en fin de tick** pour éviter les états intermédiaires

### Garanties de performance

- **Durée maximale d'un tick** : 100ms (objectif), 500ms (hard cap)
- **Si un tick dépasse 500ms** : log warning, skip la phase suivante si possible
- **Si 3 ticks consécutifs dépassent 500ms** : réduction automatique de la complexité (moins d'entités simulées individuellement, plus de traitement par groupe)

---

## État global de la planète

### Structure de l'état

L'état complet de la planète à un instant T :

```javascript
// Vue simplifiée — schéma complet dans data_model.md §PlanetState
PlanetState {
  // Méta
  cycleId: int,                // référence au Cycle actif
  tickCount: int,              // nombre de ticks depuis le début du cycle
  currentAge: enum,            // âge actuel ("I" à "VII")
  ageProgress: float,          // [0, 1] progression vers l'âge suivant
  currentPlanetName: string,   // nom donné par la civilisation dominante
  
  // Climat
  temperature: float,          // en Celsius, base 15°C pour Âge IV
  waterCoverage: float,        // [0, 1] proportion d'eau
  oxygenLevel: float,          // [0, 1]
  co2Level: float,             // [0, 1]
  radiation: float,            // [0, 1] radioactivité
  pollution: float,            // [0, 1] pollution générique
  
  // Biosphère
  biomass: float,              // masse totale de vie
  biodiversity: int,           // nombre d'espèces
  averageComplexity: float,    // complexité moyenne des espèces
  
  // Civilisation
  populationTotal: int,
  techLevel: int,              // 0 à 10 (de préhistoire à spatial avancé)
  culturalComplexity: float,
  numCivilizations: int,
  numCities: int,
  numReligions: int,
  
  // Dynamique
  pressure: float,             // [0, 1] jauge de Pression (voir section dédiée)
  stability: float,            // [0, 1] stabilité générale
  
  // Seed RNG
  rngSeed: int,                // seed actuel du PRNG
  rngState: object             // état sérialisé du PRNG
}
```

### Paramètres vitaux (les 5 principaux)

Ces 5 paramètres sont les plus surveillés par le moteur :

| Paramètre | Plage typique | Commentaire |
|-----------|---------------|-------------|
| **Temperature** | -100°C à +500°C | Âge I: ~1000°C, Âge IV: ~15°C |
| **Water coverage** | 0% à 100% | Âge II+: min 30% pour vie |
| **Oxygen** | 0% à 35% | Âge III+: crucial pour vie complexe |
| **Population** | 0 à 10 milliards | Âges V+ |
| **Tech level** | 0 à 10 | Âges VI+ |

### Valeurs seuils critiques

```
température > 100°C (Âge ≥ II) → évaporation des océans, risque apocalypse
oxygène < 10% (Âge ≥ IV) → extinction massive
radiation > 0.7 → mutations intenses + mortalité
biodiversité < 5 (Âge ≥ IV) → fragilité critique
pressure > 0.9 → événement majeur imminent
```

---

## Système de ticks et de temps

### Durée d'un tick

Un tick a toujours la **même durée en temps réel** (par exemple 2 secondes), mais représente une durée différente en temps-monde selon l'âge :

| Âge | 1 tick = | Justification |
|-----|----------|---------------|
| I — Feu | ~1 000 000 ans | Processus géologiques énormes |
| II — Eaux | ~100 000 ans | Tectonique, pluies |
| III — Germes | ~10 000 ans | Évolution microbienne |
| IV — Grouillement | ~1 000 ans | Évolution complexe |
| V — Étincelles | ~100 ans | Développement tribal |
| VI — Cités | ~10 ans | Événements civilisationnels |
| VII — Vide | ~1 an | Histoire humaine rapide |

### Échelle affichée

Le HUD affiche un compteur "âge de la planète" converti en **années simulées** pour l'immersion narrative :
```
Cycle 1, Âge IV — 1 248 000 000 ans depuis la formation
```

### Durée cible de chaque âge (en temps réel)

Pour un stream 24/7, chaque cycle complet doit durer **6 à 12 mois réels** (180-365 jours). L'Âge VI (Cités) représente environ la moitié du cycle — c'est le cœur narratif.

| Âge | Durée cible (temps réel) | Nombre de ticks (tick = 2s) |
|-----|--------------------------|------------------------------|
| I — Feu | 3-6 jours | ~130 000 à 260 000 |
| II — Eaux | 6-12 jours | ~260 000 à 520 000 |
| III — Germes | 12-24 jours | ~520 000 à 1 040 000 |
| IV — Grouillement | 30-60 jours | ~1 300 000 à 2 600 000 |
| V — Étincelles | 24-48 jours | ~1 040 000 à 2 080 000 |
| VI — Cités | 90-180 jours | ~3 900 000 à 7 780 000 |
| VII — Vide | 15-35 jours | ~650 000 à 1 510 000 |
| **Total** | **180-365 jours (6-12 mois)** | **~7 800 000 à 15 800 000** |

### Vitesse adaptative

Le moteur peut **ralentir ou accélérer** en fonction de l'activité :
- **Chat actif** (>100 messages/minute) : vitesse normale (×1)
- **Chat calme** (<10 messages/minute) : accélération modérée (×1.5) pour éviter les temps morts
- **Événement majeur** en cours : ralentissement (×0.5) pour permettre aux viewers de réagir

### Modes de vitesse explicites

En plus du mode nominal (×1), le moteur supporte deux modes alternatifs déclenchables via `!speed` (admin) ou config :

| Mode | Multiplicateur | Usage |
|------|----------------|-------|
| **Nominal** | ×1 | Stream public, cycle 6-12 mois (180-365 jours) |
| **Accéléré** | ×30 à ×50 | Soft launch, tests publics, demo 4-12 jours |
| **Dev/Test** | ×100 à ×200 | Tests internes, validation bout en bout en quelques heures |

**Important** : la variation de vitesse affecte la durée réelle des âges mais PAS les probabilités d'événements par tick (pour préserver la densité narrative). Un cycle accéléré ×30 dure ~6-12 jours réels mais voit le même nombre d'événements qu'un cycle nominal de 6-12 mois.

---

## Règles de progression entre âges

### Conditions de passage

Chaque transition d'âge a des **conditions à remplir**. Tant qu'elles ne sont pas toutes satisfaites, l'âge continue.

### Âge I → Âge II : Refroidissement

**Conditions** :
- Température moyenne ≤ 100°C
- Eau liquide présente ≥ 5% de la surface
- Croûte solidifiée ≥ 80%

**Comment accélérer** :
- `!cool`, `!rain`, `!comet` (ajoute de l'eau froide)
- Impacts de comètes glacées aléatoires

**Comment ralentir** :
- `!heat`, `!volcano` (réchauffe)
- Impacts de météorites (chaleur de friction)

### Âge II → Âge III : Apparition de la vie

**Conditions** :
- Eau liquide ≥ 30% de la surface
- Température entre 0°C et 60°C
- Molécules organiques accumulées (via foudre + volcanisme)
- Minimum 1000 ticks écoulés dans l'âge II (garantit temps de développement)

**Paramètre caché : Complexité Organique**
Commence à 0, augmente de 0.001 à 0.1 par tick selon les conditions. Quand il atteint 1.0, la vie émerge.
- Accumulation accélérée par : `!lightning`, `!volcano` (cheminées hydrothermales)
- Accumulation ralentie par : température instable, pollution excessive

### Âge III → Âge IV : Multicellularité

**Conditions** :
- Biodiversité ≥ 10 souches distinctes
- Au moins une souche eucaryote (apparue par `!merge` ou aléatoire)
- Oxygène atmosphérique ≥ 10%
- Au moins 5 événements `!complex` ou équivalents

**Paramètre caché : Complexité Biologique**
Augmente quand :
- Une souche atteint une population critique
- Deux souches coexistent sans se détruire
- Une mutation majeure réussit

### Âge IV → Âge V : Intelligence

**Conditions** :
- Au moins une espèce avec trait "social" et "outil-capable"
- Environnement stable depuis 5000+ ticks
- Cerveau simulé : taille corporelle / cerveau < seuil
- Déclenchement de `!intelligence` réussi OU 20+ tentatives accumulées

**Processus** :
1. Une espèce accumule des traits "pro-intelligence" (mains/pattes préhensiles, vie sociale, régime omnivore)
2. `!intelligence` augmente la probabilité d'éveil
3. Éveil déclenché → transition d'âge

### Âge V → Âge VI : Civilisation

**Conditions** :
- Au moins 3 tribus avec feu, langage, et outils
- Une tribu avec agriculture (déclenchée par `!farm`)
- Population totale ≥ 10 000

### Âge VI → Âge VII : Spatial

**Conditions** :
- Tech level ≥ 8 (post-industriel)
- Population globale ≥ 1 milliard
- Une civilisation avec `!launch` réussi

### Transitions "retour en arrière"

**Peut-on régresser ?** : Oui, en cas de mini-apocalypse.
- Âge VI → V : effondrement civilisationnel (guerre massive, pandémie, pas assez pour apocalypse totale)
- Âge VII → VI : chute technologique (singularity évitée, retour à civilisation classique)

Ces retours sont **rares** (< 5% des cycles) mais enrichissent la narration.

---

## Système de Pression

### Définition

La **Pression** est une jauge globale [0, 1] qui représente l'accumulation de tensions dans le monde. Elle influence la probabilité d'événements majeurs.

### Évolution de la Pression

**Augmente par** :
- Chaque commande chat : +0.001 à +0.05 selon son importance
- Chaque événement majeur évité : +0.02
- Déséquilibres (température extrême, surpopulation, etc.) : +0.005 par tick
- Temps qui passe sans événement : +0.0001 par tick

**Diminue par** :
- Événement majeur déclenché : -0.3 à -0.8
- Commandes stabilisatrices (`!peace`, `!terraform`) : -0.01 à -0.1
- Périodes de paix : -0.0005 par tick

### Effets selon le niveau

```
0.0 - 0.3  [VERT]    Calme, événements rares
0.3 - 0.6  [JAUNE]   Tension normale, événements modérés
0.6 - 0.8  [ORANGE]  Tension élevée, événements majeurs plus probables
0.8 - 0.95 [ROUGE]   Tension critique, événements garantis bientôt
0.95 - 1.0 [NOIR]    Surchauffe : apocalypse imminente
```

### Calcul de probabilité d'événement

À chaque tick, probabilité qu'un événement majeur se déclenche :

```
P(événement) = base_chance × pression × age_multiplier × activity_factor

où :
  base_chance = 0.001 (0.1% par tick)
  pression = valeur actuelle [0, 1]
  age_multiplier = 1.0 pour Âge I-III, 1.5 pour IV-V, 2.0 pour VI-VII
  activity_factor = 1 + (chat_actions_last_100_ticks / 1000)
```

### Événements proportionnels à la Pression

| Pression | Type d'événement déclenché |
|----------|----------------------------|
| 0.0 - 0.3 | Événements mineurs (pluie locale, petite éruption) |
| 0.3 - 0.6 | Événements moyens (orage, mutation notable, conflit mineur) |
| 0.6 - 0.8 | Événements majeurs (guerre, pandémie, catastrophe) |
| 0.8 - 1.0 | Événements catastrophiques (apocalypses, extinctions) |

---

## Moteur d'aléatoire

### PRNG seedé

**Algorithme** : Mulberry32 ou similaire (rapide, reproductible, qualité suffisante)

**Initialisation** :
```
seed initial = hash(startTimestamp + cycleNumber)
```

**Utilisation** :
```javascript
function random() {
  // retourne un float [0, 1[ déterministe
}
```

**Règle stricte** : jamais utiliser `Math.random()` dans la simulation. Toujours passer par le PRNG seedé.

### Catégories d'événements aléatoires

**1. Événements naturels passifs**
Tirés à chaque tick selon des probabilités fixes.

| Événement | Probabilité/tick | Âge |
|-----------|-------------------|-----|
| Micro-météorite | 0.1% | I-II |
| Éruption mineure | 0.05% | I-VII |
| Pluie spontanée | 0.5% | II+ |
| Mutation aléatoire | 0.02% par espèce | III+ |
| Conflit tribal | 0.01% | V |
| Découverte scientifique | 0.005% | VI |

**2. Événements dépendants de la Pression**
Tirés uniquement quand `pressure > 0.5`. Probabilité augmente avec la pression.

**3. Événements rares et légendaires**
Très faibles probabilités, mais existent. Créent les moments mémorables.

| Événement | Probabilité/tick |
|-----------|-------------------|
| Créature impossible | 0.0001% par tick (Âge IV+) |
| Découverte de ruines du cycle précédent | 0.001% (Âge VI+) |
| Signal du Vide Noir | 0.0001% (Âge VII) |
| Alignement cosmique | 0.00001% |

### Drift génétique et culturel

**Règle du Drift** : à chaque tick, chaque entité a une chance de muter légèrement sans intervention extérieure.

**Espèces** :
- 0.001% chance par tick d'une mutation aléatoire (trait modifié)
- Le nom de l'espèce dérive sur plusieurs générations : "TomSgx" → "Tomsigi" → "Tomsi" → "Tomsei"
- Règle de dérivation : remplacer/ajouter/supprimer 1 caractère tous les N ticks

**Civilisations** :
- Langue dérive (noms de villes et de personnages se modifient)
- Religions évoluent (schismes, syncrétismes)
- Traditions apparaissent et disparaissent

### Les "Tirages des Destinées"

À des moments-clés (transition d'âge, naissance d'empire), le moteur fait un **Tirage des Destinées** : un tirage aléatoire majeur qui détermine la "personnalité" de la nouvelle ère.

Exemple pour une nouvelle civilisation :
```
trait_principal = random_pick([
  "belliqueuse", "pacifique", "mystique",
  "commerciale", "scientifique", "artistique"
])
longevité_destinée = random_range(1000, 50000) ticks
destin_final = random_pick([
  "expansion", "effondrement", "transformation",
  "isolement", "conquête"
])
```

Ces destins ne sont **pas déterministes** : ils augmentent juste les probabilités. Une civilisation "belliqueuse" entre plus facilement en guerre, mais ne le fait pas automatiquement.

---

## Règles par âge

### Âge I — Feu : règles spécifiques

**Paramètres surveillés** :
- Température (descend progressivement)
- Masse accumulée (augmente via impacts)
- Solidification de la croûte

**Processus passifs par tick** :
- Température : -0.05°C à -0.2°C (selon activité volcanique)
- Solidification : +0.01% à +0.1%
- Chance d'impact météorite aléatoire : 0.5%

**Événements spéciaux** :
- **La Première Goutte** : déclenchée à T < 100°C + Eau > 0.1%
- **Formation de la Lune** : si un impact géant a lieu (naturel ou via commande)
- **Cristallisation de la croûte** : à solidification ≥ 80%

### Âge II — Eaux : règles spécifiques

**Paramètres surveillés** :
- Couverture d'eau
- Température stabilisée (entre 0 et 60°C)
- Accumulation de molécules organiques

**Processus passifs** :
- Pluie naturelle : +0.01% à +0.05% d'eau par tick
- Tectonique : dérive des continents de 0.1° par tick
- Accumulation organique : +0.0001 à +0.001 par tick

**Événements spéciaux** :
- **Le Silence Bleu** : si couverture d'eau > 95% sans vie, événement contemplatif
- **Formation de supercontinent** : si tectonique ramène tous les continents
- **Premier éclair abiogénique** : pose les bases de la vie

### Âge III — Germes : règles spécifiques

**Entités simulées** : les **souches** (microorganismes)

**Attributs d'une souche** :
```
id, name (pseudo ou dérivé), color, 
population (0 à 10^9),
traits: {
  photosynthèse: bool,
  anaérobie: bool,
  prédateur: bool,
  résistance_chaleur: float,
  résistance_froid: float,
  résistance_toxines: float
},
generation: int,
parent_id: int,
habitat: enum (surface, profondeur, côte...)
```

**Règles de reproduction** :
- Chaque souche double en population tous les 10 ticks si conditions favorables
- Limite de carrying capacity de l'environnement
- Compétition pour les ressources : si 2 souches même habitat, la plus adaptée gagne

**Règles de mutation** :
- 0.01% chance par tick par souche
- Si mutation : création d'une nouvelle souche enfant avec 1-3 traits modifiés
- Nom dérivé du parent : "Alice" → "Alicette", "Alicia"...

**Règles d'extinction** :
- Population < seuil minimum → extinction
- Si environnement change défavorablement → chute de population
- Catastrophes (via commandes ou événements) → extinction immédiate possible

**Règle du Premier Baiser** :
- Probabilité naturelle de fusion : 0.0001% par paire de souches par tick
- `!merge` augmente la probabilité pour un tick spécifique
- Succès → création d'eucaryote ancestral, débloque la complexité

### Âge IV — Grouillement : règles spécifiques

**Entités simulées** : les **espèces** (créatures)

**Attributs d'une espèce** :
```
id, name (pseudo), scientific_name (auto-généré),
population, 
traits: {
  size: float (0.01m à 50m),
  aquatic/terrestrial/aerial: bool,
  diet: enum (herbivore, carnivore, omnivore, photosynthèse),
  intelligence: float [0, 1],
  aggressiveness: float,
  reproduction_rate: float,
  lifespan: int (en ticks)
},
biome: string,
predators: [ids],
prey: [ids]
```

**Règles d'évolution** :
- Sélection naturelle : traits adaptés → survie, pas adaptés → déclin
- Radiation adaptative : si niche vacante, une espèce peut s'y adapter
- Speciation : si population isolée géographiquement, devient une nouvelle espèce après N ticks

**Règles de mutation** :
- 0.005% par tick par espèce
- Mutations possibles : changement de taille, régime, habitat, nouveau trait
- Mutation légendaire (0.0001%) : trait impossible (télépathie, silicium...)

**Règles d'extinction** :
- Prédation non durable : si prédateur mange plus qu'il n'y a de proies → crash
- Catastrophe : impact de météorite peut tuer 50-95% des espèces
- Compétition : si deux espèces trop proches écologiquement, la moins adaptée disparaît

### Âge V — Étincelles : règles spécifiques

**Entités simulées** : les **tribus**

**Attributs d'une tribu** :
```
id, name (pseudo fondateur), 
population (20 à 10000),
traits: {
  culture: string,
  technology: [liste de découvertes],
  language: string (auto-généré),
  religion: ID (si existe)
},
location: coordonnées,
relations: {
  allies: [ids],
  enemies: [ids]
}
```

**Règles de développement tribal** :
- Découvertes naturelles : chance faible par tick d'auto-découvrir feu, outils, langage
- Transmission : si deux tribus en paix, elles partagent leurs découvertes sur X ticks
- Croissance : population +0.1% à +1% par tick selon conditions

**Règles de conflit tribal** :
- Probabilité de conflit = f(proximité, ressources, cultures, pression)
- Issue d'un conflit : déterminée par population × technologie × aléatoire
- Conséquences : extinction, fusion, migration

### Âge VI — Cités : règles spécifiques

**Entités simulées** : **cités**, **empires**, **religions**

**Attributs d'une cité** :
```
id, name, founder_pseudo,
population, tech_level,
wealth: float,
culture: float,
military: float,
happiness: float,
relations: {...},
buildings: [...],
history: [...]
```

**Règles de croissance urbaine** :
- Population croît selon : nourriture × bonheur × santé × (1 - guerre)
- Si stagnation longue → rebellion possible
- Si trop grande croissance → crise de ressources

**Règles économiques** :
- Commerce enrichit les deux parties
- Guerre coûte et détruit
- Innovation tech fait progresser l'ensemble de la civilisation

**Règles d'empire** :
- Un empire peut avoir 1-15 cités selon sa puissance
- Rébellion probable si : distance trop grande de la capitale, culture différente, population mécontente
- Succession : dynastie continue tant que pas d'assassinat, coup d'état, ou révolution

**Règles de religion** :
- Une religion se propage via commerce, guerre, migration
- Schisme possible si : différences culturelles entre régions, hérétique charismatique
- Influence sur la société : moralité, guerres saintes, art

### Âge VII — Vide : règles spécifiques

**Nouvelles entités** : **stations**, **colonies**, **IAs**

**Règles de l'âge spatial** :
- Développement tech accéléré (x2 par rapport à Âge VI)
- Risques existentiels amplifiés
- Possibilité d'échapper à l'apocalypse via `!ascension`

**Règles d'IA** :
- `!ai` crée une IA avec paramètres aléatoires
- Chaque tick, l'IA évolue : bienveillante, neutre, hostile
- Si hostile → apocalypse Singularité
- Si bienveillante → booste la civilisation
- Si transcendante → l'IA disparaît en emportant ses créateurs

**Règles du Contact** :
- `!contact` ou événement aléatoire rarissime
- Visiteurs peuvent être : hostiles (apocalypse), indifférents (message mystérieux), bienveillants (don technologique)
- Probabilité d'hostilité augmente avec le niveau de pollution de la planète

---

## Règles d'apocalypse

### Déclenchement

Une apocalypse peut être déclenchée de trois manières :

**1. Seuil de Pression**
- Si `pressure ≥ 0.95` pendant > 100 ticks consécutifs → apocalypse forcée
- Le type d'apocalypse est choisi selon le contexte

**2. Commandes catastrophiques cumulées**
- `!nuke` × 3 dans un même tick window → apocalypse nucléaire garantie
- Combinaisons spécifiques peuvent trigger des apocalypses spécifiques

**3. Événement aléatoire catastrophique**
- Probabilité faible mais non nulle (0.0001% par tick à l'âge VII)
- Augmente si la civilisation est fragile

### Choix du type d'apocalypse

Le moteur choisit selon l'état du monde :

```
si tech_level ≥ 9 et présence IA → probabilité élevée : Singularité
si tech_level ≥ 7 et tensions militaires → probabilité élevée : Hiver des Cendres
si pollution > 0.7 → probabilité élevée : L'Étuve
si pathogène actif récent → probabilité élevée : La Grande Faux
si âge ≥ VII → probabilité possible : Le Contact
sinon → choix aléatoire parmi tous les types compatibles
```

### Phases d'une apocalypse

**Phase 1 — Prémisse (10% de la durée)**
- Signes avant-coureurs
- Population commence à paniquer
- Dirigeants tentent de réagir (possibilité de `!peace`, `!terraform` etc.)

**Phase 2 — Déclenchement (40%)**
- L'événement catastrophique commence
- Effets visibles : températures, mort massive, etc.

**Phase 3 — Dévastation (40%)**
- Effondrement massif
- Populations en chute libre
- Effets secondaires (famines, maladies)

**Phase 4 — Cessation (10%)**
- Fin des effets actifs
- État final consigné
- Transition vers la renaissance

### Durées typiques d'apocalypse

| Apocalypse | Durée en ticks |
|------------|----------------|
| Impact céleste | 1000 - 5000 |
| Hiver des cendres | 10 000 - 50 000 |
| L'Étuve | 50 000+ |
| La Grande Faux | 5 000 - 20 000 |
| Singularité | 500 - 5000 |
| Déluge final | 10 000 - 30 000 |
| Le Contact | 100 - 1000 |
| Effondrement intérieur | 50 000 - 200 000 (lent) |
| L'Oubli | 100 000+ (très lent) |

### Survivants

Aucune apocalypse n'est jamais totale. Toujours :
- **0.001% à 5%** de la biomasse survit
- **Certaines espèces** (les plus résilientes) persistent
- **Certaines ruines** sont préservées
- **Les archives** du lore sont toujours conservées

---

## Règles de renaissance

### Transition entre cycles

Après une apocalypse, la planète entre en **phase de repos** (1000 à 10000 ticks) pendant laquelle rien ne se passe activement, mais les dégâts se stabilisent.

Puis un **nouveau cycle commence** avec ces règles :

### Ce qui est conservé

**À 100%** :
- Le HistoryLog complet
- Les titres des viewers
- Le nom des viewers qui ont interagi (ils peuvent réapparaître)
- Les statistiques globales

**Partiellement** :
- **30-70% des ruines physiques** (selon sévérité de l'apocalypse)
- **1-3 artefacts légendaires** (L'Obélisque, Le Livre Brûlé...)
- **Fossiles** des espèces majeures
- **Débris orbitaux** (si Âge VII atteint)

**Transformés** :
- L'état de la planète (palette de couleurs change, paysage modifié)
- Les "savoirs innés" : les premières tribus du nouveau cycle peuvent "se souvenir" de quelques mythes

### Ce qui est réinitialisé

- Température, pression, atmosphère (selon le type d'apocalypse)
- Toutes les espèces vivantes (sauf éventuels survivants)
- Toutes les civilisations (disparues)
- Les structures actives (sauf ruines)

### Le compteur de cycle

- Incrémenté de 1 à chaque renaissance
- Affiché en permanence
- Influence le lore : plus le numéro est élevé, plus le monde porte de cicatrices

### Probabilités augmentées au fil des cycles

Certains événements deviennent plus probables après plusieurs cycles :

```
cycle 1 :  découverte de ruines précédentes impossible
cycle 2+ : découverte possible (0.001% par tick Âge VI+)
cycle 5+ : apparition d'archéologues-obsédés (culte des anciens)
cycle 10+ : "conscience cyclique" — les civilisations comprennent qu'elles ne sont pas les premières
cycle 20+ : apparition de l'Obélisque garantie
```

---

## Règles d'évolution et mutation

### Le modèle évolutif

Genesis Live utilise un modèle **simplifié** de sélection naturelle :

```
Pour chaque espèce à chaque tick :
  1. Calculer le fitness : f(traits, environnement)
  2. Si fitness > seuil_survie : reproduction possible
  3. Si fitness < seuil_extinction : déclin de population
  4. Possibilité de mutation pour la descendance
  5. Possibilité de spéciation si isolement
```

### Calcul du fitness

```
fitness = base_fitness 
       × adaptation_climat
       × ratio_ressources_disponibles
       × (1 - stress_prédation)
       × bonus_traits_adaptés
```

**Plages** :
- `fitness > 0.7` : prospérité (croissance population)
- `0.3 < fitness < 0.7` : stabilité
- `fitness < 0.3` : déclin
- `fitness < 0.1` : extinction imminente

### Spéciation

Règles pour qu'une population devienne une nouvelle espèce :

1. **Isolement géographique** depuis ≥ 10 000 ticks
2. **OU isolement écologique** (régime alimentaire différent, horaires différents)
3. **Accumulation de mutations** : ≥ 3 traits différents du parent
4. **Taille de population** suffisante (> 1000)

Quand ces conditions sont remplies, la population devient une nouvelle espèce (nouveau nom, nouvelle entrée dans la base).

### Héritage génétique des traits

Quand une nouvelle espèce émerge :
- 70% des traits hérités du parent
- 20% modifiés légèrement
- 10% nouveaux traits aléatoires

**Traits impossibles** (0.01% des mutations) :
- Liste : télépathie, silicium, multi-corps, vol sans ailes, etc.
- Si obtenus : l'espèce devient "légendaire" dans les chroniques

### Évolution culturelle (Âges V+)

Même règles que biologique mais appliquées aux cultures :
- **Dérive culturelle** : pratiques, langues, croyances évoluent par drift
- **Sélection culturelle** : pratiques efficaces se diffusent, inefficaces disparaissent
- **Schismes** : comme la spéciation biologique

---

## Règles d'attribution de titres

### Système de détection

À chaque tick, le moteur vérifie si un viewer a satisfait les conditions d'un titre.

### Titres Primordiaux

**Le Porteur d'Eau** 💧
- Condition : premier viewer à faire pleuvoir pendant l'Âge I du cycle
- Attribution : immédiate, permanent (gagné une fois, gardé à vie)

**Le Forgeron** 🔥
- Condition : avoir déclenché la plus grosse éruption volcanique du cycle
- Attribution : en fin de cycle (réattribuable si record battu)

**La Semeuse** 🌱
- Condition : avoir injecté la souche qui domine la fin de l'Âge III
- Attribution : en fin d'Âge III

**Le Premier Œil** 👁️
- Condition : avoir déclenché `!intelligence` quand cela a réussi
- Attribution : immédiate

**Le Porteur de Flamme** 🔥
- Condition : premier à déclencher `!fire` sur une tribu pré-humaine à l'Âge V
- Attribution : immédiate (un seul par cycle)

**L'Architecte** 🏛️
- Condition : avoir fondé la plus ancienne cité encore debout à la fin du cycle
- Attribution : en fin de cycle

**Le Conquérant** ⚔️
- Condition : avoir mené le plus grand empire (taille × durée)
- Attribution : en fin de cycle

**Le Prophète** 📜
- Condition : avoir fondé la religion la plus répandue (nb de fidèles × durée)
- Attribution : en fin de cycle

**L'Ingénieur-Roi** ⚙️
- Condition : avoir déclenché `!industrial` en premier
- Attribution : immédiate

**L'Astronaute** 🚀
- Condition : avoir réussi `!launch` en premier
- Attribution : immédiate

### Titres Obscurs

**Le Destructeur** ☠️
- Condition : avoir causé la plus grande extinction (nb d'espèces éteintes par une action directe)
- Attribution : à la fin de chaque extinction majeure, puis consolidation en fin de cycle

**Le Traître** 🗡️
- Condition : avoir attaqué sa propre création (cité fondée, espèce injectée, religion fondée)
- Attribution : immédiate

**Le Fossoyeur** ⚰️
- Condition : avoir enterré plus d'espèces qu'il n'en a créé sur le cycle (diff net ≤ -3)
- Attribution : en fin de cycle

**L'Hérésiarque** ⛧
- Condition : avoir provoqué le plus grand schisme religieux (scission d'une religion majeure en ≥ 2 branches)
- Attribution : en fin de cycle

**Le Porteur de Peste** 🦠
- Condition : avoir déclenché la pandémie la plus meurtrière (morts × propagation)
- Attribution : en fin de cycle

**L'Oublieur** 🌫️
- Condition : avoir effacé le plus de savoir (destructions de bibliothèques, autodafés, effondrements culturels via commandes)
- Attribution : en fin de cycle

### Titres Rares

**L'Équilibriste** ⚖️
- Condition : civilisation fondée par le viewer en paix continue pendant 1000+ ticks
- Attribution : immédiate au franchissement du seuil

**Le Renouveau** 🌅
- Condition : avoir permis une transition d'âge sans catastrophe (aucune extinction majeure sur les 500 ticks autour de la bascule)
- Attribution : à la transition d'âge

**L'Ascendant** ✨
- Condition : faire partie de l'équipage d'une Ascension réussie (commande `!ascend` groupée, ≥ 3 viewers)
- Attribution : immédiate

**Le Retourné** 🔄
- Condition : viewer apparu dans 7 cycles consécutifs (identité liée)
- Attribution : automatique à l'entrée dans le 7ᵉ cycle

**L'Oraculaire** 🔮
- Condition : avoir prédit via `!prophecy` une apocalypse qui s'est produite ensuite (match texte ∨ catégorie)
- Attribution : post-apocalypse si match validé

**Le Légendaire** 🌟
- Condition : désigné par la commande `!hero [nom]` à l'Âge V, avec un viewer actif (≥ 20 interactions dans le cycle)
- Attribution : immédiate, le nom est ensuite transmis comme mythe aux cycles suivants
- Persistance inter-cycles : oui (pseudo-lineage)

**L'Empereur** 👑
- Condition : avoir unifié ≥ 3 cités via `!unify` en un empire durable (≥ 500 ticks de stabilité)
- Attribution : 500 ticks après la commande, si l'empire tient

### Titres Interdits (1 par cycle max, jamais deux fois par le même viewer)

**Le Premier**
- Condition : premier viewer à interagir dans le cycle (toute commande payante)
- Attribution : immédiate

**Le Dernier**
- Condition : dernier viewer à agir avant le tick de déclenchement de l'apocalypse
- Attribution : post-apocalypse

**Le Silencieux**
- Condition : viewer présent (vu dans le chat) dans ≥ 80 % des ticks du cycle sans jamais envoyer de commande payante
- Attribution : en fin de cycle

### Conservation des titres

- Les titres sont **permanents** dans le profil du viewer
- Ils s'affichent à côté du pseudo dans tout le stream
- Un viewer peut accumuler plusieurs titres au fil des cycles
- Classement public : top viewers par nombre de titres

---

## Règles de persistance

### Snapshots

**Fréquence** :
- Snapshot rapide : toutes les 100 ticks (en mémoire)
- Snapshot disque : toutes les 1000 ticks
- Snapshot archive : toutes les 10 000 ticks (conservé long terme)

**Contenu d'un snapshot** :
- État complet de la planète
- Seed RNG actuel
- HistoryLog complet
- Méta-données (timestamp, cycle, âge)

### Rotation

**Snapshots conservés** :
- Derniers 10 snapshots disque (pour rollback court terme)
- Dernier snapshot de chaque âge (pour rejouer n'importe quel âge)
- Dernier snapshot de chaque cycle (pour archives historiques)

### Recovery

En cas de crash :
1. Charger le dernier snapshot disque valide
2. Vérifier l'intégrité
3. Reprendre la simulation au tick suivant
4. Log de l'incident dans le HistoryLog

### HistoryLog

**Structure** :
```
Log entry {
  tick: int,
  cycle: int,
  age: string,
  type: enum (action, event, apocalypse, birth, death, etc.),
  actor: string (pseudo ou "nature"),
  target: string (entité affectée),
  description: string (narrative générée),
  data: object (détails techniques)
}
```

**Rétention** :
- Toujours conservé, jamais purgé
- Export possible en JSON, MD, ou visualisation web

---

## Équilibrage et tuning

### Principes d'équilibrage

**1. Variété avant tout**
Un âge qui se termine toujours de la même façon est ennuyeux. L'équilibrage doit garantir que **plusieurs issues sont possibles**.

**2. Les actions doivent avoir du poids**
Si 100 commandes successives n'ont aucun effet visible, les viewers décrochent. Chaque commande doit produire un effet **immédiatement visible** (même petit) ET parfois un effet long terme.

**3. Pas de domination absolue**
Aucun viewer ne doit pouvoir contrôler l'entièreté du monde en solo, même avec beaucoup de PI. Le système doit **encourager la collaboration** implicite.

### Paramètres à ajuster

Liste des paramètres à tuner selon les observations :

| Paramètre | Default | Impact |
|-----------|---------|--------|
| Vitesse de tick | 2s | Rythme général |
| Chaleur initiale | 1000°C | Durée de l'Âge I |
| Refroidissement/tick | -0.1°C | Durée de l'Âge I |
| Seuil de pression pour event majeur | 0.5 | Fréquence des événements |
| Taux de mutation par espèce | 0.005% | Richesse évolutive |
| Taux de spéciation | 0.0001% | Biodiversité |
| Probabilité apocalypse aléatoire (Âge VII) | 0.0001% | Longévité civilisationnelle |
| Coût en PI de la commande la plus chère | 5000 | Accessibilité des commandes max |

### Métriques à surveiller

Pour savoir si la simulation est bien équilibrée :

| Métrique | Cible |
|----------|-------|
| Durée moyenne d'un cycle | 180-365 jours (6-12 mois) |
| Distribution des durées d'âge | proche des cibles |
| Nombre d'apocalypses par type | diversité (pas toujours la même) |
| Ratio viewers actifs / total | > 20% |
| Nombre de titres attribués par cycle | 5-15 |
| Événements majeurs par jour | 3-10 |

### Ajustements typiques

**Problème : "le cycle est trop court"**
→ Augmenter les cooldowns des commandes destructrices, réduire probabilité apocalypse aléatoire

**Problème : "le cycle stagne"**
→ Accélérer les processus passifs, baisser les coûts de commandes de progression

**Problème : "toujours la même apocalypse"**
→ Rééquilibrer les probabilités selon le contexte, ajouter des événements alternatifs

**Problème : "les viewers ne reviennent pas"**
→ Vérifier la fréquence des moments mémorables, améliorer la visibilité des contributions individuelles

### A/B Testing

Pour les ajustements majeurs :
- Faire tourner 2 cycles avec paramètres différents
- Comparer engagement, durée, variété des apocalypses
- Ajuster les paramètres vers la variante la plus réussie

---

## ✨ Conclusion

Ces règles définissent **l'ADN du moteur**, mais elles ne sont pas gravées dans la pierre. L'équilibrage est un processus continu, et l'émergence apportera des surprises que ce document ne peut pas anticiper.

### Principes à ne jamais violer

1. **Déterminisme** : même seed + même inputs = même résultat
2. **Conservation de l'histoire** : jamais perdre un événement consigné
3. **Attribution des actions** : chaque action reste liée à son viewer
4. **Transparence** : les règles doivent être lisibles (même par les viewers s'ils veulent comprendre)

### Principes à ajuster en permanence

1. **Équilibrage numérique** : valeurs, seuils, probabilités
2. **Rythme** : durées d'âges, fréquence d'événements
3. **Variété** : s'assurer qu'aucun pattern ne domine

### Évolution du document

Ce document est **vivant**. À mettre à jour :
- Après chaque session de tuning majeure
- À chaque ajout de règle nouvelle
- Après chaque apocalypse "exceptionnelle" qui révèle un pattern non anticipé

---

*Document de référence technique — v1.0*
*Le cœur logique du monde. Traite-le avec soin.*
