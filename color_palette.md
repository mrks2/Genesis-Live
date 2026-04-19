# 🎨 GENESIS LIVE — Palette de couleurs

*Codes hex précis, règles d'usage, cohérence visuelle à travers tout le projet.*

---

## 📖 Table des matières

1. [Philosophie de la palette](#philosophie-de-la-palette)
2. [Palette maître](#palette-maître)
3. [Règles d'usage](#règles-dusage)
4. [Palettes par âge](#palettes-par-âge)
5. [Palettes par biome](#palettes-par-biome)
6. [Palettes d'ambiance](#palettes-dambiance)
7. [Palettes UI](#palettes-ui)
8. [Palettes d'apocalypse](#palettes-dapocalypse)
9. [Couleurs sémantiques](#couleurs-sémantiques)
10. [Génération procédurale](#génération-procédurale)
11. [Accessibilité](#accessibilité)
12. [Export et intégration](#export-et-intégration)

---

## Philosophie de la palette

### Principe central

Genesis Live utilise une **palette restreinte et cohérente** à la manière des jeux pixel art classiques. C'est une contrainte créative délibérée : moins de couleurs = plus d'identité visuelle forte.

### Les 4 règles d'or

**1. Palette finie**
Exactement **64 couleurs** dans la palette maître. Aucune couleur hors de cette palette n'existe dans le jeu.

**2. Harmonie garantie**
Toutes les couleurs sont sélectionnées pour fonctionner ensemble. On peut combiner n'importe quelles couleurs sans clash.

**3. Évolution par teintes**
Chaque âge utilise une **sous-sélection** de la palette qui évolue progressivement. Pas de rupture, mais une dérive continue.

**4. Sémantique respectée**
Certaines couleurs ont une signification fixe (rouge = danger, bleu = eau, doré = spécial). Ces associations ne changent jamais.

### Inspirations

- **PICO-8** (palette 16 couleurs) pour la contrainte créative
- **Celeste** et **Hyper Light Drifter** pour les ambiances cinématiques
- **Oxygen Not Included** pour la lisibilité des systèmes complexes
- **Terraria** pour la variété des biomes avec cohérence visuelle

---

## Palette maître

### Les 64 couleurs officielles

La palette est organisée en **8 familles de 8 teintes**.

### Famille 1 — Neutres (gris, noir, blanc)

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `void` | `#0A0A12` | 10, 10, 18 | Vide cosmique, ombres profondes |
| `obsidian` | `#1A1A2E` | 26, 26, 46 | Nuit profonde, arrière-plan UI |
| `charcoal` | `#2D2D44` | 45, 45, 68 | Ombres secondaires |
| `slate` | `#4A4A6B` | 74, 74, 107 | Roches sombres |
| `stone` | `#6E6E8A` | 110, 110, 138 | Pierre neutre |
| `ash` | `#9191A8` | 145, 145, 168 | Cendre, nuage neutre |
| `bone` | `#C8C8D4` | 200, 200, 212 | Os, marbre pâle |
| `light` | `#F0F0F5` | 240, 240, 245 | Blanc pur (à utiliser rarement) |

### Famille 2 — Roches (bruns, terre)

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `deep-brown` | `#2B1810` | 43, 24, 16 | Terre profonde, tourbe |
| `umber` | `#4A2E1F` | 74, 46, 31 | Bois sombre |
| `earth` | `#6B4423` | 107, 68, 35 | Terre labourée |
| `clay` | `#8B5A2B` | 139, 90, 43 | Argile, pierre brune |
| `sand` | `#C89B6F` | 200, 155, 111 | Sable désertique |
| `pale-sand` | `#DDB887` | 221, 184, 135 | Sable de plage |
| `ochre` | `#D4A64A` | 212, 166, 74 | Terre ocre |
| `gold-dust` | `#E8C878` | 232, 200, 120 | Poussière dorée |

### Famille 3 — Eaux (bleus, turquoises)

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `abyss` | `#0A1F3D` | 10, 31, 61 | Océan profond, abysses |
| `deep-sea` | `#163D5C` | 22, 61, 92 | Mer profonde |
| `ocean` | `#2B5F8A` | 43, 95, 138 | Océan standard |
| `wave` | `#4A8FB8` | 74, 143, 184 | Vague, eau agitée |
| `sky-water` | `#7FC0E0` | 127, 192, 224 | Eau peu profonde |
| `cyan` | `#5FD4D0` | 95, 212, 208 | Lagon, cyan vif |
| `turquoise` | `#80E8C8` | 128, 232, 200 | Eaux tropicales |
| `foam` | `#D0F4EC` | 208, 244, 236 | Écume, glace claire |

### Famille 4 — Végétation (verts)

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `dark-forest` | `#1A2E1A` | 26, 46, 26 | Forêt dense sombre |
| `forest` | `#2B5F2B` | 43, 95, 43 | Forêt standard |
| `moss` | `#4A7A3D` | 74, 122, 61 | Mousse, herbe humide |
| `grass` | `#6B9B4F` | 107, 155, 79 | Prairie |
| `leaf` | `#8BC26B` | 139, 194, 107 | Feuillage jeune |
| `lime` | `#B8DB7F` | 184, 219, 127 | Pousse, jeune plante |
| `pale-green` | `#D4E8A8` | 212, 232, 168 | Steppe, blé vert |
| `mystic-green` | `#7FE8A8` | 127, 232, 168 | Vert fluorescent (rare) |

### Famille 5 — Feu (rouges, oranges)

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `blood` | `#3D0A0A` | 61, 10, 10 | Sang séché, profondeur |
| `deep-red` | `#6B1820` | 107, 24, 32 | Rouge profond |
| `crimson` | `#9B2B2B` | 155, 43, 43 | Rouge vif |
| `rust` | `#B84A2B` | 184, 74, 43 | Rouille, orange brûlé |
| `ember` | `#D46B3D` | 212, 107, 61 | Braise |
| `orange` | `#E89B4A` | 232, 155, 74 | Orange |
| `amber` | `#F0C060` | 240, 192, 96 | Ambre |
| `flame` | `#FFD77F` | 255, 215, 127 | Flamme lumineuse |

### Famille 6 — Ciel (violets, roses)

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `night-purple` | `#1A0F2E` | 26, 15, 46 | Nuit étoilée |
| `deep-purple` | `#3D1F5C` | 61, 31, 92 | Crépuscule |
| `violet` | `#6B3D8A` | 107, 61, 138 | Violet mystique |
| `dusk` | `#9B5FA8` | 155, 95, 168 | Heure dorée tirant vers le rose |
| `pink-sky` | `#D47FC0` | 212, 127, 192 | Aube rose |
| `dawn-pink` | `#F0B8D4` | 240, 184, 212 | Levé de soleil |
| `sunset` | `#FFC4A3` | 255, 196, 163 | Ciel de fin de journée |
| `peach` | `#FFDDC4` | 255, 221, 196 | Nuage rose pâle |

### Famille 7 — Accents & rares

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `magenta` | `#E83D8A` | 232, 61, 138 | Accent magenta |
| `hot-pink` | `#FF6BB3` | 255, 107, 179 | Rose vif |
| `electric-blue` | `#3D8AFF` | 61, 138, 255 | Bleu électrique |
| `neon-cyan` | `#3DFFE8` | 61, 255, 232 | Cyan néon (techno) |
| `toxic-green` | `#A3FF3D` | 163, 255, 61 | Vert toxique |
| `royal-gold` | `#FFD700` | 255, 215, 0 | Or légendaire |
| `silver` | `#D0D0E0` | 208, 208, 224 | Argent |
| `prismatic` | `#FFFFFF` | 255, 255, 255 | Blanc absolu (usage très rare) |

### Famille 8 — Apocalypse & corruption

| Nom | Hex | RGB | Usage principal |
|-----|-----|-----|-----------------|
| `void-corrupt` | `#000000` | 0, 0, 0 | Noir absolu |
| `plague-green` | `#5C7A3D` | 92, 122, 61 | Vert de maladie |
| `radioactive` | `#9BFF3D` | 155, 255, 61 | Radiation |
| `ash-storm` | `#5C5040` | 92, 80, 64 | Cendres épaisses |
| `blood-storm` | `#6B2020` | 107, 32, 32 | Ciel de sang |
| `toxic-yellow` | `#D4D43D` | 212, 212, 61 | Jaune toxique |
| `cold-blue` | `#3D6B9B` | 61, 107, 155 | Froid mortel |
| `burnt-orange` | `#8A3D1F` | 138, 61, 31 | Brûlure |

---

## Règles d'usage

### Combinaisons autorisées

**Principe de base** : toutes les couleurs de la palette fonctionnent ensemble. Mais certaines combinaisons sont **fortement encouragées**, d'autres à éviter.

**Combinaisons harmonieuses** (à privilégier) :
- Au sein d'une même famille (ex: tous les bleus)
- Familles complémentaires :
  - Eaux + Ciel (bleu + violet/rose)
  - Végétation + Roches (vert + brun)
  - Feu + Roches (rouge + brun)
  - Neutres + n'importe quoi

**Combinaisons à éviter** :
- Toxic-green + hot-pink (saturation trop élevée)
- Neon-cyan + flame (trop de contraste chromatique)
- Radioactive + royal-gold (saturations équivalentes, clash)

### Règle 60/30/10

Pour chaque scène/composition, respecter approximativement :
- **60% couleur dominante** (ex: bleu océan)
- **30% couleur secondaire** (ex: vert végétation)
- **10% couleur accent** (ex: orange éclat de soleil)

### Hiérarchie des couleurs

**Niveau 1 — Couleurs de fond** (utilisation massive) :
- Void, obsidian, charcoal, deep-sea, dark-forest, deep-brown
- Apparaissent sur >30% de l'écran

**Niveau 2 — Couleurs structurelles** (éléments solides) :
- Ocean, forest, clay, stone, earth
- Apparaissent sur 10-30% de l'écran

**Niveau 3 — Couleurs détail** (éléments visibles) :
- Grass, sand, ember, dusk, wave
- Apparaissent sur 3-10% de l'écran

**Niveau 4 — Couleurs accent** (usage rare, punch visuel) :
- Royal-gold, magenta, neon-cyan, mystic-green
- Apparaissent sur <3% de l'écran

### Règle des transitions

Les passages entre biomes/âges utilisent des **couleurs de transition** qui appartiennent aux deux palettes. Exemple :
- Passage forêt → désert : `clay` (appartient aux roches, proche du sable)
- Passage jour → nuit : `dusk` → `violet` → `deep-purple`

---

## Palettes par âge

Chaque âge utilise un sous-ensemble de ~16 couleurs, avec une dominante caractéristique.

### Âge I — Le Feu (Hadéen)

**Dominante** : rouge, orange, noir
**Ambiance** : chaotique, brûlant, primordial

**Palette (16 couleurs)** :
```
Fond         : void, obsidian, charcoal, blood
Terrain      : deep-brown, umber, earth, clay
Lave/feu     : crimson, rust, ember, orange, amber, flame
Accents      : ash, stone
```

**Ratios visés** :
- Terrain : 40% (tons bruns et rouges)
- Lave : 30% (orange, ember, amber)
- Fond sombre : 25% (void, charcoal)
- Accents lumineux : 5% (flame en pointe)

### Âge II — Les Eaux (Archéen)

**Dominante** : bleu, gris, blanc
**Ambiance** : calme, vaporeux, mystérieux

**Palette (16 couleurs)** :
```
Fond         : obsidian, charcoal, slate, deep-sea
Océan        : abyss, deep-sea, ocean, wave
Ciel         : sky-water, foam, ash, bone
Terre        : stone, slate, pale-sand
Accents      : dusk (crépuscule), night-purple
```

**Ratios visés** :
- Océan : 50%
- Ciel : 25%
- Terre émergeante : 15%
- Accents atmosphériques : 10%

### Âge III — Les Germes (Protérozoïque)

**Dominante** : vert, pourpre, turquoise
**Ambiance** : mystérieuse, organique, étrange

**Palette (16 couleurs)** :
```
Eau         : abyss, ocean, wave, cyan, turquoise
Souches     : moss, mystic-green, violet, magenta, 
              toxic-green, plague-green, dusk, pink-sky
Fond        : obsidian, charcoal, deep-sea
Accents     : neon-cyan (blooms), hot-pink (rares)
```

**Ratios visés** :
- Eau : 45%
- Souches visibles : 30%
- Fond : 20%
- Accents colorés : 5%

### Âge IV — Le Grouillement (Paléozoïque → Mésozoïque)

**Dominante** : vert, brun, ambre
**Ambiance** : foisonnante, vivante, foisonnement

**Palette (16 couleurs)** :
```
Végétation  : dark-forest, forest, moss, grass, leaf, lime
Terre       : deep-brown, earth, clay, sand
Eau         : ocean, wave, sky-water
Ciel        : dawn-pink, sunset, peach, amber
Créatures   : crimson, ember, dusk (variations)
Accents     : mystic-green (rares), royal-gold
```

**Ratios visés** :
- Végétation : 35%
- Terre : 20%
- Eau : 20%
- Ciel : 15%
- Créatures/accents : 10%

### Âge V — Les Étincelles (Préhistoire)

**Dominante** : brun, rouge (feu), terre
**Ambiance** : rustique, chaleureuse, primitive

**Palette (16 couleurs)** :
```
Terre       : deep-brown, umber, earth, clay, sand
Végétation  : dark-forest, forest, moss, grass
Humanoïdes  : clay, pale-sand, umber
Feu         : ember, orange, amber, flame
Ciel        : sunset, peach, dusk, violet (nuit)
Accents     : royal-gold (cérémonies)
```

**Ratios visés** :
- Terre : 30%
- Végétation : 25%
- Ciel : 20%
- Humanoïdes + villages : 15%
- Feu + accents : 10%

### Âge VI — Les Cités (Antiquité → Modernité)

**Dominante** : palette complète, équilibrée
**Ambiance** : varié, humain, civilisationnel

**Palette (24 couleurs — plus large car plus de diversité)** :
```
Base terrain: ceux de l'Âge V
Architecture: stone, slate, bone, clay, sand, ash
Métaux      : royal-gold, silver, rust, crimson
Textiles    : magenta, violet, deep-red, ocean, forest
Cité nuit   : night-purple, obsidian, amber (lumières)
Cité jour   : dawn-pink, sunset, sky-water
Tech moderne: electric-blue, neon-cyan (vers fin Âge VI)
Industrie   : ash-storm, slate, charcoal, rust
```

**Ratios visés** (varient selon sous-âge) :
- Bronze/Fer : terre/vert dominants
- Médiéval : pierre grise dominante
- Industriel : charbon/métal dominants
- Moderne : plus de couleurs saturées

### Âge VII — Le Vide

**Dominante** : bleu nuit, néon, noir
**Ambiance** : froide, inquiétante, cosmique

**Palette (16 couleurs)** :
```
Espace      : void, obsidian, night-purple, deep-purple
Planète     : ocean, wave, ash (polluée)
Structures  : silver, bone, slate, stone
Tech néon   : neon-cyan, electric-blue, hot-pink, magenta
IA          : toxic-green, radioactive
Contact     : void-corrupt (distortion), prismatic (rares)
Lueurs      : amber (lumières artificielles)
```

**Ratios visés** :
- Espace noir : 40%
- Planète : 25%
- Structures artificielles : 20%
- Néons & tech : 10%
- Événements extraordinaires : 5%

---

## Palettes par biome

Chaque biome a sa palette signature, composée de ~6-8 couleurs.

### Biomes terrestres

**Forêt tempérée** :
- Fond : `dark-forest`
- Principal : `forest`, `moss`
- Détails : `grass`, `leaf`
- Terre : `earth`, `deep-brown`
- Accents : `lime` (rares)

**Jungle tropicale** :
- Fond : `dark-forest`
- Principal : `forest`, `mystic-green`
- Détails : `leaf`, `lime`
- Accents : `magenta` (fleurs), `hot-pink`
- Humidité : `moss`

**Désert** :
- Fond : `pale-sand`
- Principal : `sand`, `ochre`
- Ombres : `clay`, `umber`
- Ciel : `sunset`, `peach`
- Accents : `gold-dust`

**Toundra** :
- Fond : `foam`
- Principal : `bone`, `ash`, `stone`
- Neige : `light`, `foam`
- Accents : `cold-blue`, `slate`

**Savane** :
- Fond : `pale-sand`
- Herbe : `grass`, `pale-green`
- Terre : `clay`, `earth`
- Ciel : `amber`, `sunset`
- Arbres : `forest`, `ochre`

**Marais** :
- Fond : `dark-forest`
- Eau : `plague-green`, `moss`
- Végétation : `moss`, `forest`
- Brume : `ash`, `bone`
- Accents : `toxic-green` (rares)

**Montagnes** :
- Base : `stone`, `slate`
- Sommets : `bone`, `foam` (neige)
- Ombres : `charcoal`
- Végétation rare : `dark-forest`, `moss`
- Rochers : `deep-brown`, `umber`

**Volcan** :
- Base : `charcoal`, `obsidian`
- Lave : `ember`, `orange`, `amber`, `flame`
- Roches : `deep-brown`, `crimson`
- Cendres : `ash`, `ash-storm`
- Fond : `blood`, `deep-red`

### Biomes aquatiques

**Océan profond** :
- `abyss` (>70%)
- `deep-sea`
- `void` (les plus profonds)
- Accents : `mystic-green` (luminescence)

**Mer peu profonde** :
- `ocean`, `wave` (dominants)
- `sky-water`, `cyan`
- Corail : `magenta`, `ember` (coraux)
- Sable : `pale-sand`

**Récif corallien** :
- Eau : `cyan`, `turquoise`
- Coraux : `hot-pink`, `magenta`, `orange`, `royal-gold`
- Poissons : accents multiples
- Sable : `foam`, `pale-sand`

**Lagon** :
- `cyan`, `turquoise`, `foam`
- Sable : `pale-sand`, `foam`
- Végétation : `moss`, `lime`

**Rivière** :
- `wave`, `sky-water`
- Rives : `earth`, `grass`
- Pierres : `stone`

**Glacier** :
- `foam`, `sky-water`, `cyan`
- Ombres : `slate`, `cold-blue`
- Cristaux : `light`, `prismatic`

### Biomes extrêmes

**Désert irradié (post-apocalypse)** :
- Sable : `ash-storm`, `clay`
- Radiation : `radioactive`, `toxic-yellow`
- Ciel : `burnt-orange`, `blood`
- Ombres : `void`, `charcoal`

**Terres gelées éternelles** :
- `cold-blue`, `slate`
- `bone`, `foam`
- Ombres : `obsidian`
- Accents : `prismatic`

**Terres corrompues** :
- `void-corrupt`, `plague-green`
- `violet`, `deep-purple`
- Accents : `magenta`, `toxic-green`

---

## Palettes d'ambiance

Palettes utilisées pour l'atmosphère générale d'une scène, indépendamment du biome.

### Jour clair

```
Ciel        : sky-water, foam
Lumière     : amber, gold-dust
Ombres      : slate
```

### Aube

```
Ciel        : dawn-pink, sunset, peach
Horizon     : amber, flame
Ombres      : dusk, violet
```

### Crépuscule

```
Ciel        : dusk, pink-sky, violet
Horizon     : ember, orange, crimson
Ombres      : night-purple
```

### Nuit étoilée

```
Ciel        : obsidian, night-purple
Étoiles     : bone, light, amber (lueurs)
Lune        : bone, foam
Ombres      : void
```

### Orage

```
Ciel        : slate, charcoal, ash-storm
Éclairs     : light, prismatic, electric-blue
Pluie       : sky-water (transparent)
Ambiance    : obsidian (globalement sombre)
```

### Brouillard

```
Ambiance    : ash, bone (voile général)
Éléments    : couleurs normales désaturées de 40%
Ombres      : slate (diluées)
```

### Aube post-apocalyptique

```
Ciel        : blood-storm, burnt-orange
Soleil      : crimson (rouge sang)
Ambiance    : ash-storm (cendres dans l'air)
Ombres      : void-corrupt
```

### Moment mystique / divin

```
Lumière     : royal-gold, amber, flame
Halo        : light, prismatic
Ambiance    : dusk, violet (arrière-plan)
Rayons      : gold-dust, flame
```

---

## Palettes UI

### HUD standard (opacité semi-transparente sur fond)

**Fond HUD** :
- Principal : `obsidian` à 80% opacity
- Bordures : `slate`
- Accents : `royal-gold`

**Texte** :
- Principal : `bone` (à lire facilement)
- Secondaire : `ash`
- Titres : `light` ou `royal-gold`
- Liens/interactifs : `cyan`, `electric-blue`

**Icônes** :
- Normal : `bone`
- Actif : `amber`, `royal-gold`
- Désactivé : `slate`
- Danger : `crimson`

### Boutons et interactions

**Bouton normal** :
- Fond : `slate`
- Bord : `stone`
- Texte : `bone`
- Hover : fond devient `stone`

**Bouton primaire** :
- Fond : `ocean`
- Bord : `electric-blue`
- Texte : `light`
- Hover : glow `cyan`

**Bouton dangereux** :
- Fond : `deep-red`
- Bord : `crimson`
- Texte : `light`
- Hover : glow `ember`

### Notifications

**Succès** :
- Bord : `mystic-green`
- Fond : `dark-forest` à 90%
- Icône : `leaf`

**Avertissement** :
- Bord : `amber`
- Fond : `umber` à 90%
- Icône : `flame`

**Erreur / Danger** :
- Bord : `crimson`
- Fond : `blood` à 90%
- Icône : `crimson`

**Information** :
- Bord : `cyan`
- Fond : `deep-sea` à 90%
- Icône : `sky-water`

### Badges de titres

Par catégorie :

**Primordiaux** (bleu cosmique) :
- Bord : `electric-blue`
- Fond : `night-purple`
- Icône : `cyan`

**Obscurs** (rouge sombre) :
- Bord : `deep-red`
- Fond : `blood`
- Icône : `crimson`

**Rares** (doré) :
- Bord : `royal-gold`
- Fond : `umber`
- Icône : `amber`

**Légendaires** (blanc prismatique) :
- Bord : `prismatic`
- Fond : `deep-purple`
- Icône : `light`

**Interdits** (magenta mystique) :
- Bord : `magenta`
- Fond : `violet`
- Icône : `hot-pink`

---

## Palettes d'apocalypse

Chaque type d'apocalypse a sa signature visuelle.

### 🌠 Impact céleste

**Avant** : palette normale
**Pendant** :
- Ciel : `blood`, `crimson`, `ember`
- Poussière : `ash-storm`
- Éclairs : `flame`
- Explosion : `flame`, `orange`, `crimson`

**Après** :
- Ciel obscurci : `obsidian`, `charcoal`
- Sol : `burnt-orange`, `clay`
- Ambiance : `ash` partout

### ☢️ Hiver des cendres

**Couleurs dominantes** :
- Ciel : `ash-storm`, `charcoal`, `slate`
- Sol : `ash`, `bone` (neige de cendres)
- Rares feux : `ember`, `rust`
- Ombres : `obsidian`

### 🔥 L'Étuve

**Couleurs dominantes** :
- Ciel : `crimson`, `ember`, `orange`
- Sol : `burnt-orange`, `clay`
- Air : vibrations chaudes (`amber` à 20% opacity)
- Végétation morte : `umber`, `deep-brown`

### 🦠 La Grande Faux

**Couleurs dominantes** :
- Ciel : `plague-green` (voile)
- Ambiance : `toxic-yellow`, `moss`
- Ombres : `charcoal`
- Accents : `hot-pink` (points de contamination)

### 🤖 Singularité

**Couleurs dominantes** :
- `neon-cyan`, `electric-blue` (dominants)
- `toxic-green` (IA)
- `void-corrupt` (disparitions)
- `prismatic` (transcendance)
- Ambiance : `obsidian`

### 🌊 Déluge final

**Couleurs dominantes** :
- Eau partout : `abyss`, `deep-sea`, `ocean`
- Ciel : `slate`, `ash-storm`
- Rares terres : `mud-like` (`umber`)
- Éclairs : `electric-blue`

### 👁️ Le Contact

**Couleurs dominantes** :
- `void-corrupt` (distortions)
- `magenta`, `hot-pink` (anomalies)
- `prismatic` (flashs)
- `radioactive` (aura mystérieuse)
- Ambiance : `obsidian`

### 🕳️ Effondrement intérieur

**Couleurs dominantes** :
- Désaturation progressive de toute la palette
- `ash`, `bone`, `slate` (grisaille)
- Rares couleurs vives : `crimson` (violence), `amber` (espoir)

### ⏳ L'Oubli

**Couleurs dominantes** :
- Teintes qui s'effacent progressivement
- Tout devient `ash`, `bone`, `void`
- Une seule couleur vive persiste : `royal-gold` (souvenir)

---

## Couleurs sémantiques

Certaines couleurs ont une signification fixe à travers tout le jeu.

### Codes sémantiques universels

| Couleur | Signification | Usage |
|---------|---------------|-------|
| `royal-gold` | Légendaire, spécial, divin | Titres rares, artefacts, moments clés |
| `crimson` | Danger, guerre, sang | Alertes, conflits, mort |
| `mystic-green` | Mystère, magie, rare | Événements surnaturels |
| `electric-blue` | Technologie, futur | Âge VII, IA, innovations |
| `toxic-green` | Corruption, maladie | Pandémies, IA hostile |
| `prismatic` | Transcendance, divin | Ascension, moments métaphysiques |
| `void` | Inconnu, cosmique | Espace, mystère absolu |
| `amber` | Chaleur, feu, vie | Feu, énergie, lumière |

### Codes par entité

**Viewers** :
- Chaque viewer a sa couleur unique (dérivée hash du pseudo)
- Les couleurs sont choisies dans les familles 3-7 (évite les neutres)

**Espèces** :
- Couleur principale + secondaire héritées du parent
- Mutations modifient légèrement les teintes

**Civilisations** :
- Couleur officielle choisie parmi une liste selon l'archétype :
  - Solaire : `royal-gold`, `amber`, `flame`
  - Lunaire : `deep-purple`, `violet`, `night-purple`
  - Volcanique : `crimson`, `ember`, `rust`
  - Abyssale : `deep-sea`, `ocean`, `wave`
  - Troglodyte : `earth`, `stone`, `umber`
  - Céleste : `electric-blue`, `cyan`, `foam`

**Religions** :
- Palette basée sur la divinité principale :
  - SOL : dorés et orangés
  - NOX : violets et bleus nuit
  - KHRON : gris, cendres, rouille
  - VOX : couleurs impossibles (prismatic, magenta)

---

## Génération procédurale

### Génération de couleur à partir d'un pseudo

Pour attribuer une couleur unique à chaque viewer :

```javascript
function getViewerColor(pseudo) {
  const hash = simpleHash(pseudo);
  
  // Choisir une famille (exclut neutres et apocalypse)
  const families = ['rocks', 'waters', 'vegetation', 'fire', 'sky', 'accents'];
  const family = families[hash % families.length];
  
  // Choisir une teinte dans la famille
  const colors = FAMILIES[family];
  const index = (hash >> 8) % colors.length;
  
  return colors[index];
}
```

### Génération de palette de civilisation

```javascript
function generateCivilizationPalette(founderPseudo, archetype) {
  const base = ARCHETYPE_PALETTES[archetype]; // palette fixe par archétype
  const accent = getViewerColor(founderPseudo); // couleur personnelle du fondateur
  
  return {
    primary: base[0],
    secondary: base[1],
    accent: accent,
    highlight: base[2]
  };
}
```

### Génération de palette d'espèce

Les espèces héritent partiellement de leur parent avec drift :

```javascript
function generateSpeciesColors(parentColors, generation) {
  if (!parentColors) {
    // Première génération : couleur aléatoire d'une famille
    return randomFamily();
  }
  
  // Drift : 70% hérité, 30% muté
  return {
    primary: drift(parentColors.primary, generation),
    secondary: drift(parentColors.secondary, generation)
  };
}

function drift(color, generation) {
  // Déplace la couleur dans la palette d'1-2 crans par génération
  const currentIndex = PALETTE.indexOf(color);
  const shift = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
  const newIndex = (currentIndex + shift + PALETTE.length) % PALETTE.length;
  return PALETTE[newIndex];
}
```

### Génération de palette de saison

Certaines zones du monde traversent des saisons :

```javascript
const SEASONS = {
  spring: { tint: 'leaf', intensity: 0.2 },
  summer: { tint: 'amber', intensity: 0.3 },
  autumn: { tint: 'rust', intensity: 0.4 },
  winter: { tint: 'foam', intensity: 0.35 }
};

function applySeasonTint(baseColor, season) {
  return blend(baseColor, SEASONS[season].tint, SEASONS[season].intensity);
}
```

---

## Accessibilité

### Contrastes

**Texte sur fond** : ratio minimum WCAG AA (4.5:1)

Vérifications clés :
- `bone` sur `obsidian` ✓ (ratio ~15:1)
- `light` sur `deep-sea` ✓ (ratio ~12:1)
- `ash` sur `charcoal` ✓ (ratio ~5:1)
- `amber` sur `umber` ✓ (ratio ~6:1)

**À éviter** :
- `slate` sur `stone` ✗ (ratio ~2:1)
- `moss` sur `forest` ✗ (ratio ~2.5:1)
- `ash` sur `bone` ✗ (ratio ~1.5:1)

### Daltonisme

**Ne jamais** utiliser la couleur **seule** pour transmettre de l'information. Toujours associer à :
- Une forme distincte
- Un symbole / icône
- Un texte

**Couleurs problématiques pour les daltoniens** :
- Rouge (crimson, deep-red) ↔ Vert (forest, moss) : problème pour deutéranopie
- Bleu (ocean) ↔ Violet (violet) : problème pour tritanopie

**Solutions dans le jeu** :
- Guerre (rouge) = symbole ⚔️
- Paix (vert) = symbole ☮️
- Techno (bleu) = symbole ⚙️
- Magie (violet) = symbole ✨

### Mode haute lisibilité (optionnel)

Pour les viewers qui ont besoin de plus de contraste :
- Augmente la saturation de 20%
- Augmente le contraste de 15%
- Backgrounds plus sombres (obsidian → void)
- Textes plus clairs (bone → light)

---

## Export et intégration

### Format du fichier palette

**`palette.json`** (à la racine des assets) :

```json
{
  "version": "1.0",
  "families": {
    "neutrals": [
      { "name": "void", "hex": "#0A0A12", "rgb": [10, 10, 18] },
      { "name": "obsidian", "hex": "#1A1A2E", "rgb": [26, 26, 46] }
    ],
    "rocks": [...],
    "waters": [...],
    "vegetation": [...],
    "fire": [...],
    "sky": [...],
    "accents": [...],
    "apocalypse": [...]
  },
  "semantic": {
    "danger": "crimson",
    "legendary": "royal-gold",
    "mystery": "mystic-green",
    "technology": "electric-blue"
  }
}
```

### Utilisation dans le code

**TypeScript (backend)** :

```typescript
import palette from './assets/palette.json';

export const COLORS = {
  void: '#0A0A12',
  obsidian: '#1A1A2E',
  // ... généré à partir du JSON
} as const;

export type ColorName = keyof typeof COLORS;
```

**CSS (frontend)** :

```css
:root {
  /* Neutres */
  --color-void: #0A0A12;
  --color-obsidian: #1A1A2E;
  --color-charcoal: #2D2D44;
  --color-slate: #4A4A6B;
  --color-stone: #6E6E8A;
  --color-ash: #9191A8;
  --color-bone: #C8C8D4;
  --color-light: #F0F0F5;
  
  /* Roches */
  --color-deep-brown: #2B1810;
  --color-umber: #4A2E1F;
  /* ... */
  
  /* UI */
  --color-ui-bg: rgba(26, 26, 46, 0.8);
  --color-ui-border: var(--color-slate);
  --color-ui-text-primary: var(--color-bone);
  --color-ui-text-secondary: var(--color-ash);
  --color-ui-accent: var(--color-royal-gold);
}
```

**Pixi.js (rendu)** :

```typescript
import { COLORS } from './palette';

// Conversion hex → nombre hex (Pixi)
export function toPixiColor(name: ColorName): number {
  return parseInt(COLORS[name].slice(1), 16);
}

// Usage
sprite.tint = toPixiColor('mystic-green');
```

### Swatches pour les graphistes

**Fichier ASE (Adobe Swatch Exchange)** à distribuer aux graphistes :
- Compatible Photoshop, Illustrator, Affinity, Krita, Aseprite...
- Toutes les 64 couleurs avec leurs noms

**Fichier .pal (pour Aseprite spécifiquement)** :
- Format simple compatible pixel art tools

### Règles pour les contributeurs

1. **Ne jamais** inventer une couleur hors palette
2. **Toujours** utiliser les noms sémantiques dans le code (`COLORS.mystic_green`, pas `#7FE8A8`)
3. **Documenter** si une nouvelle couleur est nécessaire : demander d'abord si on peut utiliser une existante
4. **Ajouts à la palette** : procédure formelle (proposition, test, validation, mise à jour de `palette.json`)

---

## Récapitulatif rapide

### Les 16 couleurs "essentielles" à retenir

Pour 90% des cas, ces 16 couleurs suffisent :

| Rôle | Couleur | Hex |
|------|---------|-----|
| Fond sombre | `obsidian` | `#1A1A2E` |
| Texte principal | `bone` | `#C8C8D4` |
| Eau profonde | `ocean` | `#2B5F8A` |
| Eau claire | `sky-water` | `#7FC0E0` |
| Terre | `earth` | `#6B4423` |
| Roche | `stone` | `#6E6E8A` |
| Forêt | `forest` | `#2B5F2B` |
| Prairie | `grass` | `#6B9B4F` |
| Feu | `ember` | `#D46B3D` |
| Flamme | `flame` | `#FFD77F` |
| Danger | `crimson` | `#9B2B2B` |
| Ciel aube | `sunset` | `#FFC4A3` |
| Ciel nuit | `night-purple` | `#1A0F2E` |
| Légendaire | `royal-gold` | `#FFD700` |
| Technologie | `electric-blue` | `#3D8AFF` |
| Mystique | `mystic-green` | `#7FE8A8` |

### Check-list "Ai-je bien utilisé la palette ?"

- [ ] Toutes les couleurs viennent de la palette officielle (pas d'invention)
- [ ] Ratio 60/30/10 respecté (dominante, secondaire, accent)
- [ ] Les contrastes de texte sont suffisants (WCAG AA)
- [ ] Pas de couleur seule pour une info importante (icônes/symboles associés)
- [ ] La scène a une dominante claire (pas de palette complète à 100%)
- [ ] Les accents rares (gold, prismatic) sont utilisés avec parcimonie
- [ ] L'ambiance globale correspond à l'âge / événement

---

## ✨ Conclusion

Cette palette est **un langage visuel** avant d'être une collection de couleurs. Respecter la palette = parler la langue de Genesis Live.

### Principes à ne jamais violer

1. **Palette finie** : 64 couleurs, pas une de plus
2. **Cohérence sémantique** : les codes (rouge=danger, or=légendaire) ne changent jamais
3. **Accessibilité** : jamais la couleur seule pour une info
4. **Noms sémantiques** : toujours utiliser les noms dans le code, jamais les hex directs

### Principes à faire évoluer

1. **Nouvelles combinaisons** : la palette autorise une infinité de recompositions
2. **Ratios par scène** : à affiner selon l'esthétique désirée
3. **Variations procédurales** : drift des couleurs pour les espèces/civilisations

### Évolution possible

Si un jour la palette doit être étendue :
- Documenter la raison
- Proposer une version 1.1 de `palette.json`
- Tester dans plusieurs scènes avant validation
- Mettre à jour tous les swatches distribués

Mais **pour l'instant, 64 couleurs = une contrainte créative forte**. Embrassez-la.

---

*Document de référence visuelle — v1.0*
*La palette est le squelette visuel du jeu. Traitez-la comme sacrée.*
