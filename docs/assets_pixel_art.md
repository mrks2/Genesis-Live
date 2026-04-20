# 🎨 GENESIS LIVE — Inventaire des assets pixel art

*Liste exhaustive de tous les sprites, tuiles, animations et effets visuels à produire pour le stream. Spec de production destinée aux graphistes et au mainteneur.*

---

## 📖 Table des matières

1. [Principes généraux](#principes-généraux)
2. [Conventions de production](#conventions-de-production)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Assets planétaires (mode globe)](#assets-planétaires-mode-globe)
5. [Assets isométriques (mode iso)](#assets-isométriques-mode-iso)
6. [Assets par âge](#assets-par-âge)
7. [Assets d'apocalypse](#assets-dapocalypse)
8. [Artefacts persistants](#artefacts-persistants)
9. [Effets & particules](#effets--particules)
10. [Cinématiques de transition](#cinématiques-de-transition)
11. [Cycle jour/nuit](#cycle-journuit)
12. [Indicateurs visuels d'entités](#indicateurs-visuels-dentités)
13. [UI / HUD / icônes](#ui--hud--icônes)
14. [Typographie](#typographie)
15. [Assets OBS / branding](#assets-obs--branding)
16. [Priorités d'implémentation](#priorités-dimplémentation)
17. [Budget estimatif](#budget-estimatif)
18. [Checklist de livraison](#checklist-de-livraison)

---

## Principes généraux

Ce document est la **source de vérité** pour la production graphique de Genesis Live. Il consolide les exigences dispersées dans [render_spec.md](render_spec.md), [color_palette.md](color_palette.md), [architecture.md](architecture.md) et [CONTRIBUTING.md §Graphiques](../CONTRIBUTING.md#contribuer-aux-assets-graphiques-audio).

### Les 4 règles qui priment sur tout le reste

1. **Palette stricte** : uniquement les 64 couleurs officielles de [color_palette.md](color_palette.md). Aucune couleur hors palette ne sera intégrée, sans exception.
2. **Deux projections cohabitent** : chaque entité a potentiellement une variante **globe** (vue cosmique, sprite symbolique petit) et une variante **iso** (tilemap rapproché, sprite détaillé). Voir [render_spec.md §Projection adaptative au zoom](render_spec.md#projection-adaptative-au-zoom).
3. **Lisibilité à 5 secondes** : un viewer qui arrive doit identifier l'âge et la situation sans explication. Pas de chaos visuel.
4. **Boucles parfaites** : toute animation doit boucler sans saut perceptible (pas de frame à soustraire entre la dernière et la première).

### Ce qui ne doit PAS être produit

- Couleurs hors palette (même pour un mockup)
- Sprites 3D ou pseudo-3D pré-rendus
- Sprites réalistes photographiques
- Références directes au monde réel (marques, personnalités, drapeaux, bâtiments identifiables)
- Contenu sexualisé, glorifiant la violence gratuite, ou contrevenant aux règles de [content_moderation.md](content_moderation.md)

---

## Conventions de production

### Résolution et rendu

| Paramètre | Valeur |
|-----------|--------|
| Résolution logique cible | 640×360 (16:9), upscalée à 1920×1080 |
| Tile isométrique | 32×16 pixels (ratio 2:1, format "diamond" pointe en haut) |
| Anti-aliasing | **OFF** — pixel art strict |
| Scaling mode | `NEAREST` (pas de lissage bilinéaire) |
| FPS d'animation | 10-12 FPS (pixel art traditionnel) |
| Background | Transparent (canal alpha) |

### Nommage des fichiers

Format : `<catégorie>_<nom>_<variante>.png` (cf. [CONTRIBUTING.md:240](../CONTRIBUTING.md#L240))

Exemples valides :

```text
planet_base_age4.png
biome_forest_patch.png
tileset_iso_desert.png
species_milavirex_idle.png
species_milavirex_walk_ne.png
city_stage_large_castle.png
fx_rain_drop.png
icon_title_forgeron.png
sprite_obelisque.png
```

### Formats de livraison

| Type | Format | Notes |
|------|--------|-------|
| Asset final | **PNG** avec transparence alpha | Pour intégration Pixi.js |
| Source d'édition | **Aseprite** (`.ase` / `.aseprite`) de préférence | Sinon : `.psd`, `.kra`, `.ora` |
| Palette | `palette.json` (source unique) + export `.ase`/`.pal` pour Aseprite | Voir [color_palette.md §Export](color_palette.md#export-et-intégration) |
| Atlas | Généré par **TexturePacker** ou équivalent | JSON + PNG agrégé |

### Orientation iso des entités animées

Les créatures animées en mode iso ont **4 orientations** : NE, NW, SE, SW (diagonales cardinales).
Suffixe dans le nom : `_ne`, `_nw`, `_se`, `_sw`.

Les bâtiments iso ont généralement **1 seule orientation** (symétrique ou pré-figée).

### Pivot et ancrage

| Élément | Pivot |
|---------|-------|
| Tile iso (sol) | Centre du losange |
| Créature iso | **Bas-centre** (les pieds sur le sol de la tile) |
| Bâtiment iso | **Bas-centre** de la tile centrale du footprint |
| Sprite globe | Centre du sprite |
| Particule | Centre du sprite |

### Licence des contributions

Tout asset contribué doit être **original** ou sous licence compatible : **CC0**, **CC-BY**, **MIT-like**. Le contributeur certifie la provenance dans la PR.

---

## Structure des dossiers

Extrait de [architecture.md §Organisation des fichiers](architecture.md#organisation-des-fichiers), appliqué aux assets graphiques :

```text
frontend/src/assets/
├── palette.json                       # 64 couleurs officielles
├── sprites/
│   ├── globe/                         # Vue dézoomée (disque planète)
│   │   ├── planet_base/               # 7 textures planète par âge
│   │   ├── biomes/                    # Patches polygonaux
│   │   ├── entities_aggregate/        # Agrégats symboliques (1 sprite = N créatures)
│   │   ├── cities_symbolic/           # Points lumineux, icônes
│   │   ├── orbital/                   # Satellites, stations (vue spatiale Âge VII)
│   │   └── atmosphere/                # Nuages globaux, couches
│   │
│   └── iso/                           # Vue rapprochée (tilemap 32×16)
│       ├── tilesets/                  # Tuiles de sol par biome
│       │   ├── forest/
│       │   ├── desert/
│       │   ├── ocean/
│       │   ├── jungle/
│       │   ├── tundra/
│       │   ├── savane/
│       │   ├── marais/
│       │   ├── montagne/
│       │   ├── volcan/
│       │   ├── lagon/
│       │   ├── recif/
│       │   ├── glacier/
│       │   └── corrupted/             # Biomes post-apocalypse
│       │
│       ├── creatures/                 # Animaux (Âges III-VII)
│       ├── plants/                    # Végétation
│       ├── tribes/                    # Éléments humanoïdes Âge V
│       ├── buildings/                 # Bâtiments Âges VI-VII
│       ├── ruins/                     # Ruines persistantes inter-cycles
│       ├── fossils/                   # Squelettes, traces de géants
│       └── artifacts/                 # Obélisque, Livre Brûlé, etc.
│
├── fx/
│   ├── particles/                     # Gouttes, flocons, cendres, étincelles
│   ├── weather/                       # Nuages, voiles météo
│   ├── events/                        # Éruption, impact, explosion
│   ├── apocalypse/                    # Effets pleine-planète par type
│   └── transitions/                   # Cinématiques d'âge
│
├── ui/
│   ├── hud_atlas.png                  # HUD statique (bordures, panneaux)
│   ├── icons/                         # Icônes de stats, d'événements
│   ├── titles/                        # Badges des 21 titres du Panthéon
│   ├── notifications/                 # Banners, toasts
│   └── cursors/                       # Si mode interactif prévu
│
└── fonts/                             # Cf. §Typographie
```

---

## Assets planétaires (mode globe)

### Texture de base de la planète par âge

Sprite unique rond/ovale, rayon **120-140 px** sur résolution logique 640×360. Centré en (320, 180). Masqué par un cercle pour que rien ne déborde.

| Fichier | Âge | Aspect |
|---------|-----|--------|
| `planet_base_age1.png` | I — Feu | Rouge/orange en fusion, craquelures de lave, surface qui « respire » |
| `planet_base_age2.png` | II — Eaux | Majoritairement bleu, continents bruns naissants, nuages blancs |
| `planet_base_age3.png` | III — Germes | Bleu avec teintes vertes/violettes selon souches dominantes |
| `planet_base_age4.png` | IV — Grouillement | Vert/bleu équilibré, zones de biomes marquées |
| `planet_base_age5.png` | V — Étincelles | Continents verts, petits points rouges (feux de tribu) |
| `planet_base_age6.png` | VI — Cités | Lumières urbaines nocturnes visibles, zones agricoles |
| `planet_base_age7.png` | VII — Vide | Lumières + halo orbital, petits satellites autour |

**Animations** : chaque texture a 2-4 frames pour une légère respiration / lueur. Loop ~3 s.

### Variantes altérées

| Fichier | Usage |
|---------|-------|
| `planet_base_post_impact.png` | Après Impact céleste : cratère + ciel obscurci |
| `planet_base_post_nuclear.png` | Après Hiver des cendres : gris, cratères multiples |
| `planet_base_post_greenhouse.png` | Après Étuve : océans évaporés, brun désertique |
| `planet_base_post_deluge.png` | Après Déluge final : entièrement bleue |
| `planet_base_post_oblivion.png` | Après Oubli : désaturation progressive |

### Patches de biomes (mode globe)

Sprites polygonaux souples dessinés par-dessus la texture de base. Un biome = un sprite peint avec la couleur dominante du biome, forme irrégulière. Taille variable (20×20 à 80×80 px).

| Fichier | Biome | Couleur dominante |
|---------|-------|-------------------|
| `biome_globe_forest.png` | Forêt | `forest` |
| `biome_globe_jungle.png` | Jungle | `dark-forest` + accents `mystic-green` |
| `biome_globe_desert.png` | Désert | `sand`, `pale-sand` |
| `biome_globe_tundra.png` | Toundra | `bone`, `foam` |
| `biome_globe_savane.png` | Savane | `pale-sand`, `grass` |
| `biome_globe_marais.png` | Marais | `moss`, `plague-green` |
| `biome_globe_montagne.png` | Montagnes | `stone`, `slate` |
| `biome_globe_volcan.png` | Volcan | `charcoal`, `ember` |
| `biome_globe_ocean.png` | Océan | `ocean`, `abyss` |
| `biome_globe_reef.png` | Récif | `turquoise`, accents `hot-pink` |
| `biome_globe_glacier.png` | Glacier | `foam`, `cold-blue` |

4-6 variantes par biome pour éviter la répétition visuelle.

### Atmosphère globale

| Fichier | Contenu |
|---------|---------|
| `atmosphere_clouds_layer1.png` | Nuages semi-transparents, 8 frames de dérive lente |
| `atmosphere_clouds_layer2.png` | Seconde couche, vitesse différente (parallaxe) |
| `atmosphere_storm_overlay.png` | Voile d'orage, opacité 40% |
| `atmosphere_eclipse.png` | Voile d'éclipse (événement rare) |

### Fond cosmique (Layer 0)

| Fichier | Contenu |
|---------|---------|
| `bg_stars_near.png` | Champ d'étoiles dense, parallaxe proche |
| `bg_stars_far.png` | Champ d'étoiles distantes, parallaxe lointaine |
| `bg_nebula_1.png` … `bg_nebula_3.png` | 3 nébuleuses d'arrière-plan, très subtiles |
| `bg_sun.png` | Soleil-Témoin, côté gauche, rayons discrets |
| `bg_moon.png` | Lune Jumelle, orbite lente autour de la planète |
| `bg_asteroid_belt.png` | Ceinture Primordiale (points scintillants), 4 frames |

---

## Assets isométriques (mode iso)

### Tilesets de sol par biome

**Tuile unité : 32×16 px, losange diamond.** Chaque biome a ~40-60 tuiles pour permettre les variations naturelles (rotations, orientations, bords, transitions).

Par biome, les tuiles couvrent :

- **Sol standard** (8-12 variantes pour bruit visuel)
- **Bords / transitions** vers les biomes voisins (4 directions × 2-3 styles)
- **Reliefs** : légères élévations, dépressions
- **Ressources** : arbres isolés, rochers, points d'eau
- **Détails** : fleurs, mousse, cailloux, traces

**Fichiers d'atlas** :

```text
tileset_iso_forest_atlas.png      # +40 tuiles
tileset_iso_jungle_atlas.png      # +50 tuiles
tileset_iso_desert_atlas.png      # +40 tuiles
tileset_iso_tundra_atlas.png      # +40 tuiles
tileset_iso_savane_atlas.png      # +40 tuiles
tileset_iso_marais_atlas.png      # +45 tuiles
tileset_iso_montagne_atlas.png    # +50 tuiles (dénivelés complexes)
tileset_iso_volcan_atlas.png      # +45 tuiles (lave animée)
tileset_iso_ocean_atlas.png       # +30 tuiles (vagues animées)
tileset_iso_reef_atlas.png        # +40 tuiles (coraux)
tileset_iso_glacier_atlas.png     # +40 tuiles
tileset_iso_corrupted_atlas.png   # +50 tuiles (post-apocalypse)
```

**Animations** : pour les tuiles « eau », « lave », « glace fissurée », 4 frames.

### Fade de bord de chunk

Le chunk actif fait 64×64 tuiles (2048×1024 px). Hors chunk → culling total. Aux bords, fade vers la couleur du biome dominant global.

| Fichier | Usage |
|---------|-------|
| `iso_chunk_fade_n.png` | Dégradé nord |
| `iso_chunk_fade_s.png` | Dégradé sud |
| `iso_chunk_fade_e.png` | Dégradé est |
| `iso_chunk_fade_w.png` | Dégradé ouest |

---

## Assets par âge

### Âge I — Le Feu (Hadéen)

Pas d'entités vivantes. Essentiellement des **effets** :

| Fichier | Description |
|---------|-------------|
| `fx_meteor_small.png` | Petite météorite (4-8 frames de chute) |
| `fx_meteor_medium.png` | Météorite moyenne + impact (12 frames) |
| `fx_meteor_giant.png` | Impacteur géant + onde de choc (16 frames) |
| `fx_volcano_erupt_light.png` | Éruption mineure (8 frames) |
| `fx_volcano_erupt_medium.png` | Éruption standard (12 frames) |
| `fx_volcano_erupt_massive.png` | Super-éruption (16 frames) |
| `fx_volcano_smoke_plume.png` | Colonne de fumée montante, loop |
| `fx_lava_pool.png` | Mare de lave, 4 frames de bullage |
| `fx_lava_river.png` | Coulée de lave, 4 frames |
| `fx_crack_crust.png` | Craquelure de croûte qui s'ouvre |
| `fx_first_drop.png` | « La Première Goutte », sprite iconique + halo |
| `fx_moon_formation.png` | Cinématique formation Lune Jumelle |
| `fx_ring_formation.png` | Apparition d'anneaux (cmd `!ring`), rare |

### Âge II — Les Eaux (Archéen)

| Fichier | Description |
|---------|-------------|
| `fx_rain_light.png` | Pluie fine (particule loop) |
| `fx_rain_normal.png` | Pluie modérée |
| `fx_rain_storm.png` | Orage (pluie dense + éclairs) |
| `fx_rain_monsoon.png` | Mousson diluvienne |
| `fx_lightning_bolt.png` | Éclair, 3 variantes de forme |
| `fx_tsunami_wave.png` | Vague géante, 8 frames |
| `fx_freeze_overlay.png` | Voile glaçant la planète, lent |
| `fx_continent_drift.png` | Tectonique, animation lente de dérive |
| `fx_current_arrow.png` | Courant océanique directionnel, 4 orientations |
| `fx_new_island.png` | Émergence d'île volcanique, 12 frames |
| `fx_tide_high.png` / `fx_tide_low.png` | Variation des marées |

### Âge III — Les Germes (Protérozoïque)

Les souches sont représentées par des **taches colorées dispersées** sur les océans. Teinte unique, forme irrégulière, animation lente de pulsation.

| Fichier | Description |
|---------|-------------|
| `strain_blob_small.png` | Tache microbienne minuscule (4×4), teinté dynamiquement |
| `strain_blob_medium.png` | Tache moyenne (8×8), 4 frames pulsation |
| `strain_blob_large.png` | Large colonie (16×16), 4 frames |
| `strain_bloom.png` | Éclosion spectaculaire (cmd `!merge` réussi), 12 frames |
| `strain_extinction_fade.png` | Souche qui s'éteint, 8 frames fade-out |
| `fx_oxygen_bubbles.png` | Bulles d'oxygénation (cmd `!oxygen`) |
| `fx_toxin_cloud.png` | Nuage toxique (cmd `!poison`), 4 frames |
| `fx_first_kiss.png` | Le Premier Baiser (fusion eucaryote), 16 frames |

**Note** : les teintes des souches sont appliquées par `tint` Pixi, pas en sprite unique. 1 sprite = toutes les couleurs possibles.

### Âge IV — Le Grouillement (Paléozoïque → Mésozoïque)

**La catégorie la plus volumineuse** : des centaines d'espèces peuvent être créées par cycle.

#### Créatures archétypales (10 base forms × 4 orientations × 4 animations)

Chaque **forme de base** est déclinée en 4 orientations iso (NE, NW, SE, SW) et 4 animations (idle, walk, attack, die). Les pseudos de viewers colorisent et combinent ces formes.

| Forme de base | Taille | Biome cible |
|---------------|--------|-------------|
| `creature_aquatic_small` | 4-8 px | océan, lagon |
| `creature_aquatic_medium` | 8-16 px | océan, récif |
| `creature_aquatic_large` | 16-32 px | océan profond |
| `creature_terrestrial_small` | 4-8 px | forêt, prairie |
| `creature_terrestrial_medium` | 8-16 px | savane, forêt |
| `creature_terrestrial_large` | 16-32 px | savane, montagne |
| `creature_terrestrial_giant` | 32-64 px | plaines (dinosaures) |
| `creature_aerial_small` | 4-8 px | ciel (insectes) |
| `creature_aerial_medium` | 8-16 px | ciel (oiseaux) |
| `creature_aerial_large` | 16-32 px | ciel (ptérosaures) |
| `creature_amphibian_small` | 4-8 px | marais, rivière |
| `creature_amphibian_medium` | 8-16 px | marais |

Par forme, fichiers :

```text
creature_terrestrial_medium_idle_ne.png     (4 frames)
creature_terrestrial_medium_idle_nw.png
creature_terrestrial_medium_idle_se.png
creature_terrestrial_medium_idle_sw.png
creature_terrestrial_medium_walk_ne.png     (4 frames)
creature_terrestrial_medium_walk_nw.png
creature_terrestrial_medium_walk_se.png
creature_terrestrial_medium_walk_sw.png
creature_terrestrial_medium_attack_ne.png   (4 frames) — optionnel
creature_terrestrial_medium_die_ne.png      (6 frames) — orientation unique OK
creature_terrestrial_medium_birth.png       (6 frames) — orientation unique OK
```

**Total estimatif** : ~12 formes × 4 orientations × ~3 anims = ~144 fichiers d'anim pour les créatures Âge IV.

#### Versions agrégats globe

Pour la vue dézoomée, 1 sprite représente toute une population d'une région :

| Fichier | Description |
|---------|-------------|
| `aggregate_globe_aquatic.png` | Point/essaim marin, pulsation |
| `aggregate_globe_terrestrial.png` | Point/troupeau terrestre |
| `aggregate_globe_aerial.png` | Nuée volante |

Tintés par Pixi selon l'espèce dominante.

#### Créatures impossibles (rares, légendaires)

| Fichier | Description |
|---------|-------------|
| `creature_impossible_aquaflyer.png` | Volante aquatique, sprite unique |
| `creature_impossible_silicon.png` | Silicium-based, cristallin |
| `creature_impossible_multibody.png` | Plusieurs corps reliés, animé |
| `creature_impossible_telepath.png` | Halo psychique, 8 frames |
| `creature_impossible_dragon.png` | Vrai dragon, grande taille |

Avec animations `idle`, `die`, et **halo particules dorées** autour (cf. §Indicateurs).

#### Plantes (Âge IV et +)

| Forme | Tailles |
|-------|---------|
| `plant_tree_small` → `plant_tree_giant` | 4 tailles (1×1 à 4×4 footprint iso) |
| `plant_flower_small` / `_patch` | Buissons fleuris, 2 frames (sway) |
| `plant_vine_horizontal.png` | Lianes, loop de 4 frames |
| `plant_grass_patch.png` | Touffe d'herbe, 2 frames |
| `plant_carnivorous.png` | Plante carnivore, 6 frames |
| `plant_forest_dense.png` | Forêt dense iso, tile spécial |

#### Événements Âge IV

| Fichier | Description |
|---------|-------------|
| `fx_mutation_flash.png` | Éclair de mutation (cmd `!mutate`), 6 frames |
| `fx_speciation_split.png` | Spéciation (branche phylogénétique) |
| `fx_extinction_wave.png` | Vague d'extinction pleine planète, 12 frames |
| `fx_climate_shift_warm.png` | Voile de réchauffement |
| `fx_climate_shift_cold.png` | Voile de refroidissement |
| `fx_migration_arrow.png` | Flèche de migration |

### Âge V — Les Étincelles (Préhistoire)

#### Humanoïdes tribaux

| Fichier | Description |
|---------|-------------|
| `tribe_human_idle_{orientation}.png` | Humanoïde debout, 2 frames |
| `tribe_human_walk_{orientation}.png` | Marche, 4 frames × 4 orientations |
| `tribe_human_sit.png` | Assis autour du feu |
| `tribe_human_hunt.png` | Chasse, geste de lance |
| `tribe_human_paint.png` | Art rupestre, 4 frames |
| `tribe_human_bury.png` | Enterrement, 4 frames |
| `tribe_human_child.png` | Enfant (plus petit) |

#### Campements tribaux

| Fichier | Footprint iso | Description |
|---------|---------------|-------------|
| `tribe_campfire.png` | 1×1 | Feu de camp, 6 frames |
| `tribe_hut_small.png` | 1×1 | Hutte simple |
| `tribe_hut_medium.png` | 2×2 | Hutte plus grande |
| `tribe_tent.png` | 1×1 | Tente nomade |
| `tribe_totem.png` | 1×1 | Totem spirituel |
| `tribe_cave_entrance.png` | 2×2 | Entrée de grotte avec peintures |
| `tribe_altar.png` | 1×1 | Autel rituel |

#### Outils et technologies

| Fichier | Description |
|---------|-------------|
| `tool_stone_axe.png` | Hache en pierre (inventaire / icône) |
| `tool_wood_club.png` | Massue |
| `tool_bone_needle.png` | Aiguille |
| `tool_bow.png` | Arc |
| `tool_spear.png` | Lance |
| `tool_torch.png` | Torche allumée, 4 frames |

#### Art rupestre (persiste inter-cycles)

8-12 motifs simples noirs/rouges sur fond pierre. Réapparaissent tels quels dans les ruines des cycles suivants.

```text
art_rupestre_handprint.png
art_rupestre_hunter.png
art_rupestre_mammoth.png
art_rupestre_sun.png
art_rupestre_moon.png
art_rupestre_spiral.png
art_rupestre_stars.png
art_rupestre_figures.png
```

#### Événements Âge V

| Fichier | Description |
|---------|-------------|
| `fx_first_fire.png` | Le Premier Feu, cinématique 16 frames |
| `fx_first_speech.png` | La Première Parole, bulle lumineuse |
| `fx_tribe_war.png` | Conflit tribal, choc |
| `fx_tribe_alliance.png` | Poignée de mains symbolique |
| `fx_ritual_circle.png` | Cercle de rituel |

### Âge VI — Les Cités (Antiquité → Modernité)

**La catégorie la plus narrative**. Chaque cité évolue visuellement selon sa population et le sous-âge.

#### Cités — stades de croissance

Correspond à `CITY_VISUAL_STAGES` dans [render_spec.md:682](render_spec.md#L682).

| Stade | Pop. | Sprites requis |
|-------|------|----------------|
| **SMALL** (0-500) | | `city_small_huts.png`, `city_small_tent_row.png`, `city_small_central_fire.png` |
| **MEDIUM** (500-5k) | | `city_medium_houses.png`, `city_medium_temple.png`, `city_medium_market.png`, `city_medium_walls.png` |
| **LARGE** (5k-50k) | | `city_large_castle.png`, `city_large_cathedral.png`, `city_large_houses_block.png`, `city_large_walls.png`, `city_large_gatehouse.png` |
| **HUGE** (50k-1M) | | `city_huge_skyscraper.png`, `city_huge_factory.png`, `city_huge_slums.png`, `city_huge_highway.png`, `city_huge_monument.png` |
| **MEGA** (1M+) | | `city_mega_arcology.png`, `city_mega_space_elevator.png`, `city_mega_dome.png`, `city_mega_data_spire.png` |

#### Bâtiments par sous-âge

**Âge du Bronze** (bronze tech) :

```text
building_bronze_hut.png          1×1
building_bronze_workshop.png     1×1
building_bronze_altar.png        1×1
building_bronze_wall.png         tile bord
```

**Âge du Fer** :

```text
building_iron_forge.png          2×2
building_iron_barracks.png       2×2
building_iron_fortress.png       3×3
building_iron_temple.png         2×2
```

**Âge Médian** :

```text
building_medieval_castle.png     4×4
building_medieval_cathedral.png  3×3
building_medieval_village_house.png  1×1
building_medieval_monastery.png  2×2
building_medieval_market.png     2×2
```

**Âge des Voiles** :

```text
building_sails_port.png          3×3
building_ship_sail.png           1×1 (flotte)
building_sails_palace.png        4×4
building_sails_university.png    3×3
building_sails_library.png       3×3
```

**Âge des Machines** (industrial) :

```text
building_industrial_factory.png  3×3
building_industrial_chimney.png  1×1 (empilable en hauteur)
building_industrial_train_station.png  2×3
building_industrial_bridge.png   ligne de tiles
building_industrial_slum.png     1×1
```

**Âge des Réseaux** :

```text
building_network_skyscraper_small.png   2×2
building_network_skyscraper_mega.png    3×3
building_network_antenna.png            1×1
building_network_data_center.png        2×2
building_network_airport.png            4×4
```

#### Infrastructure commune

| Fichier | Footprint | Description |
|---------|-----------|-------------|
| `road_straight_{ne,nw,se,sw}.png` | ligne | Routes directionnelles |
| `road_crossing.png` | 1×1 | Intersection |
| `wall_straight.png` / `wall_corner.png` | ligne | Murs |
| `bridge_wood.png` / `bridge_stone.png` | ligne | Ponts |
| `farm_field.png` | 2×2 | Champ agricole, 4 saisons |
| `pasture.png` | 2×2 | Élevage |
| `monument_generic.png` | 1×1 à 3×3 | Monument customisable |

#### Unités civilisationnelles

| Fichier | Description |
|---------|-------------|
| `unit_farmer_{orientation}.png` | Paysan, 4 frames marche × 4 orient. |
| `unit_soldier_bronze.png` | Soldat bronze |
| `unit_soldier_iron.png` | Soldat fer |
| `unit_soldier_medieval.png` | Chevalier |
| `unit_soldier_musketeer.png` | Mousquetaire |
| `unit_soldier_industrial.png` | Soldat 19ᵉ |
| `unit_soldier_modern.png` | Soldat moderne |
| `unit_merchant.png` | Marchand (caravane) |
| `unit_priest.png` | Religieux |
| `unit_scholar.png` | Érudit |
| `unit_king_{orientation}.png` | Roi / figure de dynastie |

#### Événements Âge VI

| Fichier | Description |
|---------|-------------|
| `fx_city_founded.png` | Fondation de cité, cinématique 12 frames |
| `fx_war_clash.png` | Choc de bataille |
| `fx_plague_city.png` | Voile de peste sur une cité |
| `fx_flood_region.png` | Inondation régionale |
| `fx_fire_city.png` | Incendie urbain, 8 frames |
| `fx_earthquake_region.png` | Séisme, shake |
| `fx_revolution_flag.png` | Drapeau de révolution |
| `fx_schism_split.png` | Schisme religieux |
| `fx_trade_route.png` | Route commerciale (ligne pointillée) |
| `fx_festival.png` | Festival, confettis |
| `fx_coronation.png` | Couronnement, halo doré |
| `fx_industrial_revolution.png` | Cinématique RI |
| `fx_ruins_discovered.png` | Découverte de ruines anciennes |

### Âge VII — Le Vide (Spatial)

#### Vaisseaux et infrastructures spatiales

| Fichier | Description |
|---------|-------------|
| `space_probe_small.png` | Petite sonde, 4 frames |
| `space_satellite.png` | Satellite, 4 frames (rotation) |
| `space_station_small.png` | Station orbitale petite |
| `space_station_large.png` | Station orbitale grande |
| `space_moon_colony.png` | Colonie lunaire |
| `space_space_elevator.png` | Ascenseur spatial (très grand) |
| `space_colony_ship.png` | Vaisseau d'Ascension |
| `space_debris.png` | Débris orbitaux (persistent inter-cycles) |

#### IA et contact

| Fichier | Description |
|---------|-------------|
| `ai_core_idle.png` | Cœur d'IA, 8 frames pulsation |
| `ai_core_corrupted.png` | IA hostile, glitch |
| `ai_transcendence.png` | IA transcendante, halo prismatique |
| `contact_signal.png` | Signal mystérieux du Vide Noir |
| `contact_anomaly.png` | Anomalie visuelle, distorsion |
| `contact_entity.png` | Silhouette extraterrestre (jamais claire) |

#### Événements Âge VII

| Fichier | Description |
|---------|-------------|
| `fx_rocket_launch.png` | Décollage de fusée, 24 frames |
| `fx_reentry.png` | Retour atmosphérique |
| `fx_nuke_explosion.png` | Explosion nucléaire, 16 frames |
| `fx_nuke_mushroom.png` | Champignon atomique, persistant |
| `fx_ascension_beam.png` | Rayon d'Ascension (rare) |
| `fx_warp_jump.png` | Saut FTL, 12 frames |
| `fx_terraform.png` | Terraformation, transformation de région |

---

## Assets d'apocalypse

Les 9 apocalypses canoniques ont chacune leur **palette signature** (cf. [color_palette.md §Palettes d'apocalypse](color_palette.md#palettes-dapocalypse)) et des effets pleine-planète dédiés.

### 🌠 Impact céleste

```text
apoc_impact_meteor_approach.png      trainée dans le ciel
apoc_impact_impact_flash.png         flash blanc saturé
apoc_impact_shockwave.png            onde de choc circulaire, 16 frames
apoc_impact_crater_form.png          cratère qui se forme
apoc_impact_dust_cloud.png           nuage de poussière qui enveloppe le globe
apoc_impact_sky_after.png            ciel obscurci persistant
```

### ☢️ Hiver des cendres

```text
apoc_ashwinter_nuke_global.png       explosions multiples simultanées
apoc_ashwinter_ash_rain.png          pluie de cendres continue
apoc_ashwinter_frozen_world.png      planète figée gris-blanc
apoc_ashwinter_survivor_glow.png     rares lueurs de survivants
```

### 🔥 L'Étuve

```text
apoc_greenhouse_sun_intensify.png    soleil grossissant
apoc_greenhouse_ocean_evaporate.png  vapeur montant des océans
apoc_greenhouse_land_crack.png       sol craquelé
apoc_greenhouse_dead_forest.png      forêts desséchées
```

### 🦠 La Grande Faux

```text
apoc_plague_spread_wave.png          vague verdâtre qui se propage
apoc_plague_death_marker.png         marqueur sur cités touchées
apoc_plague_mass_grave.png           fosses communes iso
```

### 🤖 Singularité

```text
apoc_singularity_ai_growth.png       réseau qui s'étend, 16 frames
apoc_singularity_glitch_overlay.png  distorsion pleine-écran
apoc_singularity_digital_rain.png    pluie numérique
apoc_singularity_transcend.png       disparition prismatique
```

### 🌊 Déluge final

```text
apoc_deluge_water_rise.png           niveau d'eau montant
apoc_deluge_wave_global.png          vague planétaire
apoc_deluge_submerged_city.png       cité engloutie
```

### 👁️ Le Contact

```text
apoc_contact_void_tear.png           déchirure dans le ciel
apoc_contact_entity_silhouette.png   silhouette non identifiable
apoc_contact_impossible_geometry.png geometrie non-euclidienne
apoc_contact_final_message.png       texte cryptique
```

### 🕳️ Effondrement intérieur

```text
apoc_collapse_desaturation.png       voile gris qui envahit
apoc_collapse_empty_streets.png      cités désertées
apoc_collapse_abandoned.png          bâtiments en décrépitude
```

### ⏳ L'Oubli

```text
apoc_oblivion_fade.png               voile blanc qui efface progressivement
apoc_oblivion_vanishing_entities.png entités qui disparaissent
apoc_oblivion_last_survivor.png      dernière lumière
```

---

## Artefacts persistants

Objets qui **réapparaissent cycle après cycle** (cf. [genesis_live_lore.md §Artefacts & Reliques](genesis_live_lore.md#artefacts--reliques)). Traitement iconique, reconnaissable au premier coup d'œil.

| Fichier | Footprint iso | Description |
|---------|---------------|-------------|
| `artifact_obelisk.png` | 1×1 | Obélisque noir inaltérable, subtle glow |
| `artifact_burned_book.png` | 1×1 | Fragments de Livre Brûlé, 4 frames |
| `artifact_nameless_city.png` | 4×4 | Ruines de la Cité sans Nom |
| `artifact_singing_skull.png` | 1×1 | Crâne chantant, 8 frames |
| `artifact_eternal_seed.png` | 1×1 | Graine Éternelle (germe différemment chaque cycle) |

**Reliques de viewers** (générées dynamiquement, 3-5 templates) :

```text
relic_sword_template.png
relic_crown_template.png
relic_grimoire_template.png
relic_orb_template.png
relic_banner_template.png
```

Tintés par couleur du viewer propriétaire.

---

## Effets & particules

Budget : **max 2000 particules simultanées** (cf. [render_spec.md:971](render_spec.md#L971)).

### Particules unitaires (sprites de 2-4 px)

| Fichier | Usage |
|---------|-------|
| `particle_raindrop.png` | Goutte de pluie |
| `particle_snowflake.png` | Flocon |
| `particle_ash.png` | Cendre |
| `particle_ember.png` | Braise |
| `particle_spark.png` | Étincelle |
| `particle_bubble.png` | Bulle (eau) |
| `particle_dust.png` | Poussière |
| `particle_pollen.png` | Pollen |
| `particle_firefly.png` | Luciole nocturne |
| `particle_star_spark.png` | Éclat étoilé |
| `particle_leaf.png` | Feuille morte |
| `particle_petal.png` | Pétale |
| `particle_blood.png` | Sang (mort, usage modéré) |
| `particle_smoke_small.png` | Fumée légère |
| `particle_smoke_large.png` | Fumée dense |
| `particle_gold_sparkle.png` | Éclat doré (indicateur légendaire) |

### Effets composites

| Fichier | Description |
|---------|-------------|
| `fx_explosion_small.png` | 8 frames |
| `fx_explosion_medium.png` | 12 frames |
| `fx_explosion_large.png` | 16 frames |
| `fx_flash_white.png` | Flash plein écran |
| `fx_shockwave_ring.png` | Onde circulaire, 12 frames |
| `fx_geyser.png` | Jet d'eau, 8 frames |
| `fx_aurora.png` | Aurore boréale, loop |
| `fx_rainbow.png` | Arc-en-ciel |
| `fx_eclipse_overlay.png` | Voile d'éclipse |

---

## Cinématiques de transition

Cf. [render_spec.md §Transitions entre âges](render_spec.md#transitions-entre-âges). Chaque transition = 5-10 secondes à 12 fps ≈ **60-120 frames** par cinématique.

| Fichier | Transition | Durée |
|---------|------------|-------|
| `transition_age_1_to_2.png` (atlas multi-frames) | Feu → Eaux | 30 s |
| `transition_age_2_to_3.png` | Eaux → Germes | 30 s |
| `transition_age_3_to_4.png` | Germes → Grouillement | 45 s |
| `transition_age_4_to_5.png` | Grouillement → Étincelles | 45 s |
| `transition_age_5_to_6.png` | Étincelles → Cités | 60 s |
| `transition_age_6_to_7.png` | Cités → Vide | 45 s |
| `transition_apocalypse_to_cycle.png` | Apocalypse → nouveau cycle | 30 s de silence + émergence |

Format recommandé : **frames individuelles** (`transition_age_1_to_2/frame_0001.png` à `frame_0360.png`) + fichier atlas pour bundling.

**Banners textuels en overlay** (superposés à la cinématique, rendu HTML/CSS privilégié, mais prévoir fallback PNG) :

```text
banner_age_I.png       "🜂 ÂGE I — LE FEU"
banner_age_II.png      "🜄 ÂGE II — LES EAUX"
banner_age_III.png     "🜃 ÂGE III — LES GERMES"
banner_age_IV.png      "🜁 ÂGE IV — LE GROUILLEMENT"
banner_age_V.png       "🜔 ÂGE V — LES ÉTINCELLES"
banner_age_VI.png      "🜚 ÂGE VI — LES CITÉS"
banner_age_VII.png     "🜛 ÂGE VII — LE VIDE"
```

---

## Cycle jour/nuit

Cf. [render_spec.md §Cycle jour/nuit](render_spec.md#cycle-journuit). Cycle complet ~5 min réel.

| Fichier | Phase |
|---------|-------|
| `overlay_day.png` | Teinte transparente / neutre |
| `overlay_dusk.png` | Voile orange/rose |
| `overlay_night.png` | Voile bleu nuit + étoiles plus visibles |
| `overlay_dawn.png` | Voile froid→chaud |
| `city_lights_night.png` | Lumières urbaines activées la nuit (Âges VI-VII uniquement) |

Implémentation : shader GLSL + overlay, mais prévoir ces PNG pour fallback.

---

## Indicateurs visuels d'entités

Petits **sprites overlay** qui se superposent aux entités pour communiquer leur statut. Très importants pour la lisibilité.

| Fichier | Placement | Usage |
|---------|-----------|-------|
| `indicator_viewer_rim.png` | autour du sprite | Liseré fin de couleur viewer (créature fondée par un viewer) |
| `indicator_apex_crown.png` | au-dessus | Espèce apex predator |
| `indicator_capital_banner.png` | au-dessus | Cité capitale |
| `indicator_empire_halo.png` | autour | Halo doré pour empire dominant |
| `indicator_legendary_sparkle.png` | autour | Particules dorées pour créature légendaire |
| `indicator_religion_sol.png` | au-dessus | Icône SOL pour cité convertie |
| `indicator_religion_nox.png` | au-dessus | Icône NOX |
| `indicator_religion_khron.png` | au-dessus | Icône KHRON |
| `indicator_religion_vox.png` | au-dessus | Icône VOX |
| `indicator_religion_generic.png` | au-dessus | Religion custom (tintée) |
| `indicator_plague.png` | au-dessus | Peste active |
| `indicator_revolt.png` | au-dessus | Cité en révolte |
| `indicator_under_siege.png` | au-dessus | Cité assiégée |
| `indicator_selected.png` | autour | Sélection par `!observe` |
| `indicator_new_birth.png` | autour | Entité naissante (fade-in) |
| `indicator_dying.png` | autour | Entité en extinction |

---

## UI / HUD / icônes

HUD principalement **HTML/CSS** (cf. [render_spec.md §HUD](render_spec.md#hud-et-overlays)), mais certains éléments sont des PNG.

### Badges des 21 titres du Panthéon

Cf. [genesis_live_lore.md §Panthéon](genesis_live_lore.md#le-panthéon-des-viewers) et [simulation_rules.md §Règles d'attribution](simulation_rules.md#règles-dattribution-de-titres).

**Titres Primordiaux (10)** :

```text
title_porteur_deau.png          Le Porteur d'Eau 💧
title_forgeron.png              Le Forgeron 🔥
title_semeuse.png               La Semeuse 🌱
title_premier_oeil.png          Le Premier Œil 👁️
title_porteur_flamme.png        Le Porteur de Flamme 🔥
title_architecte.png            L'Architecte 🏛️
title_conquerant.png            Le Conquérant ⚔️
title_prophete.png              Le Prophète 📜
title_ingenieur_roi.png         L'Ingénieur-Roi ⚙️
title_astronaute.png            L'Astronaute 🚀
```

**Titres Obscurs (6)** :

```text
title_destructeur.png           Le Destructeur ☠️
title_traitre.png               Le Traître 🗡️
title_fossoyeur.png             Le Fossoyeur ⚰️
title_heresiarque.png           L'Hérésiarque ⛧
title_porteur_peste.png         Le Porteur de Peste 🦠
title_oublieur.png              L'Oublieur 🌫️
```

**Titres Rares (7)** :

```text
title_equilibriste.png          L'Équilibriste ⚖️
title_renouveau.png             Le Renouveau 🌅
title_ascendant.png             L'Ascendant ✨
title_retourne.png              Le Retourné 🔄
title_oraculaire.png            L'Oraculaire 🔮
title_legendaire.png            Le Légendaire 🌟
title_empereur.png              L'Empereur 👑
```

**Titres Interdits (3)** :

```text
title_le_premier.png            Le Premier
title_le_dernier.png            Le Dernier
title_le_silencieux.png         Le Silencieux
```

Format par badge : **48×48 px** (HUD) + **192×192 px** (notification de gain) + palette encadrée (cf. [color_palette.md §Badges de titres](color_palette.md#badges-de-titres)) :

| Catégorie | Bord | Fond | Icône |
|-----------|------|------|-------|
| Primordiaux | `electric-blue` | `night-purple` | `cyan` |
| Obscurs | `deep-red` | `blood` | `crimson` |
| Rares | `royal-gold` | `umber` | `amber` |
| Légendaires | `prismatic` | `deep-purple` | `light` |
| Interdits | `magenta` | `violet` | `hot-pink` |

### Icônes de stats HUD

| Fichier | Stat |
|---------|------|
| `icon_temperature.png` | Température |
| `icon_water.png` | Couverture d'eau |
| `icon_oxygen.png` | Oxygène |
| `icon_co2.png` | CO₂ |
| `icon_radiation.png` | Radiation |
| `icon_pollution.png` | Pollution |
| `icon_biomass.png` | Biomasse |
| `icon_biodiversity.png` | Biodiversité |
| `icon_population.png` | Population |
| `icon_tech_level.png` | Niveau tech |
| `icon_pressure.png` | Pression (jauge) |
| `icon_stability.png` | Stabilité |
| `icon_cycle_counter.png` | Compteur de cycle |

Format : **16×16 px** (petite) et **32×32 px** (grande), monochromes tintables.

### Icônes d'événements (event feed)

| Fichier | Usage |
|---------|-------|
| `icon_event_command.png` | Action de viewer |
| `icon_event_natural.png` | Événement naturel |
| `icon_event_birth.png` | Naissance |
| `icon_event_death.png` | Mort |
| `icon_event_war.png` | Guerre |
| `icon_event_peace.png` | Paix |
| `icon_event_discovery.png` | Découverte |
| `icon_event_religion.png` | Religion |
| `icon_event_disaster.png` | Catastrophe |
| `icon_event_apocalypse.png` | Apocalypse |
| `icon_event_age_transition.png` | Transition d'âge |

### Symboles des 7 âges

Utilisés dans le HUD en permanence (top bar) :

```text
age_symbol_I.png      🜂 (Feu)
age_symbol_II.png     🜄 (Eaux)
age_symbol_III.png    🜃 (Germes)
age_symbol_IV.png     🜁 (Grouillement)
age_symbol_V.png      🜔 (Étincelles)
age_symbol_VI.png     🜚 (Cités)
age_symbol_VII.png    🜛 (Vide)
```

Format : **32×32 px** + **128×128 px** (transitions).

### Symboles des 4 forces primordiales

```text
force_sol.png        ☀️ Soleil-Témoin
force_nox.png        🌑 Lune Jumelle
force_khron.png      🌋 Le Mangeur
force_vox.png        🌀 La Rumeur
```

Format : **32×32** + **128×128**.

### Notifications et toasts

| Fichier | Description |
|---------|-------------|
| `notif_bg_success.png` | Fond notif succès (bord vert) |
| `notif_bg_warning.png` | Fond warning (bord ambre) |
| `notif_bg_error.png` | Fond erreur (bord crimson) |
| `notif_bg_info.png` | Fond info (bord cyan) |
| `notif_bg_title.png` | Fond gain de titre (bord doré) |
| `notif_bg_apocalypse.png` | Banner rouge pulsant plein écran |

### Panneaux et bordures HUD

| Fichier | Description |
|---------|-------------|
| `hud_panel_bg.png` | Fond de panneau, 9-slice |
| `hud_panel_border.png` | Bordure, 9-slice |
| `hud_pressure_gauge_bg.png` | Fond jauge Pression |
| `hud_pressure_gauge_fill.png` | Remplissage jauge (tintable) |
| `hud_divider_horizontal.png` | Séparateur horizontal |
| `hud_divider_vertical.png` | Séparateur vertical |

---

## Typographie

Pas de création d'assets par le graphiste — **sélection** d'une ou deux polices pixel art libres suffit. Exigences :

| Usage | Police | Taille logique |
|-------|--------|----------------|
| HUD texte standard | Pixel font lisible (ex. *m3x6*, *m5x7*, *Silkscreen*) | 6-8 px |
| Titres HUD / événements | Pixel font medium | 10-12 px |
| Banners d'âge (transitions) | Pixel font decorative serif | 24-32 px |
| Narration (cinématiques) | Pixel font serif | 16-20 px |

**Licence obligatoire** : OFL, CC0, ou équivalent. Stocker dans `frontend/src/assets/fonts/`.

Contraste texte minimum : **WCAG AA (4.5:1)** — cf. [color_palette.md §Accessibilité](color_palette.md#accessibilité).

---

## Assets OBS / branding

Pour la capture OBS et la promotion externe. **Non intégrés dans le rendu**, mais nécessaires pour le lancement (Phase 7).

| Fichier | Format | Usage |
|---------|--------|-------|
| `branding_logo.png` | 1024×1024, 512×512, 128×128 | Logo officiel Genesis Live |
| `branding_wordmark.png` | SVG + PNG | Texte "Genesis Live" stylisé |
| `thumbnail_youtube.png` | 1280×720 | Miniature YouTube |
| `thumbnail_twitch.png` | 1200×675 | Miniature Twitch |
| `offline_screen.png` | 1920×1080 | Écran stream hors ligne |
| `waiting_screen.png` | 1920×1080 | Écran d'attente / brb |
| `discord_icon.png` | 512×512 | Icône serveur Discord |
| `favicon.ico` / `favicon.png` | 32×32, 180×180 | Favicon site wiki |

**Règle** : même palette 64 couleurs, même ton mythologique — le branding est une **extension** du jeu.

---

## Priorités d'implémentation

Calées sur les phases de [roadmap.md](roadmap.md).

### MVP minimal (Phase 2 — semaines 6-11)

Juste assez pour que la simulation soit visible :

- [ ] `planet_base_age1.png` → `planet_base_age3.png` (3 textures statiques, **sans animations**)
- [ ] 3 patches de biomes globe (ocean, forest, desert)
- [ ] Particules : `particle_raindrop`, `particle_ember`, `particle_bubble`
- [ ] `fx_volcano_erupt_medium.png`, `fx_meteor_medium.png`, `fx_rain_normal.png`
- [ ] Icônes HUD essentielles : température, eau, population, pressure
- [ ] `banner_age_I.png` → `banner_age_III.png`
- [ ] Police pixel font HUD

**Volume MVP : ~20 fichiers.**

### Phase 3 (chat intégré — semaines 12-14)

Ajouts pour la boucle viewer → monde :

- [ ] Badges de 10 titres Primordiaux
- [ ] `indicator_viewer_rim.png` pour attribuer visuellement les créations
- [ ] 1-2 sprites de souche Âge III (blob)
- [ ] `fx_title_earned.png` (cinématique de gain)

### Phase 4 (extension des âges — semaines 15-23)

Montée en charge majeure. **C'est la phase graphique la plus lourde.**

- [ ] 4 textures planète restantes (IV-VII) + animations
- [ ] Tous les patches de biomes globe (11)
- [ ] **Créatures Âge IV** : 12 formes × 4 orientations × 3 animations = ~140 sprites
- [ ] **Humanoïdes Âge V** : tribe_human complet + huttes + art rupestre + outils
- [ ] **Cités Âge VI** : 6 sous-âges × ~10 bâtiments = ~60 sprites + 5 stades de croissance
- [ ] **Âge VII** : sondes, satellites, stations, IA, contact
- [ ] 21 badges de titres du Panthéon
- [ ] 9 sets d'effets d'apocalypse (~50 sprites)
- [ ] 5 artefacts persistants

**Volume Phase 4 : ~400-500 fichiers.** C'est là que le budget graphiste est le plus critique.

### Phase 5 (polish — semaines 24-29)

- [ ] Tilesets iso complets (13 biomes × ~40-60 tuiles)
- [ ] Transitions cinématiques d'âge (7 × 60-120 frames = ~700 frames)
- [ ] Particules d'ambiance (aurora, fireflies, pollen)
- [ ] Overlays jour/nuit + city_lights
- [ ] Créatures impossibles (5 légendaires)
- [ ] Bordures HUD finales, panels stylisés
- [ ] Atlas TexturePacker finalisés

**Volume Phase 5 : ~1000-1500 tuiles + polish.**

### Phase 7 (lancement — semaine 33)

- [ ] Branding (logo, wordmark, thumbnails YT+Twitch)
- [ ] Offline screen, waiting screen
- [ ] Favicon

### Phase 8 (continu)

- [ ] Commandes secrètes (`!42`, `!break_fourth_wall`, `!oracle`, etc.) avec visuels dédiés
- [ ] Événements saisonniers (Halloween, Noël) avec re-skin temporaire
- [ ] Nouvelles créatures impossibles selon les cycles observés

---

## Budget estimatif

Estimation grossière du volume de production graphique pour V1 (fin Phase 5).

| Catégorie | Nombre de fichiers | Effort relatif |
|-----------|---------------------|-----------------|
| Textures planète globe (7 âges × animations) | ~30 | Moyen |
| Patches de biomes globe | ~40 | Faible |
| Tilesets iso (13 biomes) | ~500 tuiles | **Élevé** |
| Créatures Âge III (souches) | ~10 | Faible |
| Créatures Âge IV (12 formes × 4 orient. × 3-4 anims) | ~150 | **Élevé** |
| Créatures impossibles | ~15 | Moyen |
| Plantes | ~30 | Faible |
| Humanoïdes Âge V + huttes + outils + art rupestre | ~60 | Moyen |
| Bâtiments Âge VI (6 sous-âges × 10-15 bâtiments) | ~80 | Moyen |
| Unités civilisationnelles | ~40 | Moyen |
| Infrastructure (routes, murs, ponts, champs) | ~30 | Faible |
| Âge VII (spatial) | ~40 | Moyen |
| Artefacts persistants | ~10 | Faible |
| Événements & FX | ~80 | Moyen |
| Particules unitaires | ~20 | Faible |
| Apocalypses (9 types × ~5 sprites) | ~50 | Moyen |
| Cinématiques de transition d'âge (7 × 60-120 frames) | ~700 frames | **Élevé** |
| Badges de titres (21 × 2 tailles) | ~42 | Faible |
| Icônes HUD & événements | ~40 | Faible |
| Symboles d'âges et de forces | ~20 | Faible |
| Indicateurs d'entités | ~20 | Faible |
| UI / panels / notifications | ~30 | Faible |
| Branding OBS | ~15 | Moyen |
| **TOTAL V1 estimé** | **~2000 assets** | — |

**Budget temps** estimé (cf. [audio_design.md](audio_design.md) qui évoque des chiffres équivalents) :

- Solo dev utilisant **packs libres + adaptations** : ~3 mois temps partiel
- **Graphiste commandé** (freelance via Fiverr / Soundbetter pour assets custom) : 500-3000 € selon périmètre
- **Équipe graphique dédiée** : 2-3 mois à 2 personnes

---

## Checklist de livraison

Avant d'intégrer un asset dans le projet, vérifier :

- [ ] Toutes les couleurs viennent de `palette.json` (vérification automatique possible avec un script)
- [ ] Format PNG avec canal alpha transparent
- [ ] Source Aseprite (`.ase`) fournie dans un dossier `sources/` non buildé
- [ ] Nommage conforme : `<catégorie>_<nom>_<variante>.png`
- [ ] Pivot correct (bas-centre pour iso, centre pour globe)
- [ ] Si animation : frames numérotées, boucle parfaite, 10-12 fps
- [ ] Si créature iso animée : 4 orientations (NE, NW, SE, SW)
- [ ] Contraste suffisant sur le fond cible (WCAG AA minimum pour le texte)
- [ ] Pas de contenu problématique ([content_moderation.md](content_moderation.md) §Catégorie 1)
- [ ] Licence documentée (CC0, CC-BY, MIT, ou certifié original)
- [ ] Testé en rendu réel (pas seulement en standalone)
- [ ] Intégré dans l'atlas TexturePacker approprié (ou prêt à l'être)

---

## ✨ Conclusion

Ce document est **exhaustif mais vivant**. Il sera ajusté à chaque phase selon les besoins émergents observés en playtest.

### Principes à ne jamais violer

1. **Palette stricte** : 64 couleurs, pas une de plus
2. **Cohérence stylistique** : tout asset doit appartenir au même monde
3. **Lisibilité > spectacle** : un viewer comprend en 5 secondes
4. **Attribution propre** : chaque sprite contribué est licencié clairement

### Principes à ajuster avec le temps

1. **Volumes par âge** — à revoir selon ce qui est réellement affiché en live
2. **Résolutions de détail** — les tailles indicatives peuvent être revues (tile 64×32 si 32×16 est illisible)
3. **Priorités de production** — pivoter si un âge s'avère sous-polished

### Le mot de la fin

Un pixel art réussi n'est pas **le plus détaillé**, c'est **le plus reconnaissable**. Chaque sprite de Genesis Live doit pouvoir être identifié en un coup d'œil — une cité en ruine, un dragon légendaire, une souche dominante — **sans même lire le nom**.

Traite chaque asset comme **une page du Grand Registre** : il persistera peut-être plus longtemps que la civilisation qui l'a vu naître.

---

*Inventaire des assets pixel art — v1.0*
*À mettre à jour à chaque ajout d'entité, de biome, de titre, ou d'apocalypse.*
