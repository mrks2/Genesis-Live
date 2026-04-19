# 🎵 GENESIS LIVE — Design sonore

*Musique adaptative, SFX, ambiances. Comment l'audio raconte l'histoire en parallèle du visuel.*

---

## 📖 Table des matières

1. [Philosophie du son](#philosophie-du-son)
2. [Architecture audio](#architecture-audio)
3. [Musique adaptative](#musique-adaptative)
4. [Musique par âge](#musique-par-âge)
5. [Musique d'apocalypse](#musique-dapocalypse)
6. [Effets sonores (SFX)](#effets-sonores-sfx)
7. [Ambiances sonores](#ambiances-sonores)
8. [Transitions sonores](#transitions-sonores)
9. [Système de mixage](#système-de-mixage)
10. [Spatialisation et dynamique](#spatialisation-et-dynamique)
11. [Format et qualité](#format-et-qualité)
12. [Production et sourcing](#production-et-sourcing)
13. [Intégration technique](#intégration-technique)
14. [Accessibilité audio](#accessibilité-audio)

---

## Philosophie du son

### Le son raconte ce que le regard manque

Un viewer qui regarde Genesis Live en arrière-plan, pendant qu'il code ou cuisine, doit **ressentir ce qui se passe sans regarder l'écran**. Le son est **la ligne de vie narrative** du stream.

### Les 5 principes du design sonore

**1. Le silence est précieux**
Ne jamais saturer. Les moments calmes rendent les moments forts plus forts. Un SFX qui arrive après 10 secondes de silence ambient frappe 10x plus fort.

**2. L'évolution doit être perceptible**
Un viewer qui arrive doit sentir **quel âge est en cours** rien qu'en écoutant. La musique est un **signifiant d'état** autant qu'une ambiance.

**3. Le chat a une voix**
Chaque action de viewer produit un **micro-son** identifiable. Au fil du stream, le chat devient une mélodie collective.

**4. Ambient > mélodique**
La musique doit pouvoir tourner en boucle **pendant des heures** sans fatiguer. Privilégier les textures ambient, les drones, les progressions lentes — éviter les hooks mélodiques accrocheurs qui saoulent en 30 minutes.

**5. Sensation avant technique**
On ne cherche pas de virtuosité musicale. On cherche à créer **une émotion juste**. Un simple drone bien travaillé vaut mieux qu'une composition complexe mal intégrée.

### Inspirations de référence

**Ambient / atmosphérique** :

- Brian Eno (*Music for Airports*, *Ambient 4: On Land*)
- Stars of the Lid
- Tim Hecker
- William Basinski (*Disintegration Loops*)
- Aphex Twin (*Selected Ambient Works Volume II*)

**Musique de jeux** :

- *Journey* (Austin Wintory) — émotion pure
- *Celeste* (Lena Raine) — évolution atmosphérique
- *Outer Wilds* (Andrew Prahlow) — mélancolie cosmique
- *Subnautica* (Simon Chylinski) — immersion abyssale
- *Oxygen Not Included* — ambiance scientifique douce

**Musique organique** :

- Björk (*Biophilia*)
- Sigur Rós (*Valtari*, *Kveikur*)
- Olafur Arnalds

**Musique tribale / primitive** :

- Dead Can Dance
- Wardruna (pour l'aspect ancestral)
- Musique traditionnelle du monde (pygmées, Tuva...)

**Musique civilisationnelle** :

- Hans Zimmer (*Interstellar*)
- Max Richter (*Waltz with Bashir*)
- Musique classique pour l'âge industriel
- Musique électronique atmosphérique pour l'âge moderne

### Ce que le son n'est PAS

❌ Une playlist chill pour écouter en fond
❌ Un album concept à écouter séparément
❌ Du dubstep pour attirer l'attention
❌ Du chiptune purement rétro
❌ Du silence total (trop inquiétant long terme)

---

## Architecture audio

### Stack technique

**Librairie principale** : **Howler.js**

- API simple, fiable, bien maintenue
- Support cross-browser excellent
- Gestion des fades natifs
- Web Audio API sous le capot
- Pooling de sons automatique

**Alternative considérée** : **Tone.js**

- Plus puissant mais overkill pour Genesis Live
- À envisager si on veut de la génération procédurale de musique

### Organisation du code audio

```
frontend/src/audio/
├── audioManager.ts              # Orchestration globale
├── music/
│   ├── musicPlayer.ts           # Lecteur de musique
│   ├── ageMusicMap.ts           # Mapping âge → piste
│   ├── transitionPlayer.ts      # Gestion transitions
│   └── adaptiveLayerer.ts       # Mixage dynamique de couches
├── sfx/
│   ├── sfxPlayer.ts             # Lecteur d'effets
│   ├── sfxRegistry.ts           # Catalogue des SFX
│   └── spatialSFX.ts            # Effets positionnels
├── ambient/
│   ├── ambientPlayer.ts         # Sons d'ambiance continus
│   └── weatherAmbience.ts       # Ambiance météo
├── mixer/
│   ├── masterMixer.ts           # Volumes globaux
│   ├── ducking.ts               # Baisse auto pendant SFX importants
│   └── compressor.ts            # Éviter les pics
├── events/
│   ├── eventSoundMap.ts         # Mapping événement → son
│   └── titleSoundFx.ts          # SFX des titres gagnés
└── utils/
    ├── audioLoader.ts           # Chargement des assets
    ├── fadeUtils.ts             # Fonctions de fondu
    └── audioContext.ts          # Gestion du contexte audio
```

### Architecture des couches sonores

```
┌──────────────────────────────────────────┐
│ MASTER OUTPUT                             │
│ ← Compresseur / limiteur                  │
├──────────────────────────────────────────┤
│ LAYER 1 : MUSIQUE                         │
│ - Piste principale de l'âge               │
│ - Couches additionnelles dynamiques       │
│ Volume max : 60%                          │
├──────────────────────────────────────────┤
│ LAYER 2 : AMBIANCE                        │
│ - Drones, textures continues              │
│ - Météo (pluie, vent)                     │
│ Volume max : 40%                          │
├──────────────────────────────────────────┤
│ LAYER 3 : SFX ENVIRONNEMENTAUX            │
│ - Volcans, vagues, cris d'animaux         │
│ - Liés à ce qui est visible               │
│ Volume max : 70%                          │
├──────────────────────────────────────────┤
│ LAYER 4 : SFX ÉVÉNEMENTIELS               │
│ - Commandes chat, événements majeurs      │
│ - Notifications, titres gagnés            │
│ Volume max : 85%                          │
└──────────────────────────────────────────┘
```

Chaque layer a son propre volume, contrôlable indépendamment.

---

## Musique adaptative

### Principe fondamental

La musique n'est **pas statique**. Elle réagit à l'état du monde en temps réel.

### Système de couches (stems)

Chaque morceau d'âge est composé de **plusieurs couches superposables** :

```typescript
interface MusicTrack {
  baseLayer: AudioClip;           // Drone de base, toujours présent
  
  layers: {
    calm: AudioClip;              // Ajouté quand pressure < 0.3
    tension: AudioClip;           // Ajouté quand pressure > 0.5
    urgent: AudioClip;            // Ajouté quand pressure > 0.8
    
    population: AudioClip;        // Augmente avec la pop
    diversity: AudioClip;         // Augmente avec biodiversité
    technology: AudioClip;        // Augmente avec tech level
  };
  
  duration: number;               // Durée d'une boucle
  bpm: number | null;             // Si applicable
}
```

### Exemple de fonctionnement

**Âge IV — état "peaceful"** (pression basse, écosystème stable) :

```
Base layer (drone forêt) + Layer "calm" (flûtes douces) + Layer "diversity" (chants d'oiseaux légers)
= Ambiance contemplative
```

**Âge IV — état "tense"** (pression moyenne, guerre inter-espèces) :

```
Base layer + Layer "tension" (percussions tribales)  + Layer "diversity"
= Ambiance d'urgence naturelle
```

**Âge IV — état "urgent"** (pression haute, extinction imminente) :

```
Base layer (altéré) + Layer "urgent" (dissonances) + Layer "tension"
= Ambiance de catastrophe
```

### Mélange dynamique

```typescript
class AdaptiveLayerer {
  private layers: Map<string, Howl>;
  
  update(worldState: WorldState) {
    const pressure = worldState.pressure;
    const diversity = worldState.biodiversity;
    const tech = worldState.techLevel;
    
    // Layer pressure
    this.setLayerVolume('calm', this.smoothStep(0.3 - pressure, 0.2));
    this.setLayerVolume('tension', this.smoothStep(pressure - 0.3, 0.4));
    this.setLayerVolume('urgent', this.smoothStep(pressure - 0.7, 0.3));
    
    // Layer biodiversité
    this.setLayerVolume('diversity', Math.min(diversity / 50, 1));
    
    // Layer tech
    this.setLayerVolume('technology', Math.min(tech / 10, 1));
  }
  
  private setLayerVolume(name: string, targetVolume: number) {
    const layer = this.layers.get(name);
    if (!layer) return;
    
    // Transition douce (2 secondes) vers le nouveau volume
    layer.fade(layer.volume(), targetVolume, 2000);
  }
}
```

### Synchronisation

**Règle** : toutes les couches doivent être **synchronisées au tempo**. Si une couche arrive en plein milieu du cycle, elle attend la prochaine mesure pour démarrer (éviter les ruptures).

---

## Musique par âge

### 🜂 Âge I — Le Feu

**Ambiance** : chaotique, brûlant, primordial
**Références** : Tim Hecker, drones sombres, early Autechre

**Composition type** :

- **Durée de boucle** : 4-5 minutes
- **Instruments** :
  - Drones basse fréquence (30-80 Hz) évoquant la lave profonde
  - Crackles organiques aigus (feu qui brûle)
  - Cymbales/gongs traités en reverb infinie
  - Percussions massives sporadiques (impacts, éruptions)
  - Respiration synthétique (planète qui "vit")

**Couches adaptatives** :

- `calm` : Juste les drones, très lents
- `tension` : Ajout de cymbales traitées, respiration plus forte
- `urgent` : Percussions dissonantes, basses distordues

**Émotion visée** : fascination face au chaos primordial

### 🜄 Âge II — Les Eaux

**Ambiance** : calme, vaporeuse, mystérieuse
**Références** : Stars of the Lid, Brian Eno *On Land*, Subnautica

**Composition type** :

- **Durée de boucle** : 5-6 minutes
- **Instruments** :
  - Synthés warmes et larges (pads)
  - Piano traité (très reverb, ambient)
  - Sons d'eau traités (bulles, gouttes ralenties)
  - Voix traitées en pad (syllabes étirées)
  - Cloches lointaines

**Couches adaptatives** :

- `calm` : Pads et gouttes d'eau
- `tension` : Orages lointains qui grondent en sub-bass
- `urgent` : Tempêtes, voix qui deviennent spectrales

**Émotion visée** : contemplation méditative

### 🜃 Âge III — Les Germes

**Ambiance** : organique, étrange, vivante
**Références** : Autechre, Aphex Twin *SAW II*, sons microscopiques

**Composition type** :

- **Durée de boucle** : 4-5 minutes
- **Instruments** :
  - Textures bubbling, gurgling (organique)
  - Clics rythmiques très ténus
  - Bourdonnements cellulaires (modulations lentes)
  - Filtres analog qui modulent en permanence
  - Voix murmurées lointaines, incompréhensibles

**Couches adaptatives** :

- `calm` : Textures et bourdonnements
- `tension` : Rythmes plus affirmés, début de percussions
- `urgent` : Glitches, dissonances, acidité

**Émotion visée** : émerveillement face à l'émergence de la vie

### 🜁 Âge IV — Le Grouillement

**Ambiance** : foisonnante, vivante, tribale
**Références** : Dead Can Dance, musique de la jungle, rythmes organiques

**Composition type** :

- **Durée de boucle** : 5-7 minutes
- **Instruments** :
  - Percussions organiques (tablas, djembés, congas)
  - Flûtes ethniques (shakuhachi, quena)
  - Chants d'animaux traités (oiseaux, baleines)
  - Voix sans paroles (aahs, hums)
  - Cordes pincées (harpes, sitars)

**Couches adaptatives** :

- `calm` : Flûtes et chants
- `tension` : Percussions tribales, tempo augmente
- `urgent` : Percussions martelées, cuivres graves (dangers)
- `diversity` : Plus de textures animales se superposent
- `population` : Plus de voix et textures humaines (préfigurant l'Âge V)

**Émotion visée** : sensation d'abondance, de vie qui explose

### 🜔 Âge V — Les Étincelles

**Ambiance** : tribale, ancestrale, chaleureuse
**Références** : Wardruna, musique traditionnelle, percussions ancestrales

**Composition type** :

- **Durée de boucle** : 4-6 minutes
- **Instruments** :
  - Tambours de peau (tom-toms, bodhrán)
  - Chants de gorge, chants primitifs
  - Flûtes rustiques
  - Cordes pincées (harpes celtiques, instruments à cordes rudimentaires)
  - Crépitement de feu (omniprésent, fondation)

**Couches adaptatives** :

- `calm` : Feu, voix douces, cordes
- `tension` : Percussions collectives, chants guerriers
- `urgent` : Cris, percussions chaotiques (conflits tribaux)

**Émotion visée** : communion, appartenance primordiale

### 🜚 Âge VI — Les Cités

**Ambiance** : varié, humain, évolutif (6 sous-âges = 6 sous-ambiances)
**Références** : Hans Zimmer, Max Richter, musique classique → moderne

**Sous-compositions** :

**Âge du Bronze** (bronze) :

- Instruments antiques (lyres, flûtes grecques)
- Cuivres brillants
- Percussions ritualistes

**Âge du Fer** (iron) :

- Cordes (violons, cellos)
- Chœurs épiques
- Marches militaires discrètes

**Âge Médian** (medieval) :

- Luth, harpe, flûtes
- Chœurs grégoriens
- Cloches d'églises (lointaines)

**Âge des Voiles** (sails) :

- Musique baroque (clavecin, violons)
- Instruments exotiques (introduits par exploration)
- Musique de cour

**Âge des Machines** (industrial) :

- Cordes tendues
- Percussions mécaniques (métalliques)
- Orgues, piano sombre
- Sons industriels traités

**Âge des Réseaux** (network) :

- Cordes modernes
- Synthétiseurs subtils
- Sons digitaux minimaux
- Nappes électroniques

**Couches adaptatives globales Âge VI** :

- `calm` : Paix, prospérité, harmonie
- `tension` : Empires qui se tendent, guerre proche
- `urgent` : Bataille, effondrement

**Émotion visée** : fierté, grandeur, fragilité des civilisations

### 🜛 Âge VII — Le Vide

**Ambiance** : froide, cosmique, inquiétante
**Références** : Outer Wilds, Interstellar (parties glacées), ambient cosmique

**Composition type** :

- **Durée de boucle** : 6-8 minutes
- **Instruments** :
  - Nappes synthétiques larges et froides
  - Sons métalliques (clang spatiaux)
  - Voix traitées lointaines (communications)
  - Cordes glacées
  - Sub-bass pour donner l'espace infini

**Couches adaptatives** :

- `calm` : Nappes contemplatives, isolation
- `tension` : Dissonances qui s'installent, voix anxieuses
- `urgent` : Distortions, chaos cosmique (apocalypse imminente)

**Émotion visée** : émerveillement mêlé d'angoisse existentielle

---

## Musique d'apocalypse

### Principe

Chaque type d'apocalypse a sa **signature musicale** distincte. L'ambiance musicale bascule complètement au déclenchement.

### 🌠 Impact céleste

**Avant l'impact** :

- Silence progressif pendant 10 secondes
- Un sub-bass grandit en volume
- Cloches de menace

**Pendant** :

- Impact énorme (cymbales, drums massifs)
- Silence oppressant pendant 3 secondes
- Ambiance étouffée (comme après explosion)

**Après** :

- Drones sombres, voix qui pleurent au loin
- Reconstruction très lente

### ☢️ Hiver des cendres

- Percussions militaires qui s'arrêtent brusquement
- Silence glacial
- Vent seul pendant 30 secondes
- Émergence lente de drones glacés

### 🔥 L'Étuve

- Chaleur musicale (tempo qui accélère)
- Cuivres brûlants
- Dissonances fiévreuses
- Fin en surchauffe puis silence

### 🦠 La Grande Faux

- Respirations rauques (sample)
- Cloches funèbres distantes
- Chants liturgiques déformés
- Decay progressif vers silence

### 🤖 Singularité

- Musique qui glitche progressivement
- Sons digitaux, numériques
- Voix humaines qui se transforment en voix synthétiques
- Build-up vers un chaos absolu puis... silence surnaturel

### 🌊 Déluge final

- Pluie qui s'intensifie
- Sons de vagues qui couvrent tout
- Cordes submergées, étouffées
- Retour au son des eaux seules

### 👁️ Le Contact

- Sons impossibles à identifier
- Voix non humaines
- Micro-tonalités dissonantes
- Silence glacé qui gagne tout

### 🕳️ Effondrement intérieur

- Musique qui perd ses couches progressivement
- Piano de plus en plus seul, de plus en plus lent
- Dernière note qui s'éteint sans jamais revenir

### ⏳ L'Oubli

- Morceau qui se dilue, devient irrécupérable
- Volumes qui baissent sans que personne ne s'en aperçoive
- Silence final qui n'est remarqué que quand il est trop tard

### Cinématique de renaissance

Après chaque apocalypse, une **transition musicale** vers le nouveau cycle :

1. **Silence complet** : 10-30 secondes après la fin de l'apocalypse
2. **Émergence** : un son unique revient (goutte d'eau, battement de cœur, vent)
3. **Texture** : puis une texture s'installe
4. **Nouveau cycle** : enfin, la musique de l'Âge I reprend avec de subtiles variations (indiquant que c'est un nouveau cycle)

---

## Effets sonores (SFX)

### Catalogue par catégorie

### 🌋 Phénomènes naturels

**Éruption volcanique** :

- Explosion principale (basse fréquence + frequencies hautes)
- Rumble continu après
- Crackles de lave
- Durée : 5-15 secondes

**Tonnerre** :

- Éclair (aigu, court)
- Tonnerre (grave, long, roulant)
- Variantes : proche/distant, sec/pluvieux

**Tremblement de terre** :

- Rumble sub-bass prolongé
- Craquements (rochers)
- Objets qui tombent

**Tsunami / déluge** :

- Eau qui monte en pression
- Impact massif
- Eau en mouvement continu

**Vent** :

- Plusieurs intensités (brise → tempête)
- Bouclable parfaitement

**Pluie** :

- Légère (tick-tick)
- Forte (hiss continu)
- Diluvienne (whooshing)

**Feu** :

- Crépitement doux
- Brasier (plus fort)
- Incendie (énorme)

**Geyser** :

- Sifflement aigu
- Jet d'eau
- Retombée

### 🌿 Vie

**Cris d'animaux** (5-10 variantes) :

- Préhistorique : rugissements, cris reptiliens
- Moderne : oiseaux, mammifères
- Créatures impossibles : sons étranges, uniques

**Reproduction / naissance** :

- Son subtil, organique
- Pas trop littéral (éviter le gênant)

**Mort animale** :

- Cri court, étouffé
- Pas de réalisme dégoûtant

**Nuée** :

- Oiseaux en vol groupé
- Insectes (bourdonnement)

### 🏛️ Civilisations

**Foule** :

- Murmures de marché
- Clameur de foule
- Ovation
- Colère collective

**Construction** :

- Marteau sur enclume
- Scie
- Coups de pioche
- Treuils

**Cloches** :

- Cloche d'église (différentes tailles)
- Cloches de festival
- Glas funèbre

**Feux d'artifice / cérémonies** :

- Trompettes
- Chants liturgiques
- Tambours cérémoniels

**Batailles** :

- Épées qui s'entrechoquent
- Cris de guerre
- Archers
- Explosions de canons (plus tard)

**Industrie** :

- Machines à vapeur
- Usines
- Sirènes d'usine
- Trains

**Moderne** :

- Voitures
- Klaxons
- Sirènes de police
- Avion

### 🚀 Spatial

**Fusée** :

- Countdown
- Décollage (sub-bass massif)
- Vol
- Retour atmosphérique

**Satellite** :

- Beep de transmission
- Signal radio

**IA** :

- Voix synthétique
- Calculs digitaux
- Glitches

**Contact** :

- Sons impossibles
- Voix non humaines
- Signaux inconnus

### 🎯 Événements narratifs

**Titre gagné** :

- Son bref, euphorique
- Reverb brillante
- Variantes par catégorie (primordial, obscur, légendaire...)

**Nouvelle espèce** :

- Son cristallin, émergent
- Comme une découverte

**Nouvelle cité** :

- Son de fondation : cloche + chant
- Sentiment d'installation

**Apocalypse imminente** :

- Alarme sinistre
- Utilisé avec parcimonie (gardé pour les vrais moments)

**Âge gagné / transition** :

- Son cinématique long
- Build-up + résolution

### ⚙️ UI / système

**Commande reçue** (très discret) :

- Tick subtil
- À peine audible
- Ne doit pas fatiguer

**Notification** :

- Ding doux
- Variantes selon importance

**Alerte** :

- Plus affirmé
- Mais jamais strident

**Changement de caméra** :

- Whoosh très léger
- Si zoom → glissement sonore

---

## Ambiances sonores

### Définition

Les **ambiances** sont des sons en boucle **continue** qui définissent l'environnement global. Différents des SFX (ponctuels) et de la musique (émotionnelle).

### Types d'ambiance

**Ambiance par biome (Âges IV+)** :

- Forêt : oiseaux, insectes, frémissement de feuilles
- Désert : vent, silence quasi-total
- Océan : vagues, cris de mouettes
- Jungle : insectes denses, oiseaux exotiques
- Toundra : vent glacial, craquements de glace
- Savane : cigales, troupeau lointain
- Marais : grenouilles, bourdonnements

**Ambiance par densité civilisationnelle** :

- Tribu : feu de camp lointain, discussions
- Village : activité artisanale, enfants
- Cité moyenne : marché, cloches, trafic
- Grande cité : bourdonnement urbain
- Mégalopole : vrombissement constant

**Ambiance météo** :

- Ciel clair : silence atmosphérique
- Nuageux : vent modéré
- Pluie : fond de pluie
- Tempête : vent + pluie + tonnerre occasionnel
- Neige : silence feutré

### Transitions d'ambiance

Les ambiances ne s'arrêtent pas brutalement :

- **Cross-fade** de 5-10 secondes entre deux ambiances différentes
- **Variation de volume** selon la zone visible à l'écran
- **Empilement possible** : plusieurs ambiances peuvent coexister (forêt + pluie + tribu)

### Budget ambiance

- Maximum 3 ambiances simultanées
- Volume cumulé : 40% max du mix total
- Priorité : biome > météo > civilisation

---

## Transitions sonores

### Entre les âges

Chaque transition d'âge a sa **cinématique sonore** dédiée :

**Âge I → II** :

1. La musique de feu s'atténue progressivement
2. Pluie torrentielle qui monte (effet SFX majeur)
3. Silence de 3 secondes
4. Nouvelle musique (Âge II) émerge doucement
5. Durée totale : 30 secondes

**Âge II → III** :

1. Orages qui s'éloignent
2. Zoom sonore (comme si l'oreille descend dans l'eau)
3. Sons organiques minuscules émergent
4. Musique Âge III se révèle
5. Durée : 30 secondes

**Âge III → IV** :

1. Les sons microbiens deviennent des cris d'animaux
2. Émergence progressive de percussions
3. Symphonie tribale qui explose
4. Durée : 45 secondes

**Âge IV → V** :

1. La jungle se calme
2. Émergence d'un feu de camp
3. Premier battement de tambour humain
4. Chant primitif
5. Durée : 45 secondes

**Âge V → VI** :

1. Tambour tribal continue
2. Se transforme progressivement en marche
3. Cloches distantes apparaissent
4. Première ville "se construit" musicalement
5. Durée : 60 secondes

**Âge VI → VII** :

1. Les sons terrestres s'éloignent
2. Zoom vers l'espace
3. Silence cosmique
4. Nappes synthétiques émergent
5. Durée : 45 secondes

### Au sein d'un âge (sous-transitions)

**Passage de sous-âge en Âge VI** :

- Durée : 15-20 secondes
- Transitions douces, pas de rupture
- Nouveaux instruments apparaissent, anciens se retirent

### Moments spéciaux

**Titre légendaire gagné** :

- Musique baisse à 30% (ducking)
- Son de titre (2-3 secondes)
- Musique remonte

**Guerre éclate** :

- Couche "tension" monte rapidement
- SFX de bataille s'ajoutent en ambiance
- Reste pendant toute la durée du conflit

**Mort de figure légendaire** :

- Silence musical pendant 5 secondes
- Son unique (cloche ou voix)
- Musique reprend en mode mineur (plus triste)

---

## Système de mixage

### Hiérarchie des volumes

```
MASTER (100% = volume utilisateur)
  ├── Musique (par défaut 60%)
  │   ├── Base layer (100%)
  │   ├── Calm layer (variable)
  │   ├── Tension layer (variable)
  │   └── Urgent layer (variable)
  │
  ├── Ambiances (par défaut 40%)
  │   ├── Biome primary (100%)
  │   ├── Weather (variable)
  │   └── Civilization (variable)
  │
  ├── SFX environnementaux (par défaut 70%)
  │   └── [liste dynamique]
  │
  └── SFX événementiels (par défaut 85%)
      └── [liste dynamique]
```

### Ducking automatique

Certains sons importants **baissent automatiquement** les autres :

```typescript
class AudioDucker {
  duck(targetLayer: string, ductAmount: number, durationMs: number) {
    // Exemple : pendant une apocalypse
    // - Musique baisse de 50% 
    // - Ambiances baissent de 80%
    // - SFX apocalypse monte à 100%
    
    const layer = this.mixer.getLayer(targetLayer);
    const originalVolume = layer.volume;
    
    layer.fadeVolume(originalVolume * (1 - ductAmount), durationMs);
    
    setTimeout(() => {
      layer.fadeVolume(originalVolume, durationMs);
    }, durationMs);
  }
}
```

**Cas d'usage typiques** :

- Annonce de nouveau cycle → tout duck 80%, narration seule
- Apocalypse → musique duck, SFX apocalypse prioritaire
- Titre légendaire → ambiance duck 30%
- Transition d'âge → tout duck vers 50% puis remonte

### Compression et limitation

Pour éviter les pics (un gros SFX qui fait sursauter), un **limiteur** final est appliqué :

```typescript
class AudioCompressor {
  threshold: number = -12; // dB
  ratio: number = 4;        // 4:1 compression
  attack: number = 3;       // ms
  release: number = 100;    // ms
  
  // Gérer les pics pour un son équilibré
}
```

### Sidechain (optionnel, avancé)

Quand un SFX important joue, la musique "pompe" subtilement pour laisser la place (effet utilisé en musique électronique moderne).

---

## Spatialisation et dynamique

### Panning

Les sons qui viennent d'une **zone de l'écran** peuvent être **pannés** (stéréo) :

- Volcan à gauche de la planète → son à gauche
- Éclair à droite → son à droite
- Explosion au centre → son centré

```typescript
class SpatialSFX {
  playPositional(sfxName: string, screenX: number, screenWidth: number) {
    const sound = this.loadSFX(sfxName);
    const pan = (screenX - screenWidth / 2) / (screenWidth / 2); // -1 à 1
    sound.stereo(pan);
    sound.play();
  }
}
```

### Distance / profondeur

Sons qui viennent de **loin** (moins visibles) :

- Volume réduit
- Filtrage passe-bas (sons plus étouffés)
- Reverb plus marquée

### Dynamique de la journée

**Jour** : toutes les fréquences présentes (clair)
**Nuit** : baisse subtile des aigus (plus doux)
**Crépuscule/Aube** : transition douce

---

## Format et qualité

### Formats audio

**Musique** :

- Format principal : **OGG Vorbis** (bonne compression, open source)
- Alternative : **WebM/Opus** (encore meilleur, mais support un peu moins universel)
- Fallback : **MP3** (compatibilité maximale)
- Qualité : **192 kbps VBR** (équilibre qualité/poids)

**SFX courts** :

- Format : **OGG Vorbis** ou **WebM/Opus**
- Qualité : **128 kbps** (suffisant, gains de poids significatifs)
- Longs SFX (>5s) : mêmes paramètres que musique

**Ambiance** :

- Format : **OGG Vorbis**
- Qualité : **128-160 kbps**
- **Boucles parfaites** (pas de clic à la jonction)

### Normalisation

Tous les fichiers audio sont **normalisés à -14 LUFS** (standard streaming) :

- Évite les écarts de volume brutaux
- Compatible avec YouTube/Twitch (qui ajustent automatiquement)

### Poids budgétaire

**Objectif** : total audio < 30 MB à charger initialement

- 7 musiques d'âge : 3-4 MB chacune = 25 MB max
- SFX critiques : 3-5 MB
- Ambiances : 2-3 MB

**Assets chargés à la demande** :

- Musiques d'apocalypse (uniquement quand déclenchées)
- SFX rares (créatures impossibles, contact, etc.)

### Préparation des fichiers

Chaque fichier doit avoir :

- Boucle parfaite si loopable (pas de clic, fondu invisible)
- Silence de début/fin minimal (éviter les latences)
- Pas de DC offset
- Mix équilibré (pas de fréquences dominantes gênantes)

---

## Production et sourcing

### Options de création

**Option 1 — Créer tout soi-même**

- Outils : Ableton Live, FL Studio, Reaper, Logic Pro
- Coût : 0 si gratuit (LMMS, Reaper en trial)
- Temps : TRÈS long (expertise requise)
- Avantage : identité 100% unique

**Option 2 — Banques de sons libres**

- Sources :
  - [Freesound.org](https://freesound.org) (CC0 et CC-BY)
  - [Zapsplat](https://zapsplat.com) (gratuit avec compte)
  - [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) (libre pour non-commercial)
  - [Sonniss GameAudio Packs](https://sonniss.com/gameaudiogdc) (gratuits, énormes)
- Coût : 0
- Temps : Modéré (tri, montage)
- Avantage : grande variété rapidement

**Option 3 — Packs commerciaux**

- Sources :
  - AudioJungle (abordable)
  - Splice (abonnement mensuel)
  - Native Instruments libraries
- Coût : 50-500€
- Avantage : qualité professionnelle

**Option 4 — Commandes à des musiciens**

- Freelances sur Fiverr, Soundbetter
- Ou musiciens connus (plus cher)
- Coût : 500-5000€ pour un score complet
- Avantage : qualité maximale, identité forte

**Option 5 — Musique générative / IA**

- Suno, Udio, MusicGen, Stable Audio
- À utiliser avec prudence (questions de droits d'auteur)
- Rapide mais doit être retravaillé manuellement

### Recommandation pour Genesis Live

**MVP (Phase 5)** : combinaison d'options 1 et 2

- Banques libres (Sonniss packs) pour SFX
- Outils musicaux pour composer les musiques d'âge
- IA (avec retravail) pour itérer vite

**V1 polished (Phase 7+)** : envisager l'option 4

- Commander un score original à un musicien
- Budget 1000-3000€
- Renforce l'identité, différencie du tout-venant

### Banque SFX libres recommandées

**Sonniss GameAudio (gratuit)** :

- 30+ GB de sons libres pour jeu vidéo
- Qualité pro
- Licence commerciale OK

**Freesound.org** :

- Filtrer par licence CC0 (zéro contrainte)
- Grande communauté de contributeurs

**BBC Sound Effects** :

- 33 000 sons historiques
- Licence "personal/educational" (vérifier pour usage stream)

---

## Intégration technique

### Chargement

**Pré-chargement au démarrage** :

```typescript
class AudioLoader {
  async preloadCritical(): Promise<void> {
    const criticalAudio = [
      'music/age_1_loop.ogg',
      'music/age_2_loop.ogg',
      'music/age_3_loop.ogg',
      // ...
      'sfx/ui_notification.ogg',
      'sfx/title_earned.ogg',
      'ambient/forest_loop.ogg',
      'ambient/ocean_loop.ogg',
      // ...
    ];
    
    await Promise.all(criticalAudio.map(path => this.load(path)));
  }
}
```

**Chargement à la demande** :

```typescript
async playApocalypseMusic(type: ApocalypseType) {
  const path = `music/apocalypse_${type}.ogg`;
  
  // Charger si pas déjà chargé
  if (!this.loaded.has(path)) {
    await this.load(path);
  }
  
  this.play(path);
}
```

### Howler.js utilisation

```typescript
import { Howl, Howler } from 'howler';

class MusicPlayer {
  private currentTrack: Howl | null = null;
  
  async playAgeMusic(age: Age) {
    // Fade out current
    if (this.currentTrack) {
      await this.fadeOutAndStop(this.currentTrack, 3000);
    }
    
    // Load and fade in new
    const path = AGE_MUSIC_MAP[age];
    const newTrack = new Howl({
      src: [path],
      loop: true,
      volume: 0,
      preload: true
    });
    
    newTrack.play();
    newTrack.fade(0, 0.6, 3000); // Fade from 0 to 60% over 3s
    
    this.currentTrack = newTrack;
  }
  
  private async fadeOutAndStop(track: Howl, duration: number) {
    return new Promise<void>(resolve => {
      track.fade(track.volume(), 0, duration);
      track.once('fade', () => {
        track.stop();
        resolve();
      });
    });
  }
}
```

### Pooling de SFX

Pour les SFX joués souvent (commandes chat), éviter de recréer à chaque fois :

```typescript
class SFXPool {
  private pools: Map<string, Howl[]> = new Map();
  
  play(sfxName: string) {
    if (!this.pools.has(sfxName)) {
      // Créer 5 instances pour pouvoir les jouer en parallèle
      this.pools.set(sfxName, Array.from({ length: 5 }, () => 
        new Howl({ src: [`sfx/${sfxName}.ogg`] })
      ));
    }
    
    const pool = this.pools.get(sfxName)!;
    const available = pool.find(s => !s.playing()) || pool[0];
    available.play();
  }
}
```

### Déblocage du contexte audio

Les navigateurs modernes **bloquent l'audio** jusqu'à une interaction utilisateur :

```typescript
class AudioContextManager {
  private unlocked = false;
  
  init() {
    // Écouter la première interaction
    const unlock = () => {
      if (this.unlocked) return;
      
      // Howler gère ça automatiquement mais on peut forcer
      Howler.ctx?.resume();
      this.unlocked = true;
      
      // Déclencher les sons en attente
      this.playPendingSounds();
    };
    
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }
}
```

**Pour OBS** : lancer le navigateur avec l'option `--autoplay-policy=no-user-gesture-required` pour contourner cette restriction.

### Gestion mémoire

**Décharger les sons inutilisés** :

- Musique d'un âge précédent : décharger après 5 minutes dans le nouvel âge
- SFX rarement utilisés : décharger si non utilisés depuis 10 min

```typescript
class AudioMemoryManager {
  private usage: Map<string, number> = new Map();
  
  markUsed(path: string) {
    this.usage.set(path, Date.now());
  }
  
  cleanup() {
    const MAX_IDLE = 10 * 60 * 1000; // 10 min
    const now = Date.now();
    
    for (const [path, lastUsed] of this.usage) {
      if (now - lastUsed > MAX_IDLE) {
        this.unload(path);
      }
    }
  }
}
```

---

## Accessibilité audio

### Options utilisateur

**Volume global** : slider 0-100%
**Volumes par couche** :

- Musique : 0-100% (recommandé 60%)
- Ambiance : 0-100%
- SFX : 0-100%

**Options avancées** :

- Mute complet
- Mode "narration" : baisse musique à 30%, met en avant SFX événementiels
- Mode "ambiance" : baisse SFX, met en avant musique
- Désactivation des SFX UI (pour réduire la fatigue auditive)

### Sous-titres sonores

Pour les malentendants, **chaque événement sonore important** a son équivalent visuel :

- SFX = notification HUD
- Apocalypse = banner pleine largeur
- Titre gagné = popup
- Etc.

### Pas de sons stroboscopiques

Éviter :

- Pulsations très rapides (peuvent déclencher crises épileptiques)
- Fréquences strictement aiguës prolongées (gênant)
- Volumes brusques sans warning

### Respect des normes streaming

**YouTube** : normalisation à -14 LUFS
**Twitch** : normalisation à -14 LUFS  
**Tous** : pas de DC offset, peak limit à -1 dB

---

## ✨ Conclusion

Le son est **l'âme invisible** de Genesis Live. C'est ce qui transforme un écran qui change en **expérience vivante**.

### Principes à ne jamais violer

1. **Le silence fait partie de la musique** : ne jamais saturer
2. **L'audio sert le récit** : pas de démo de virtuosité
3. **Cohérence stylistique** : pas de mélange de genres brutal
4. **Accessibilité** : tout son important doit avoir un équivalent visuel
5. **Normalisation** : équilibre sonore stable, pas de pics violents

### Principes à ajuster avec le temps

1. **Compositions exactes** : à affiner selon le feedback
2. **Couches adaptatives** : à tuner selon l'émergence observée
3. **Sensibilité aux événements** : plus ou moins marqués
4. **Budget audio** : à réévaluer si besoin de plus de contenu

### Phases d'implémentation

**MVP (Phase 5 roadmap)** :

- [ ] 3 musiques d'âge (I, II, III) — base simple sans layers
- [ ] 10-15 SFX essentiels
- [ ] Mixer basique avec fade in/out

**V1 (Phase 7 roadmap)** :

- [ ] 7 musiques d'âge complètes avec layers adaptatifs
- [ ] ~60 SFX complets
- [ ] Système d'ambiance par biome
- [ ] Transitions d'âge soignées

**V2 (Phase 8 roadmap)** :

- [ ] Musiques d'apocalypse uniques (9 variantes)
- [ ] Spatialisation stéréo
- [ ] Ducking et sidechain
- [ ] Compositions originales commandées

### Citation à retenir

> "La musique dit l'indicible. Elle communique ce que les mots ne peuvent pas dire, ce que le silence ne peut pas cacher."

Ton audio n'a pas besoin d'être parfait. Il doit juste **servir le récit** qui se raconte tout seul.

---

*Design sonore — v1.0*
*L'âme invisible de Genesis Live. À relire à chaque grande décision audio.*
