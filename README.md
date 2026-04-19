# Genesis Live

> Un stream 24/7 où une planète entière vit, meurt et renaît — pilotée par le chat.

Genesis Live est un projet de **simulation émergente diffusée en direct**, dans laquelle les viewers influencent collectivement l'évolution d'une planète fictive à travers 7 âges (du feu primordial à la civilisation spatiale), jusqu'à l'apocalypse, puis le cycle recommence. Un cycle complet dure **6 à 12 mois** en temps réel.

Le stream est diffusé simultanément sur **YouTube Live** et **Twitch**, avec un chat unifié.

## État du projet

Phase de conception terminée. Ce repo contient les **12 documents de référence** qui définissent le moteur, le lore, le rendu, l'audio, la modération et la roadmap. Le code viendra ensuite.

## Documentation

### Vision et narratif
- [genesis_live_lore.md](genesis_live_lore.md) — Cosmologie, 7 âges, Panthéon des viewers, apocalypses, mythes
- [genesis_live_commands.md](genesis_live_commands.md) — Toutes les commandes chat par âge

### Moteur et architecture
- [simulation_rules.md](simulation_rules.md) — Règles du moteur, cycles, vitesse, titres
- [data_model.md](data_model.md) — Entités, persistance, migrations, exports
- [architecture.md](architecture.md) — Stack, modules, patterns, diffusion multi-plateforme
- [chat_integration.md](chat_integration.md) — YouTube + Twitch, parsing, modération auto

### Rendu et identité
- [render_spec.md](render_spec.md) — Pixi.js, projection globe ↔ iso, HUD, caméra cinématique
- [audio_design.md](audio_design.md) — Musique adaptative par âge, SFX, apocalypses sonores
- [color_palette.md](color_palette.md) — 64 couleurs officielles, palettes par âge et biome

### Opérations
- [content_moderation.md](content_moderation.md) — Catégories, sanctions, raids, protocoles de crise
- [coding_best_practices.md](coding_best_practices.md) — Conventions de code, tests, dette technique
- [roadmap.md](roadmap.md) — Phases 0 à 8, jalons, risques, budget temps

## Concept en 3 phrases

1. Une planète simulée tick par tick, dont chaque rocher, créature, civilisation est une entité persistante avec un nom.
2. Les viewers tapent des commandes (`!rain`, `!seed`, `!city`, `!nuke`...) qui modifient le monde — leurs noms entrent dans les légendes et traversent les cycles.
3. Quand la civilisation s'effondre (apocalypse), un nouveau cycle démarre sur les ruines du précédent. Rien n'est perdu, tout est archivé.

## Prérequis techniques (à venir)

- Node.js 20+
- SQLite
- OBS Studio 29+
- Relais multistream (Restream.io ou NGINX-RTMP self-hosted)

## Workflow Git

### Règles d'or

1. **Jamais commiter sur `main` directement** (sauf pour la phase doc actuelle). Dès que le code arrive, chaque changement passe par une branche.
2. **Jamais de secrets dans le repo** : `.env`, clés API, tokens, mots de passe. Le `.gitignore` exclut déjà `.env*` — ne pas forcer l'ajout avec `git add -f`.
3. **Toujours `git pull --rebase` avant de pousser** pour éviter les merges inutiles.
4. **Un commit = une idée cohérente**. Pas de « WIP » fourre-tout dans la branche principale. Si plusieurs choses sont faites, split avec `git add -p`.
5. **Jamais `--force` sur `main`**. Sur une branche perso, OK (`--force-with-lease` de préférence).

### Branches

```
main                 # branche stable, toujours déployable
├── doc/xxx          # modifications de documentation
├── feat/xxx         # nouvelle fonctionnalité (ex: feat/age4-evolution)
├── fix/xxx          # correction de bug
├── refactor/xxx     # refactoring sans changement de comportement
└── chore/xxx        # outillage, config, deps (ex: chore/update-pixi)
```

**Créer une branche** :
```bash
git checkout -b feat/age4-evolution
```

### Messages de commit

Format court, à l'impératif, en minuscules, avec préfixe optionnel :

```
feat: ajouter la spéciation à l'âge IV
fix: corriger le calcul de fitness pour les espèces aquatiques
docs: aligner les durées de cycle sur 6-12 mois
refactor: extraire le calculateur de pression dans son propre module
chore: mettre à jour Pixi.js vers 7.4
```

**À éviter** : `WIP`, `update`, `fix stuff`, `.`, commit messages génériques qui ne disent rien 6 mois plus tard.

**Pour les commits multi-lignes** (utile quand le contexte est important) :
```
feat: refondre le système de titres

- Aligner les 21 titres du Panthéon avec simulation_rules.md
- Ajouter les conditions mesurables + moment d'attribution
- Supprimer Le Héros Éternel (remplacé par Le Légendaire)

Ref: genesis_live_lore.md#panthéon
```

### Workflow type sur une branche de feature

```bash
# 1. Partir d'un main à jour
git checkout main
git pull --rebase origin main

# 2. Créer la branche
git checkout -b feat/ma-feature

# 3. Coder, commiter au fil de l'eau
git add <fichiers précis>   # éviter git add -A
git commit -m "feat: ..."

# 4. Avant de pousser, rebase sur main si main a bougé
git fetch origin
git rebase origin/main

# 5. Pousser
git push -u origin feat/ma-feature

# 6. Ouvrir une Pull Request sur GitHub
```

### Tags et releases

Utiliser des tags semver quand une version est prête à être "jouée" en stream :

```bash
git tag -a v0.1.0 -m "MVP simulation — fin Phase 2"
git push origin v0.1.0
```

Correspondance avec la [roadmap](roadmap.md) :
- `v0.1` → fin Phase 2 (MVP simulation)
- `v0.2` → fin Phase 3 (chat intégré)
- `v0.5` → fin Phase 5 (polish visuel + audio)
- `v1.0` → lancement public (fin Phase 7)

### Ce qui ne doit JAMAIS être commité

- Fichiers `.env*` (hors `.env.example`)
- Clés API (YouTube, Twitch OAuth, Discord webhooks)
- Dossiers `node_modules/`, `dist/`, `build/`
- Bases de données (`*.sqlite`), snapshots, archives de cycles
- Logs (`*.log`)
- Fichiers d'assistants IA (`.claude/`, `CLAUDE.md`)
- Fichiers de config d'IDE personnels (`.vscode/`, `.idea/`)

Tous couverts par le `.gitignore`. Si tu ajoutes une nouvelle catégorie, mets-la dans `.gitignore` **avant** le premier commit concerné.

### Récupérer d'une erreur

**Commité par erreur un fichier** (pas encore poussé) :
```bash
git reset --soft HEAD~1       # annule le commit, garde les modifs
git restore --staged <fichier>  # unstage le fichier
```

**Commité un secret par erreur** (pas encore poussé) : idem ci-dessus. **Déjà poussé** : [rotation immédiate du secret concerné](https://docs.github.com/code-security/secret-scanning/about-secret-scanning), puis réécriture d'historique (`git filter-repo` ou BFG). Un secret public 30 secondes doit être considéré comme compromis.

**Besoin de revenir à un état propre sans perdre le travail** :
```bash
git stash                  # met de côté les modifs non commitées
git checkout main
git pull --rebase
git checkout ma-branche
git stash pop
```

## Licence

À définir.

---

*Documentation v1.0 — avril 2026*
