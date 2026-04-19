# 🎬 GENESIS LIVE — Spécifications de rendu

*Comment la planète et tout ce qui vit dessus est dessiné à l'écran. Règles visuelles, caméra cinématique, effets, composition.*

---

## 📖 Table des matières

1. [Philosophie du rendu](#philosophie-du-rendu)
2. [Architecture graphique](#architecture-graphique)
3. [Système de couches (layers)](#système-de-couches-layers)
4. [Rendu de la planète](#rendu-de-la-planète)
5. [Projection adaptative au zoom](#projection-adaptative-au-zoom)
6. [Rendu des entités](#rendu-des-entités)
6. [Caméra cinématique](#caméra-cinématique)
7. [Effets de particules](#effets-de-particules)
8. [Transitions et animations](#transitions-et-animations)
9. [Cycle jour/nuit](#cycle-journuit)
10. [HUD et overlays](#hud-et-overlays)
11. [Performance et optimisation](#performance-et-optimisation)
12. [Configuration du canvas](#configuration-du-canvas)
13. [Responsive et formats de sortie](#responsive-et-formats-de-sortie)
14. [Scripts de test visuel](#scripts-de-test-visuel)

---

## Philosophie du rendu

### Le rendu raconte l'histoire

Le rendu n'est **pas juste un affichage** de l'état du monde — c'est un **narrateur visuel**. Chaque choix de caméra, chaque effet, chaque transition doit **servir le récit** qui se déroule.

### Les 5 principes de rendu

**1. Lisibilité avant spectacle**
Un viewer qui arrive doit comprendre l'essentiel en **5 secondes**. Pas de chaos visuel : chaque élément à l'écran doit avoir un rôle.

**2. Rythme organique**
Le rendu respire avec la simulation. Moments calmes → contemplation. Moments intenses → tension. Transitions douces, jamais brutales (sauf apocalypse).

**3. Cohérence par-dessus tout**
Un sprite doit sembler appartenir au même monde que tous les autres. Même palette, même style, même échelle.

**4. Magie des détails**
Les petites animations (feuilles qui bougent, lumières qui scintillent) font la différence entre "c'est un jeu" et "c'est vivant".

**5. Performance = accessibilité**
Un stream qui lague = des viewers qui partent. Le rendu doit tenir 60 FPS stables, quoi qu'il arrive.

### Style visuel global

**Technique** : **pixel art moderne** (ou "low-res art") — **2D avec projection hybride globe/isométrique pilotée par le zoom**
- Résolution logique : 480×270 ou 640×360 upscalée
- Pas de pixel rigide pur (on peut avoir des effets, transparences, rotations fluides)
- Esthétique proche de *Celeste*, *Hyper Light Drifter*, *Oxygen Not Included*

**Projection** :
- **Vue éloignée** (dézoom) → **globe 2D** (disque planétaire, style *Spore* / *Reus* vue monde)
- **Vue rapprochée** (zoom) → **isométrique 2:1** (tilemap, style *Habbo* / *Transport Tycoon* / *Age of Empires 2*)
- Transition continue : crossfade + léger morph entre les deux projections
- Détails précis dans [Projection adaptative au zoom](#projection-adaptative-au-zoom)

**Palette** : respecte strictement les 64 couleurs du `color_palette.md`

**Animations** : 
- **Créatures** : 4-8 frames par cycle
- **Éléments environnementaux** : 2-4 frames
- **Effets majeurs** : 8-16 frames
- **FPS animations** : 10-12 FPS (pixel art traditionnel)

### Ce que le rendu n'est PAS

❌ Un simulateur physique hyper-réaliste
❌ Un jeu 3D
❌ Une représentation fidèle géographique (c'est de l'abstraction)
❌ Du photoréalisme
❌ Du glitch art intentionnellement chaotique

---

## Architecture graphique

### Stack de rendu

**Moteur principal** : **Pixi.js v7+**
- WebGL pour les performances
- API simple pour pixel art
- Bon support des textures, filtres, particules

**Pourquoi Pixi** :
- Mieux que Canvas 2D pur pour la perf (WebGL accéléré)
- Plus simple que Three.js (2D natif)
- Écosystème mature (plugins, exemples)
- Bien documenté

**Alternatives envisagées** :
- **Canvas 2D pur** : trop lent pour des milliers d'entités
- **Three.js** : overkill pour du 2D
- **Godot HTML5** : trop lourd à embedder

### Organisation du code de rendu

```
frontend/src/renderer/
├── pixiApp.ts                # Init Pixi, boucle principale
├── projection/
│   ├── projectionManager.ts  # Bascule globe ↔ iso ↔ spatial selon le zoom
│   └── isoMath.ts            # worldToIso / isoToWorld (tile 32×16)
├── scenes/
│   ├── planetScene.ts        # Scène globe (disque planète)
│   ├── isoScene.ts           # Scène isométrique (tilemap chunk)
│   ├── spaceScene.ts         # Vue spatiale (Âge VII)
│   └── apocalypseScene.ts    # Cinématiques d'apocalypse
├── layers/
│   ├── backgroundLayer.ts    # Espace, étoiles
│   ├── planetLayer.ts        # Disque planète (mode globe)
│   ├── atmosphereLayer.ts    # Nuages, couches atmosphériques
│   ├── terrainLayer.ts       # Biomes polygonaux (globe) ou tilemap (iso)
│   ├── isoTilemapLayer.ts    # Grille iso du chunk actif (mode iso)
│   ├── entityLayer.ts        # Créatures, cités (z-sort en iso)
│   ├── effectsLayer.ts       # Particules, événements
│   └── uiOverlayLayer.ts     # Liaison avec HUD HTML
├── camera/
│   ├── camera.ts             # Position, zoom de base
│   ├── cinematicCamera.ts    # Logique cinématique auto
│   ├── cameraTargets.ts      # Détection de points d'intérêt
│   └── shakeEffect.ts        # Tremblements (impacts, explosions)
├── entities/
│   ├── entityRenderer.ts     # Factory pour rendre les entités
│   ├── speciesRenderer.ts    # Rendu spécifique des espèces
│   ├── cityRenderer.ts       # Rendu spécifique des cités
│   └── ... (un par type d'entité)
├── effects/
│   ├── particleSystem.ts     # Moteur de particules
│   ├── eventEffects.ts       # Effets d'événements (pluie, éruption)
│   └── transitions.ts        # Transitions d'âges
├── assets/
│   ├── assetLoader.ts        # Chargement
│   ├── textureAtlas.ts       # Gestion des atlas
│   └── spriteRegistry.ts     # Index des sprites
├── filters/
│   ├── colorGrading.ts       # Grading selon l'âge
│   ├── postProcessing.ts     # Effets post-rendu
│   └── ageAtmosphere.ts      # Ambiance par âge
└── utils/
    ├── colorUtils.ts         # Manipulation couleurs
    ├── spatialIndex.ts       # Indexation spatiale (quadtree)
    └── renderingMath.ts      # Interpolations, easings
```

---

## Système de couches (layers)

### Ordre de rendu (de l'arrière vers l'avant)

```
┌──────────────────────────────────────────┐
│ 7. UI OVERLAY        (HUD HTML superposé) │
├──────────────────────────────────────────┤
│ 6. FX FOREGROUND     (pluie, neige)       │
├──────────────────────────────────────────┤
│ 5. ENTITIES AERIAL   (oiseaux, avions)    │
├──────────────────────────────────────────┤
│ 4. ATMOSPHERE        (nuages)             │
├──────────────────────────────────────────┤
│ 3. ENTITIES SURFACE  (créatures, cités)   │
├──────────────────────────────────────────┤
│ 2. TERRAIN           (biomes, relief)     │
├──────────────────────────────────────────┤
│ 1. PLANET BASE       (masse planétaire)   │
├──────────────────────────────────────────┤
│ 0. BACKGROUND        (espace, étoiles)    │
└──────────────────────────────────────────┘
```

### Règles par couche

**Layer 0 — Background**
- Toujours présent
- Se contente de l'espace et des étoiles
- Opacité : 100%
- Ne bouge pas avec la caméra (ou très peu, parallaxe)

**Layer 1 — Planet Base**
- *Mode globe uniquement* : la "forme" de la planète (grand cercle/ovale), change de couleur selon l'âge, ombre portée discrète (éclairage par le soleil)
- *Mode iso* : masqué (alpha 0)
- *Mode spatial* : version réduite (petit disque)

**Layer 2 — Terrain**
- *Mode globe* : patches de biomes polygonaux dessinés sur la planète, masque circulaire de Layer 1, se modifie avec les événements
- *Mode iso* : **tilemap isométrique 2:1** du chunk actif (voir [Vue isométrique](#vue-isométrique-near))

**Layer 3 — Entities Surface**
- Créatures, cités, tribus
- Triées par profondeur (Y : plus bas = plus devant)
- Cullées si hors écran

**Layer 4 — Atmosphere**
- Nuages semi-transparents qui bougent lentement
- Bruine, brume
- Passe devant les entités de surface mais derrière les aériennes

**Layer 5 — Entities Aerial**
- Oiseaux, ptérosaures, avions, satellites
- Au-dessus des nuages généralement

**Layer 6 — FX Foreground**
- Effets qui couvrent toute la vue : pluie, neige, tempête de sable
- Opacité modérée (30-60%)

**Layer 7 — UI Overlay**
- HUD HTML classique, pas géré par Pixi
- Superposition DOM

### Gestion des layers en code

```typescript
class LayerManager {
  private layers: Map<string, PIXI.Container>;
  
  constructor(app: PIXI.Application) {
    this.layers = new Map();
    
    // Créer les layers dans l'ordre
    const layerNames = [
      'background',
      'planetBase',
      'terrain',
      'entitiesSurface',
      'atmosphere',
      'entitiesAerial',
      'fxForeground'
    ];
    
    layerNames.forEach((name, index) => {
      const container = new PIXI.Container();
      container.zIndex = index;
      this.layers.set(name, container);
      app.stage.addChild(container);
    });
  }
  
  get(name: string): PIXI.Container {
    return this.layers.get(name)!;
  }
  
  add(layerName: string, sprite: PIXI.DisplayObject) {
    this.layers.get(layerName)!.addChild(sprite);
  }
}
```

---

## Rendu de la planète

### Représentation

**La planète se rend en deux modes selon le zoom** (voir [Projection adaptative au zoom](#projection-adaptative-au-zoom)) :
- **Mode globe** (zoom éloigné) : sphère vue en 2D — pas une vraie sphère 3D. On dessine un grand cercle/ovale avec des biomes peints dessus.
- **Mode iso** (zoom rapproché) : tilemap isométrique 2:1 d'une région de surface.

Cette section couvre le **mode globe**. Le mode iso est détaillé dans la section suivante.

### Anatomie du rendu planétaire

```
       ╱─────────╲
      ╱  atmosphère╲         ← Atmosphere Layer
     │   brumeuse   │
     │ ┌─────────┐  │
     │ │ biomes  │  │        ← Terrain Layer
     │ │ ~~~~~   │  │        ← Oceans ondulent
     │ │  ⌂ ⌂    │  │        ← Entities Surface
     │ └─────────┘  │
      ╲ ombre_sud  ╱         ← Planet Base (ombre)
       ╲─────────╱
```

### Forme de la planète

**Choix artistique** : on peut choisir entre :

**Option A — Vue "lune"** (cercle plein) :
- La planète est un **disque** de face
- Rotation visible par le déplacement lent des continents
- Plus simple à rendre, plus cinégénique

**Option B — Vue "globe"** (projection sphérique simplifiée) :
- Effet de perspective (bords plus sombres)
- Illusion de 3D
- Plus complexe mais plus immersif

**Recommandation** : **Option A** pour le MVP, évoluer vers B si temps.

### Dimensions

```
Résolution logique : 640×360 (16:9)
Planète centrée au milieu
Rayon de la planète : 120-140 pixels (laisse de la marge pour l'atmosphère)
Position : (320, 180) environ
```

### Texture de base

Chaque âge a une **texture de planète de base** différente :

```typescript
const PLANET_BASE_TEXTURES = {
  'I': 'planet_molten',        // Rouge/orange avec craquelures
  'II': 'planet_ocean',         // Principalement bleu
  'III': 'planet_protozoic',    // Bleu avec teintes vertes/violettes
  'IV': 'planet_lush',          // Vert/bleu équilibré
  'V': 'planet_tribal',         // Continents verts, petits points de feu
  'VI': 'planet_civilized',     // Lumières urbaines nocturnes
  'VII': 'planet_spatial'       // Lumières + satellites orbitaux
};
```

### Évolution de la planète

La texture **ne se change pas brutalement** entre les âges. Transition douce :

```typescript
class PlanetRenderer {
  private currentTexture: PIXI.Texture;
  private nextTexture: PIXI.Texture | null;
  private transitionProgress: number = 0;
  
  transitionToAge(newAge: Age) {
    this.nextTexture = loadTexture(PLANET_BASE_TEXTURES[newAge]);
    this.transitionProgress = 0;
    // Sur ~5 secondes, crossfade entre les deux textures
  }
  
  update(deltaTime: number) {
    if (this.nextTexture && this.transitionProgress < 1) {
      this.transitionProgress += deltaTime / 5000;
      
      // Crossfade visuel
      this.currentSprite.alpha = 1 - this.transitionProgress;
      this.nextSprite.alpha = this.transitionProgress;
      
      if (this.transitionProgress >= 1) {
        this.currentTexture = this.nextTexture;
        this.nextTexture = null;
      }
    }
  }
}
```

### Biomes dessinés

Par-dessus la texture de base, des **patches de biomes** sont dessinés :

```typescript
interface BiomePatch {
  biome: BiomeType;            // forest, desert, etc.
  region: Region;
  points: Point[];             // Polygone qui définit la zone
  color: Color;                // Couleur dominante
}

class BiomeRenderer {
  renderBiome(patch: BiomePatch) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(toHex(patch.color));
    graphics.drawPolygon(patch.points);
    graphics.endFill();
    
    // Masquer par la forme de la planète
    graphics.mask = this.planetMask;
    
    this.layerManager.add('terrain', graphics);
  }
}
```

### Masquage par la planète

**Règle critique** : rien ne doit dépasser la forme de la planète. Tous les biomes, entités, effets de surface sont **masqués** par un cercle aligné avec la planète.

```typescript
// Créer le masque une fois
const planetMask = new PIXI.Graphics();
planetMask.beginFill(0xFFFFFF);
planetMask.drawCircle(320, 180, 130);
planetMask.endFill();

// Appliquer à tous les layers de surface
terrainLayer.mask = planetMask;
entitiesSurfaceLayer.mask = planetMask;
```

### Ombrage

La planète est éclairée par le soleil (on considère qu'il est à gauche) :
- Côté gauche : pleine luminosité
- Côté droit : ombre progressive (gradient)

```typescript
// Appliquer un filtre de shading
const shadingFilter = new PIXI.Filter(null, SHADING_SHADER, {
  lightDirection: [1, 0], // Soleil à gauche
  ambientLight: 0.4,
  shadowStrength: 0.5
});

planetContainer.filters = [shadingFilter];
```

---

## Projection adaptative au zoom

### Principe

Genesis Live utilise **deux projections 2D** qui cohabitent, pilotées par le niveau de zoom de la caméra :

| Zoom | Mode | Ce qu'on voit |
|------|------|---------------|
| `< 0.8` (far) | **Globe** | Toute la planète (disque) — observation cosmique |
| `0.8 – 1.6` (mid) | **Transition** | Crossfade + morph entre les deux |
| `> 1.6` (near) | **Isométrique** | Une région de surface en iso 2:1 — observation locale |

Seuils indicatifs, à régler en playtest.

### Vue globe (far)

Décrite intégralement dans [Rendu de la planète](#rendu-de-la-planète). Projection frontale, masque circulaire, rotation lente, biomes dessinés comme polygones peints sur le disque.

**Ce qui est rendu** :
- Disque planète, atmosphère, nuages globaux
- Patches de biomes (polygones grossiers)
- Entités : **agrégats seulement** (1 sprite = toute une population d'une région)
- Cités : points lumineux ou icônes symboliques

### Vue isométrique (near)

**Projection** : isométrique 2:1 (angle classique, 1 unité X = 32px horizontal, 1 unité Y = 16px vertical).

**Grille de tuiles** :
- Taille de tile : **32×16 pixels** (losange)
- Ratio 2:1 standard, compatible `roundPixels: true`
- Format "diamond" (pointe en haut) ou "flat" (pointe horizontale) — **diamond** par défaut

**Conversion coordonnées monde → écran** :

```typescript
function worldToIso(x: number, y: number, z: number = 0): Point {
  return {
    x: (x - y) * (TILE_WIDTH / 2),
    y: (x + y) * (TILE_HEIGHT / 2) - z * TILE_HEIGHT
  };
}

const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;
```

**Ancrage des sprites** : pivot en bas-centre du losange (pieds de la créature / base du bâtiment sur le sol de la tile).

**Z-sorting** :
- Tri par `(worldY + worldX + worldZ)` croissant
- Les sprites plus proches (somme plus grande) sont dessinés devant
- Utiliser `PIXI.Container.sortableChildren = true` + `zIndex` dynamique

**Footprint des bâtiments** :
- Cabane : 1×1 tile
- Maison : 1×1 ou 2×2
- Temple : 3×3
- Château : 4×4 à 6×6
- Mégastructure : 10×10+

**Taille de la région chargée** :
- Chunk actif : 64×64 tiles (2048×1024 pixels logiques)
- Hors chunk : culling total
- Bord du chunk : fade-out vers la couleur du biome dominant

### Transition globe → iso

**Déclencheurs** :
- Zoom manuel du viewer (si UI autorise)
- [Zoom cinématique](#caméra-cinématique) sur un événement majeur
- `!observe` sur une entité/cité

**Séquence (~1.5 s)** :

```
t=0.0 : caméra commence à zoomer sur un point de la planète (lat/lon)
t=0.3 : projection globe atteint zoom max (0.8 → 1.6 en scale)
t=0.5 : début crossfade — alpha globe diminue, alpha iso augmente
t=0.8 : morph géométrique — le morceau de disque "déplie" en plan iso
        (shader subtil : distorsion sphérique → plan)
t=1.2 : crossfade terminé, seule la vue iso est visible
t=1.5 : caméra iso stabilisée, chunk iso complètement chargé
```

**Implémentation MVP** : crossfade pur (easeInOutCubic sur alpha), sans shader de morph. Le shader de morph est un polish optionnel.

```typescript
class ProjectionManager {
  private mode: 'globe' | 'transition' | 'iso' = 'globe';
  private blend: number = 0; // 0 = globe pur, 1 = iso pur
  
  update(zoom: number) {
    if (zoom < 0.8) {
      this.setMode('globe', 0);
    } else if (zoom > 1.6) {
      this.setMode('iso', 1);
    } else {
      this.setMode('transition', (zoom - 0.8) / 0.8);
    }
    
    this.globeScene.alpha = 1 - this.blend;
    this.isoScene.alpha = this.blend;
    this.globeScene.visible = this.blend < 1;
    this.isoScene.visible = this.blend > 0;
  }
}
```

### Transition iso → globe

Séquence inverse. Au dézoom, le chunk iso s'atténue, la vue globe reprend le dessus. Position reprise : la région iso correspond à une lat/lon sur le globe.

### Conversion région iso ↔ lat/lon planète

Chaque **région simulée** (voir [data_model.md](data_model.md)) a une position `(latitude, longitude)` sur le globe et une **entrée iso** associée (chunk 64×64 tiles) généré procéduralement à partir du biome et des entités présentes dans la région.

```typescript
// Schéma Region complet dans data_model.md §Region
interface Region {
  coordinates: { lat: number; lng: number };  // lat [-90,90], lng [-180,180]
  biome: BiomeType;
  isoChunk?: IsoChunk; // chargé paresseusement au premier zoom
}
```

### Vue spatiale Âge VII

**4ᵉ niveau de projection** : dézoom au-delà du globe (`zoom < 0.3`). La planète devient un petit disque, on voit le Soleil-Témoin, la Lune Jumelle, les satellites, la Ceinture Primordiale ([genesis_live_lore.md:53-57](genesis_live_lore.md#L53-L57)).

| Zoom | Projection |
|------|-----------|
| `< 0.3` | **Spatiale** (planète + astres, Âge VII) |
| `0.3 – 0.8` | **Globe** |
| `0.8 – 1.6` | **Transition** |
| `> 1.6` | **Isométrique** |

### Layers revisités selon projection

Les layers définis dans [Système de couches](#système-de-couches-layers) restent valides mais leur contenu diffère selon le mode :

| Layer | Mode globe | Mode iso |
|-------|-----------|----------|
| Background | Espace, étoiles | Ciel / vide sous la grille |
| Planet Base | Disque planète | (inutilisé, alpha 0) |
| Terrain | Patches de biomes polygonaux, masque circulaire | **Tilemap iso** des tiles de sol |
| Entities Surface | Agrégats dispersés | Sprites iso individuels z-sortés |
| Atmosphere | Nuages globaux | Nuages locaux plus petits, ombres au sol |
| Entities Aerial | Orbites, satellites symboliques | Oiseaux iso volant au-dessus du tilemap |
| FX Foreground | Pluie globale low-res | Pluie iso dense, particules détaillées |

**Règle** : le masque circulaire (ligne 369-381) **ne s'applique qu'en mode globe**. En iso, pas de masque — le chunk est rectangulaire avec fade aux bords.

### Assets requis

**En plus des textures planète** ([Texture de base](#texture-de-base)) :

- **Tilesets iso** par biome : `tileset_iso_forest.png`, `tileset_iso_desert.png`, etc. (~40-60 tuiles chacun)
- **Sprites iso** de créatures : 4 orientations (NE, NW, SE, SW) si animées
- **Sprites iso** de bâtiments : 1 orientation, footprints variables
- **Atlas** : `iso_<biome>_atlas.png` par biome + `iso_entities_atlas.png`

À ajouter dans `frontend/src/assets/sprites/iso/` ([architecture.md:309](architecture.md#L309)).

---

## Rendu des entités

### Règles générales

**1. Scaling**
Les créatures apparaissent **beaucoup plus grandes** que leur taille réelle. Une fourmi microscopique est représentée par un sprite de 4×4 pixels (sinon invisible).

**Règle de tailles** (en pixels) :
- Microbes : 2-4 px
- Insectes/petits animaux : 4-8 px
- Animaux moyens : 8-16 px
- Gros animaux : 16-32 px
- Créatures géantes : 32-64 px

**2. Représentation symbolique**
Un sprite ne représente **pas une créature individuelle** mais un **groupe** ou une **population**. 1 sprite = "plusieurs milliers d'individus".

**3. Densité visuelle**
- Si population < seuil → 1 sprite
- Population modérée → 3-5 sprites dispersés
- Population dense → 10+ sprites
- Jamais plus de ~50 sprites du même type à l'écran (perf)

### Rendu des espèces (Âge IV)

```typescript
class SpeciesRenderer {
  render(species: Species, region: Region) {
    const populationFactor = Math.log10(species.population + 1);
    const spritesToShow = Math.min(Math.floor(populationFactor), 20);
    
    for (let i = 0; i < spritesToShow; i++) {
      const sprite = PIXI.Sprite.from(this.getTextureFor(species));
      
      // Position aléatoire dans la région
      const pos = this.randomPositionIn(region);
      sprite.x = pos.x;
      sprite.y = pos.y;
      
      // Couleur héritée
      sprite.tint = toHex(species.primaryColor);
      
      // Taille selon les traits
      const scale = this.calculateScale(species.traits.size);
      sprite.scale.set(scale);
      
      // Animation
      this.animateIdle(sprite, species);
      
      this.layerManager.add('entitiesSurface', sprite);
    }
  }
  
  private calculateScale(sizeInMeters: number): number {
    // Log scale : 0.001m = 0.5, 1m = 1, 10m = 1.5, 50m = 2
    return Math.max(0.5, Math.min(2, 1 + Math.log10(sizeInMeters) * 0.3));
  }
}
```

### Rendu des cités (Âge VI)

**Une cité est composite** : bâtiments empilés autour d'un centre.

```
     ⌂ ⌂ ⌂              ← maisons secondaires
   ⌂ ☗  ⌂                ← centre (temple ou mairie)
 ⌂ ⌂ ⌂ ⌂ ⌂            ← bordure urbaine
```

**Évolution visuelle selon la population** :

```typescript
const CITY_VISUAL_STAGES = {
  SMALL: { minPop: 0, maxPop: 500, sprites: ['hut', 'hut', 'hut'] },
  MEDIUM: { minPop: 500, maxPop: 5000, sprites: ['house', 'temple', 'house', 'house'] },
  LARGE: { minPop: 5000, maxPop: 50000, sprites: ['castle', 'cathedral', 'houses_block', 'walls'] },
  HUGE: { minPop: 50000, maxPop: 1000000, sprites: ['skyscraper', 'mega_structure', 'slums', 'highway'] },
  MEGA: { minPop: 1000000, maxPop: Infinity, sprites: ['arcology', 'space_elevator', 'dome'] }
};
```

**Nom de la cité affiché** : seulement si la cité est **importante** ou **zoom-in** (évite le chaos textuel).

### Rendu des créatures animées

Chaque créature a plusieurs animations :

```typescript
interface CreatureAnimations {
  idle: AnimationClip;         // Respire, bouge légèrement
  move: AnimationClip;         // Déplacement
  attack?: AnimationClip;      // Si prédateur
  die: AnimationClip;          // À la mort
  birth?: AnimationClip;       // À la naissance (rare)
}

class AnimatedSprite {
  private frames: PIXI.Texture[];
  private currentFrame: number = 0;
  private frameTime: number = 100; // ms par frame
  private lastFrameChange: number = 0;
  
  update(deltaTime: number) {
    this.lastFrameChange += deltaTime;
    
    if (this.lastFrameChange >= this.frameTime) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.sprite.texture = this.frames[this.currentFrame];
      this.lastFrameChange = 0;
    }
  }
}
```

### Indicateurs visuels

Certaines entités ont des **indicateurs visuels** spéciaux :

- **Créature fondée par un viewer** : petit **liseré de couleur** autour du sprite (couleur du viewer)
- **Espèce apex predator** : petite **couronne** au-dessus
- **Cité capitale** : **bannière flottante** au-dessus
- **Empire dominant** : **halo doré** autour de ses cités
- **Créature légendaire** : **particules dorées** autour
- **Religion dominante** : **icône religieuse** au-dessus des cités converties

### Pooling de sprites

Pour éviter de créer/détruire des milliers de sprites :

```typescript
class SpritePool {
  private available: PIXI.Sprite[] = [];
  private inUse: Set<PIXI.Sprite> = new Set();
  
  acquire(texture: PIXI.Texture): PIXI.Sprite {
    let sprite = this.available.pop();
    if (!sprite) {
      sprite = new PIXI.Sprite(texture);
    } else {
      sprite.texture = texture;
    }
    this.inUse.add(sprite);
    return sprite;
  }
  
  release(sprite: PIXI.Sprite) {
    this.inUse.delete(sprite);
    sprite.removeFromParent();
    this.available.push(sprite);
  }
}
```

---

## Caméra cinématique

### Les modes de caméra

**1. Vue globale (default)** — *projection globe*
Caméra fixe, toute la planète visible. Rotation lente sur elle-même (effet de globe qui tourne). Environ 80% du temps.

**2. Zoom cinématique** — *bascule globe → iso*
Déclenché par un événement notable. La caméra zoome sur la zone en traversant le seuil (voir [Transition globe → iso](#transition-globe--iso)) : on passe donc **en projection isométrique** sur la région concernée, 10-30 secondes, puis dézoom et retour à la vue globale.

**3. Vue rapprochée d'une entité** — *projection iso*
Focus sur une créature ou cité spécifique, systématiquement **en iso**. Manuel via commande `!observe` ou auto.

**4. Vue spatiale (Âge VII)** — *projection spatiale*
Caméra dézoome **au-delà** du globe pour inclure satellites, stations, Soleil-Témoin, Lune Jumelle (voir [Vue spatiale Âge VII](#vue-spatiale-âge-vii)).

**5. Cinématique scriptée**
Pour les moments majeurs : transition d'âge, apocalypse. Séquences prévues. Peut traverser plusieurs projections dans une même séquence (ex. zoom iso sur un volcan qui explose → dézoom globe → dézoom spatial).

### Logique de la caméra auto

```typescript
class CinematicCamera {
  private currentMode: CameraMode = 'global';
  private target: CameraTarget | null = null;
  private timeInCurrentMode: number = 0;
  
  update(deltaTime: number, worldState: WorldState) {
    this.timeInCurrentMode += deltaTime;
    
    // Logique de switching automatique
    if (this.currentMode === 'global' && this.timeInCurrentMode > 20000) {
      // Après 20s de vue globale, chercher un événement intéressant
      const target = this.findInterestingTarget(worldState);
      if (target) {
        this.focusOn(target);
      }
    }
    
    if (this.currentMode === 'focus' && this.timeInCurrentMode > 15000) {
      // Après 15s de focus, revenir à la vue globale
      this.returnToGlobal();
    }
  }
  
  private findInterestingTarget(state: WorldState): CameraTarget | null {
    // Priorités :
    // 1. Événement majeur en cours (guerre, éruption, apocalypse)
    // 2. Viewer actif récent
    // 3. Entité en train de muter ou se reproduire
    // 4. Cité nouvellement fondée
    // 5. Rien de particulier → reste en global
    
    const recentEvents = state.getRecentEvents(5000);
    const majorEvent = recentEvents.find(e => e.severity === 'major');
    if (majorEvent) return { type: 'event', entity: majorEvent };
    
    // ... autres priorités
  }
}
```

### Transitions de caméra

**Easing** : toujours smooth, jamais brutal (sauf shake d'apocalypse).

```typescript
class CameraTransition {
  animateZoom(fromZoom: number, toZoom: number, duration: number) {
    const easing = EasingFunctions.easeInOutCubic;
    // Interpolation sur la durée
  }
  
  animatePan(fromPos: Point, toPos: Point, duration: number) {
    // Même logique
  }
}
```

### Effets de caméra

**Shake** : pour les événements violents
```typescript
triggerShake(intensity: 'light' | 'medium' | 'heavy', durationMs: number) {
  // Oscillation aléatoire de la caméra
}
```

**Zoom dramatique** : pour les moments épiques
- Zoom rapide d'un coup
- Maintien
- Retour lent

**Slow motion** : pour les apocalypses
- Le temps de la simulation continue normalement
- Mais les effets visuels ralentissent dramatiquement

### Règles de composition

**Règle des tiers** : les points d'intérêt sont placés aux intersections des lignes de tiers (comme en photo).

**Headroom** : toujours de l'espace "vide" autour du sujet principal (évite l'étouffement visuel).

**Guide du regard** : les éléments environnementaux (nuages, particules) doivent guider le regard vers le sujet.

---

## Effets de particules

### Moteur de particules

Utilisation de `@pixi/particle-emitter` ou implémentation custom légère.

### Effets standards

**Pluie** :
```typescript
const rainEmitter = {
  particleCount: 200,
  spawnRate: 20,  // par seconde
  lifespan: 2000, // ms
  startPos: { y: -20 }, // haut de l'écran
  velocity: { x: -10, y: 400 },
  gravity: 0,
  color: '#7FC0E0', // sky-water
  alpha: { start: 0.8, end: 0 },
  scale: { start: 1, end: 0.5 },
  sprite: 'raindrop.png'
};
```

**Neige** :
```typescript
const snowEmitter = {
  particleCount: 100,
  spawnRate: 10,
  lifespan: 5000,
  startPos: { y: -20 },
  velocity: { x: -5, y: 50 },
  gravity: 10,
  color: '#F0F0F5', // light
  alpha: 1,
  scale: { start: 1, end: 0.3 },
  sprite: 'snowflake.png',
  rotationSpeed: { min: -2, max: 2 }
};
```

**Cendres volcaniques** :
```typescript
const ashEmitter = {
  particleCount: 300,
  spawnRate: 30,
  lifespan: 4000,
  startPos: { /* près du volcan */ },
  velocity: { x: 30, y: -100 },
  gravity: 20,
  color: '#5C5040', // ash-storm
  alpha: { start: 0.9, end: 0 },
  sprite: 'ash_particle.png',
  turbulence: 50
};
```

### Effets d'événements majeurs

**Éruption volcanique** :
- Jet de lave (particules orange/rouge)
- Fumée noire qui monte
- Roches éjectées (plus grosses particules)
- Shake de caméra

**Impact de météorite** :
- Trainée dans le ciel (avant)
- Flash blanc à l'impact
- Onde de choc circulaire
- Cratère qui apparaît progressivement
- Poussière qui retombe pendant 30s

**Grande guerre** :
- Fumée au-dessus des cités en conflit
- Éclairs orangés (explosions)
- Particules de débris

**Apparition d'une espèce légendaire** :
- Halo doré
- Particules qui montent comme des étoiles

### Effets d'ambiance

**Poussière/brume** : très subtile, ajoute de la profondeur atmosphérique
**Étincelles nocturnes** : lucioles, reflets d'eau sous la lune
**Courants marins** : particules bleues qui suivent les courants océaniques

### Budget de particules

```
Total particules actives : max 2000 simultanées
Priorité haute (événements visibles) : 60%
Ambiance : 30%
Réserve : 10%
```

Si on dépasse → ne plus émettre les effets d'ambiance, garder seulement les majeurs.

---

## Transitions et animations

### Transitions entre âges

**Cinématique dédiée** à chaque transition (5-10 secondes) :

**Âge I → II** : "L'Âge des Eaux"
- Caméra recule
- Nuages massifs qui se forment
- Pluie torrentielle sur toute la planète
- Texture se remplit de bleu progressivement
- Titre "ÂGE II — LES EAUX" en fondu

**Âge II → III** : "L'Âge des Germes"
- Zoom sur un océan
- Particules microscopiques apparaissent
- Changement de teinte de l'eau (nuances vertes/violettes)
- Musique évolue

**Âge III → IV** : "Le Grouillement"
- Zoom sur la surface
- Premières créatures apparaissent
- Végétation qui pousse en timelapse
- Scène qui s'anime progressivement

**Âge IV → V** : "L'Éveil"
- Focus sur un groupe de créatures
- Un œil qui s'ouvre (symbolique)
- Premiers feux visibles au loin
- Transition vers vue plus proche

**Âge V → VI** : "Les Cités"
- Pan sur une tribu qui s'agrandit
- Première cité apparaît au centre
- Murs se construisent
- Autres cités apparaissent autour

**Âge VI → VII** : "L'Ascension"
- Caméra monte progressivement
- Satellites apparaissent en orbite
- Vue d'ensemble devient spatiale
- Étoiles plus nombreuses

### Animations d'UI

**Arrivée de notification** :
- Fade in + slide depuis le bord droit
- Durée : 300ms
- Easing : easeOutCubic

**Disparition** :
- Fade out + slide vers le haut
- Durée : 500ms

**Pulse d'attention** :
- Scale 1 → 1.1 → 1
- Boucle
- Pour les events rares à ne pas manquer

### Animations de sprites

**Idle (par défaut)** :
- Légère oscillation verticale (breathing)
- 0.5-1 pixel d'amplitude
- Période : 2-3 secondes

**Mouvement** :
- Marche : animation 4 frames
- Course : animation 4 frames plus rapides
- Vol : animation 4 frames, glissement horizontal

**Mort** :
- Flash rouge
- Fade out 500ms
- Petite explosion de particules

**Naissance** :
- Apparition en fondu depuis invisible
- Petit effet d'étincelles

---

## Cycle jour/nuit

### Importance narrative

Un cycle jour/nuit visible rend le stream **rythmé** et **rassurant** (cycle prévisible au milieu du chaos émergent).

### Durée

**Cycle complet** : ~5 minutes de temps réel
- Jour : 2 minutes
- Crépuscule : 30 secondes
- Nuit : 2 minutes
- Aube : 30 secondes

### Implémentation

```typescript
class DayNightCycle {
  private cycleDurationMs = 5 * 60 * 1000; // 5 min
  private startTime: number;
  
  getCurrentPhase(): DayNightPhase {
    const elapsed = (Date.now() - this.startTime) % this.cycleDurationMs;
    const progress = elapsed / this.cycleDurationMs;
    
    if (progress < 0.4) return 'day';
    if (progress < 0.5) return 'dusk';
    if (progress < 0.9) return 'night';
    return 'dawn';
  }
  
  getAmbientColor(): Color {
    const phase = this.getCurrentPhase();
    // Mix entre les couleurs de jour et de nuit
    // selon la progression dans le cycle
  }
}
```

### Effets visuels selon la phase

**Jour** :
- Palette claire
- Pleine visibilité
- Musique plus dynamique

**Crépuscule** :
- Teintes oranges/roses
- Ombres allongées
- Transition sonore

**Nuit** :
- Palette sombre
- Étoiles visibles
- **Les cités s'illuminent** (gros effet visuel)
- Animaux nocturnes visibles
- Musique plus calme

**Aube** :
- Lumière froide qui devient chaude
- Brume matinale
- Transition progressive

### Ne pas imposer

Certains âges ne montrent pas le cycle de façon uniforme :
- **Âge I** : pas de cycle (trop de feu partout)
- **Âge II** : cycle très léger (pas grand chose à éclairer)
- **Âges III-VII** : cycle complet

### Shader de coloration globale

```glsl
// ambient_shader.glsl
uniform vec3 ambientColor;
uniform float intensity;

void main() {
  vec4 texColor = texture2D(uSampler, vTextureCoord);
  vec3 finalColor = mix(texColor.rgb, texColor.rgb * ambientColor, intensity);
  gl_FragColor = vec4(finalColor, texColor.a);
}
```

---

## HUD et overlays

### Architecture HUD

Le HUD est **HTML/CSS**, superposé sur le canvas Pixi. Ce choix permet :
- Lisibilité du texte garantie (pas de rasterization)
- Interactivité facile (hover, clicks)
- Animations CSS fluides
- Accessibilité (screen readers)

### Zones du HUD

```
┌────────────────────────────────────────────────────┐
│ [Cycle 7] [Âge IV]          [Live indicator]       │ ← Top bar
├────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│   [Planet rendering]                               │
│                                                     │
│                                                     │
│ ┌──────────────┐                  ┌──────────────┐ │
│ │Status panel  │                  │ Top viewers  │ │
│ │- Temp: 15°C  │                  │ @Tom (12)    │ │
│ │- Pop: 1.2B   │                  │ @Mia (8)     │ │
│ │- Tech: 6     │                  │ @Bacon (5)   │ │
│ └──────────────┘                  └──────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Event feed                                      │ │
│ │ • @Tom a fait pleuvoir sur le continent nord    │ │
│ │ • Nouvelle espèce : Tomidae (intelligente!)     │ │
│ │ • @Mia fonde la cité Miapolis                   │ │
│ └─────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### Composants HTML

**Top bar** (toujours visible) :
```html
<div class="hud-top-bar">
  <div class="cycle-counter">Cycle 7</div>
  <div class="age-indicator">
    <span class="age-symbol">🜁</span>
    <span class="age-name">Le Grouillement</span>
  </div>
  <div class="planet-name">Mundus-Mia</div>
  <div class="pressure-gauge">
    <div class="pressure-fill" style="width: 45%"></div>
  </div>
</div>
```

**Status panel** (gauche) :
```html
<div class="hud-status-panel">
  <div class="status-row">
    <span class="status-icon">🌡️</span>
    <span class="status-label">15°C</span>
  </div>
  <!-- ... autres stats -->
</div>
```

**Event feed** (bas) :
- Max 5 événements visibles
- Auto-scroll quand nouveau
- Animations d'apparition/disparition
- Filtrage par severity

### Notifications temporaires

**Titre gagné** (centre de l'écran) :
```
┌──────────────────────────────┐
│  🏆 @Tom                     │
│  LE FORGERON                 │
└──────────────────────────────┘
```
- Apparition : 500ms
- Maintien : 3 secondes
- Disparition : 1s

**Annonce d'âge** (plein écran) :
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          🜁
     ÂGE IV
  LE GROUILLEMENT
 "Les océans grouillent..."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- Fondu noir → texte qui apparaît → fondu → retour
- Durée totale : 8-10 secondes

**Alerte apocalypse** :
- Banner rouge pulsant en haut
- Son d'alerte
- Gel temporaire du HUD normal

### Responsive

Le HUD doit s'adapter à la taille du stream :
- **1920×1080** (standard streaming) : layout normal
- **720p** : réduction des marges
- **Mobile** : version dégradée (pour viewers mobiles)

### Accessibilité

**Contraste** : toujours suffisant (WCAG AA minimum)
**Tailles de police** : minimum 14px
**Option "réduire mouvement"** : désactive certaines animations pour les viewers sensibles
**Screen readers** : les événements majeurs sont annoncés via `aria-live`

---

## Performance et optimisation

### Cibles de performance

**FPS** : 60 stable, jamais en dessous de 30
**Latence de rendu** : < 16ms par frame (60 FPS)
**Utilisation mémoire** : < 500 MB côté client
**Consommation CPU** : < 30% sur une machine moyenne

### Techniques d'optimisation

**1. Culling (élimination de l'invisible)**
Ne pas rendre ce qui est hors-écran.

```typescript
function isVisible(sprite: PIXI.Sprite, camera: Camera): boolean {
  const bounds = sprite.getBounds();
  return !(bounds.right < camera.left ||
           bounds.left > camera.right ||
           bounds.bottom < camera.top ||
           bounds.top > camera.bottom);
}
```

**2. LOD (Level of Detail) — lié à la projection**
Le niveau de détail suit directement la [projection adaptative au zoom](#projection-adaptative-au-zoom). En globe, les créatures sont des agrégats symboliques ; en iso, chaque groupe a son sprite individuel.

```typescript
class LODManager {
  getDetailLevel(cameraZoom: number): DetailLevel {
    if (cameraZoom < 0.3) return 'spatial'; // Vue spatiale (Âge VII)
    if (cameraZoom < 0.8) return 'low';     // Globe
    if (cameraZoom < 1.6) return 'medium';  // Transition globe/iso
    return 'high';                          // Iso rapprochée
  }
  
  shouldRender(entity: Entity, level: DetailLevel): boolean {
    if (level === 'spatial') {
      // Vue spatiale : seules les méga-structures orbitales et la planète comptent
      return entity.type === 'orbital' || entity.type === 'planet';
    }
    if (level === 'low' && entity.type === 'creature') {
      // Globe : seulement les agrégats de grosses populations
      return entity.populationRank >= 3;
    }
    // Iso : tout ce qui est dans le chunk actif est rendu
    return true;
  }
}
```

**3. Object Pooling**
Réutiliser les sprites plutôt que de les créer/détruire.

**4. Batching**
Pixi fait ça automatiquement si les sprites partagent la même texture. **Organiser les sprites par atlas** pour optimiser.

**5. Atlas de textures**
Tous les sprites liés sont regroupés dans une seule texture atlas :

*Atlas globe* :
- `planet_base_atlas.png` : textures planète par âge
- `biomes_globe_atlas.png` : patches polygonaux de biomes (mode globe)
- `effects_atlas.png` : toutes les particules
- `ui_atlas.png` : tous les icônes

*Atlas iso* (chargés paresseusement quand on bascule en iso) :
- `iso_tiles_<biome>_atlas.png` : un atlas de tuiles par biome (forêt, désert, etc.)
- `iso_creatures_atlas.png` : toutes les créatures en iso (4 orientations si animées)
- `iso_cities_atlas.png` : tous les bâtiments iso

**6. Spatial indexing**
Utiliser un **quadtree** pour les entités — requêtes "qu'est-ce qui est visible ?" en O(log n) au lieu de O(n).

**7. Throttling**
Certaines mises à jour ne doivent pas être faites chaque frame :
- Update des positions d'entités : chaque frame (OK)
- Update du HUD : 10 fois/seconde suffisent
- Update des stats : 2 fois/seconde
- Update du HistoryLog affiché : quand nouveau seulement

### Profiling

**Métriques à surveiller** (dev tools) :
- FPS compteur (Pixi a un utilitaire)
- Nombre de draw calls (< 100 idéal)
- Nombre de sprites actifs
- Mémoire GPU utilisée

**Outils** :
- Chrome DevTools Performance tab
- Pixi.js devtools
- `stats.js` pour compteur FPS visible

### Plan de dégradation gracieuse

Si la perf chute :

**Niveau 1** (FPS < 50) :
- Réduire les particules d'ambiance de 50%
- Désactiver certains effets post-processing

**Niveau 2** (FPS < 40) :
- Réduire les sprites d'entités de 30%
- Désactiver le shake de caméra
- Simplifier l'éclairage

**Niveau 3** (FPS < 30, urgence) :
- Mode "basique" : rendu minimal
- Warning discret dans le HUD
- Log d'alerte vers le serveur

---

## Configuration du canvas

### Paramètres Pixi.js

```typescript
const app = new PIXI.Application({
  width: 1920,
  height: 1080,
  resolution: window.devicePixelRatio || 1,
  antialias: false,               // Pixel art → pas d'antialiasing
  backgroundAlpha: 0,             // Fond transparent (pour OBS)
  autoDensity: true,
  powerPreference: 'high-performance',
  
  // Pixel art specifics
  roundPixels: true,
  
  // Performance
  sharedLoader: true,
  sharedTicker: true
});
```

### Pixel art settings

**Anti-aliasing** : **OFF** (sinon ça devient flou)
**Texture scaling** : **nearest neighbor** (pas de lissage)
**Rendering** : à pixel-perfect dans la mesure du possible

```typescript
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;
```

### Texture loading

**Stratégie** :
1. **Pré-chargement total** au démarrage (assets critiques)
2. **Chargement à la demande** pour les assets rarement utilisés (apocalypses spécifiques)
3. **Atlas compilés** avec TexturePacker ou équivalent

```typescript
class AssetLoader {
  async preloadCritical(): Promise<void> {
    const criticalAssets = [
      'planet_textures.json',
      'biomes_atlas.json',
      'creatures_atlas.json',
      'ui_atlas.json'
    ];
    
    await Promise.all(criticalAssets.map(asset => PIXI.Assets.load(asset)));
  }
  
  async loadOnDemand(name: string): Promise<PIXI.Texture> {
    return await PIXI.Assets.load(name);
  }
}
```

---

## Responsive et formats de sortie

### Formats supportés

**Standard streaming** : 1920×1080 (16:9) — priorité absolue
**Vertical/mobile** : 1080×1920 — optionnel, pour TikTok Live etc.
**Custom** : paramétrable via config

### Rendu multi-scène

Pour supporter plusieurs formats, on **re-render** la scène dans différentes tailles :

```typescript
class MultiFormatRenderer {
  renderTo(format: 'landscape' | 'portrait' | 'square'): HTMLCanvasElement {
    const config = FORMAT_CONFIGS[format];
    return this.renderer.render({
      width: config.width,
      height: config.height,
      cameraAdjustment: config.cameraAdjustment
    });
  }
}
```

### OBS-ready

Pour que OBS capte proprement :

1. **Window mode** : la page s'ouvre dans un navigateur dédié (Chromium embedé recommandé)
2. **Background transparent** pour chroma key si besoin
3. **Pas d'animations CSS complexes** sur le HUD (peuvent causer des glitches à la capture)
4. **Refresh rate** : 30 FPS suffit pour OBS (économise la perf du streamer)

### Streaming settings recommandés pour OBS

```
Scene source : Window Capture sur le navigateur Genesis Live
Résolution output : 1920×1080
FPS : 30 ou 60
Bitrate : 4500-6000 kbps (selon audience)
Audio : capture du navigateur + micro si commentaire
```

---

## Scripts de test visuel

### Mode debug

Un **mode debug** accessible via `?debug=1` dans l'URL :
- Affiche les bounding boxes des entités
- Compteur FPS permanent
- Stats live (entités actives, sprites, draw calls)
- Grid de coordonnées
- Log des événements de rendu

### Tests visuels automatisés

**Screenshot snapshot** : à chaque release, capture automatique de scènes de référence pour détecter les régressions visuelles.

```typescript
// Script de test
async function captureReferenceScenes() {
  const scenes = [
    { age: 'I', preset: 'mid_age' },
    { age: 'II', preset: 'oceans_forming' },
    { age: 'IV', preset: 'peak_biodiversity' },
    { age: 'VI', preset: 'medieval_era' },
    { age: 'VII', preset: 'pre_singularity' },
    { event: 'apocalypse', type: 'nuclear_winter' }
  ];
  
  for (const scene of scenes) {
    await setupScene(scene);
    await waitForRender();
    const screenshot = await captureCanvas();
    saveAs(`reference_${scene.age || scene.event}.png`);
  }
}
```

### Mode "démo" rapide

Un mode qui fait défiler les 7 âges en 5 minutes (timelapse extrême), utilisé pour :
- Démonstrations / pitch
- Tests de performance
- Trailer / teaser

```typescript
class DemoMode {
  async runFullCycleDemo(durationMs: number = 5 * 60 * 1000) {
    const ageDuration = durationMs / 7;
    
    for (const age of AGES) {
      await this.jumpToAge(age);
      await this.sleep(ageDuration * 0.8);
      await this.triggerAgeTransition(age);
      await this.sleep(ageDuration * 0.2);
    }
    
    await this.triggerRandomApocalypse();
  }
}
```

### Panneau dev

Accessible via `?dev=1`, permet de :
- Forcer un événement (éruption, apocalypse, transition d'âge)
- Skip à un âge précis
- Ajouter/retirer des entités
- Modifier les paramètres de rendu en live
- Prendre des captures d'écran timestampées
- Télécharger un replay vidéo

---

## ✨ Conclusion

Le rendu est **le visage de Genesis Live**. C'est par lui que les viewers tombent amoureux du concept.

### Principes à ne jamais violer

1. **Cohérence visuelle** : une palette, un style, une identité
2. **Lisibilité** : un viewer comprend en 5 secondes ce qui se passe
3. **Performance** : 60 FPS stable toujours
4. **Transparence à OBS** : jamais de glitch de capture
5. **Accessibilité** : contraste, options, screen readers

### Principes à ajuster selon observations

1. **Seuils de bascule entre projections** (0.3 / 0.8 / 1.6 à régler en playtest)
2. **Densité d'entités à l'écran** (trop peu = vide, trop = chaos) — différent en globe vs iso
3. **Vitesse du cycle jour/nuit**
4. **Agressivité de la caméra cinématique** (fréquence des bascules globe → iso)
5. **Taille de tile iso** (32×16 par défaut, éventuellement 64×32 si trop petit à la lecture)

### Ordre de priorité d'implémentation

**Phase MVP** (Phase 2 roadmap) :
- [ ] Planète de base qui change de couleur
- [ ] 3-5 tiles de biomes
- [ ] HUD minimal
- [ ] Caméra statique

**Phase 2** (Phase 4-5 roadmap) :
- [ ] Layers complets
- [ ] Entités animées
- [ ] Caméra cinématique
- [ ] Effets de particules

**Phase polish** (Phase 5 roadmap) :
- [ ] Toutes les transitions d'âge
- [ ] Cycle jour/nuit
- [ ] Tous les effets d'apocalypse
- [ ] Post-processing

### Citation à retenir

> "Les gens pardonnent beaucoup de choses, mais pas la laideur."
> — *tout game designer digne de ce nom*

Ton rendu n'a pas besoin d'être le plus beau. Il a besoin d'être **cohérent, lisible, et chargé d'émotion**.

---

*Spécification de rendu — v1.0*
*Le visage du monde. À relire avant chaque refactor graphique majeur.*
