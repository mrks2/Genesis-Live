# Contribuer à Genesis Live

Merci de ton intérêt pour Genesis Live. Ce document explique comment contribuer efficacement au projet, que ce soit du code, de la documentation, du design, du contenu narratif ou du feedback.

## Sommaire

1. [Avant de commencer](#avant-de-commencer)
2. [Types de contributions](#types-de-contributions)
3. [Signaler un bug](#signaler-un-bug)
4. [Proposer une amélioration](#proposer-une-amélioration)
5. [Contribuer au code](#contribuer-au-code)
6. [Contribuer à la documentation](#contribuer-à-la-documentation)
7. [Contribuer au lore](#contribuer-au-lore)
8. [Contribuer aux assets (graphiques, audio)](#contribuer-aux-assets-graphiques-audio)
9. [Code de conduite](#code-de-conduite)

---

## Avant de commencer

1. **Lis la [roadmap](roadmap.md)** pour comprendre la phase actuelle du projet. Une contribution qui correspond à la phase en cours a beaucoup plus de chances d'être intégrée rapidement.
2. **Lis la [philosophie du projet](genesis_live_lore.md#philosophie-du-monde)**. Genesis Live a des principes forts (émergence, persistance, pacte silencieux avec les viewers) — les contributions doivent s'aligner avec.
3. **Regarde les [issues ouvertes](https://github.com/mrks2/Genesis-Live/issues)** et les [pull requests en cours](https://github.com/mrks2/Genesis-Live/pulls) pour éviter les doublons.
4. **Pour les gros changements**, ouvre d'abord une issue « discussion » avant d'écrire du code ou de gros volumes de doc. Ça évite les efforts perdus.

---

## Types de contributions

| Type | Exemples |
|------|----------|
| **Bug** | Moteur qui crashe, commande qui ne répond pas, rendu incorrect |
| **Feature** | Nouvelle commande chat, nouveau type d'apocalypse, optimisation |
| **Doc** | Typo, clarification, exemple manquant, incohérence entre deux MDs |
| **Lore** | Nouvelle civilisation archétypale, nouveau mythe, artefact |
| **Design** | Palette de couleurs, sprite, animation, UI mockup |
| **Audio** | SFX, stem musical, sound design d'apocalypse |
| **Feedback** | Retour d'usage en tant que viewer, suggestion d'équilibrage |

Toutes ces contributions sont les bienvenues. Les plus urgentes dépendent de la phase de la roadmap.

---

## Signaler un bug

### Avant d'ouvrir une issue

- Vérifie qu'elle n'existe pas déjà (recherche dans les issues ouvertes **et** fermées)
- Essaie de reproduire le bug au moins 2 fois
- Note la version / commit concerné

### Template d'issue bug

```markdown
## Description
[Une phrase claire qui dit ce qui ne va pas]

## Étapes pour reproduire
1. Aller sur...
2. Taper la commande...
3. Observer...

## Résultat attendu
[Ce qui devrait se passer]

## Résultat observé
[Ce qui se passe réellement]

## Environnement
- OS : Windows 11 / macOS / Linux
- Navigateur (si applicable) : Chrome 120 / Firefox 121
- Version/commit : `git rev-parse --short HEAD`
- Heure approximative (pour retrouver les logs) : 2026-04-19 14h32

## Logs / captures (optionnel mais apprécié)
```

### Priorités

| Sévérité | Exemples | Délai cible |
|----------|----------|-------------|
| 🔴 **Critique** | Stream down, perte de données, faille de sécurité | Heures |
| 🟠 **Haute** | Fonctionnalité majeure cassée, crash fréquent | 1-3 jours |
| 🟡 **Moyenne** | Bug visible mais contournable | 1-2 semaines |
| 🟢 **Basse** | Typo, léger désagrément visuel | Best effort |

Si tu ne sais pas, laisse la sévérité vide — le mainteneur la fixera.

---

## Proposer une amélioration

Pour une feature ou une idée d'amélioration :

1. Ouvre une issue avec le label `enhancement`
2. Utilise ce template :

```markdown
## Problème résolu
[Quel problème ou manque cette amélioration adresse-t-elle ?]

## Solution proposée
[Description claire, avec exemples concrets]

## Alternatives envisagées
[Autres pistes que tu as considérées, et pourquoi tu les as écartées]

## Impact estimé
- Sur le viewer : ...
- Sur le moteur : ...
- Effort de développement : S / M / L
```

3. Attends un retour avant de coder. Les propositions qui ne rentrent pas dans la vision du projet seront fermées avec une explication — ce n'est pas un rejet personnel.

---

## Contribuer au code

### Prérequis

- **Node.js 20+** (voir [README](README.md#prérequis-techniques-à-venir))
- Git + compte GitHub
- Un éditeur (VS Code recommandé, config partagée à venir)

### Setup initial

```bash
git clone https://github.com/mrks2/Genesis-Live.git
cd Genesis-Live
npm install            # quand le package.json existera
cp .env.example .env   # remplir les variables locales
npm run dev            # lancer en mode développement
```

### Standards de code

Lire [coding_best_practices.md](coding_best_practices.md) en entier **avant** la première PR. Les règles clés :

- **Fonctions courtes et focalisées** (20-30 lignes max, une seule responsabilité)
- **Noms explicites**, pas d'abréviations obscures
- **Pas de commentaires pour expliquer le code** — le code doit parler de lui-même. Les commentaires expliquent le *pourquoi*, pas le *quoi*
- **Immutabilité par défaut** sur les structures de données
- **Validation aux frontières** (chat input, API, WebSocket) — jamais à l'intérieur
- **Tests systématiques** sur les règles de simulation et le parser de commandes

### Workflow Git

Voir [README.md § Workflow Git](README.md#workflow-git). Les essentiels :

- Branche typée : `feat/`, `fix/`, `doc/`, `refactor/`, `chore/`
- Messages à l'impératif avec préfixe (`feat:`, `fix:`, etc.)
- Rebase sur `main` avant de pousser
- Pas de `git push --force` sur `main`

### Pull Request

1. **Un seul sujet par PR**. Une PR qui ajoute une feature ET fait du refactor non lié = deux PRs.
2. **Description claire** :
   - Quoi : ce que la PR fait
   - Pourquoi : le problème qu'elle résout (lien vers l'issue si applicable)
   - Comment tester : étapes pour valider manuellement
   - Screenshots / GIF si changement visuel
3. **Tests verts** obligatoires (CI doit passer)
4. **Review** : attendre au moins une approbation avant de merger
5. **Squash merge** par défaut (historique de `main` propre)

### Checklist avant de demander une review

- [ ] Le code tourne localement sans warning
- [ ] Les tests passent (`npm test`)
- [ ] Le linter passe (`npm run lint`)
- [ ] Aucun `console.log` ou code commenté oublié
- [ ] La doc est à jour si l'API ou le comportement change
- [ ] Le CHANGELOG est mis à jour (quand il existera)
- [ ] Pas de secret / `.env` commité

---

## Contribuer à la documentation

La documentation est **aussi importante que le code**. Un bon changement de doc peut débloquer des contributeurs pour des mois.

### Règles

1. **Cohérence entre les 12 MDs** : si tu modifies un concept dans un fichier, vérifie les références dans les autres (ex: modifier la durée d'un âge dans `simulation_rules.md` implique de vérifier `genesis_live_lore.md` et `roadmap.md`)
2. **Liens markdown** : toujours utiliser la syntaxe relative `[texte](fichier.md#ancre)` pour que les liens marchent sur GitHub **et** dans les IDEs
3. **Exemples concrets** : un bloc de code, un tableau, une commande valent mieux qu'un paragraphe abstrait
4. **Pas de jargon non expliqué** : la première occurrence d'un terme spécifique doit être définie ou renvoyer au [Glossaire](genesis_live_lore.md#glossaire)

### Typos et petits fixes

Pas besoin d'ouvrir d'issue. PR directe avec un message type :

```
docs: corriger typo dans simulation_rules.md
```

### Réécritures majeures

Ouvrir une issue `discussion` d'abord. Sinon tu risques de réécrire 500 lignes qui seront rejetées pour divergence de vision.

---

## Contribuer au lore

Le [lore](genesis_live_lore.md) est le cœur narratif. Les contributions de lore sont précieuses **mais exigeantes** :

### Ce qui est bienvenu

- Nouveaux mythes récurrents cohérents avec les 7 Âges
- Archétypes de civilisations non encore listés
- Artefacts persistants (règles : indestructibles, traversent les cycles, mystérieux)
- Titres de viewers avec conditions mesurables
- Extensions du glossaire

### Ce qui ne passera pas

- Contenu qui contredit la cosmologie établie (VOX = chat, 7 âges, cycle → apocalypse → renaissance)
- Éléments trop explicites ou « expliquants » (le mystère est structurel — voir [§mystère non résolu](genesis_live_lore.md#le-mystère-non-résolu))
- Références directes à notre monde réel (pas de mention d'années terrestres, de pays, de marques)
- Contenu humoristique / 4ème mur systématique (reste réservé aux [commandes cachées](genesis_live_commands.md#commandes-cachées--secrètes))

### Format

Tout ajout de lore doit :
1. S'intégrer dans une section existante (pas créer une nouvelle section sans discussion préalable)
2. Respecter le **ton** : mythologique, contemplatif, légèrement solennel
3. Mentionner le titre correspondant dans `simulation_rules.md` si une nouvelle commande ou condition est introduite (cohérence tri-document : lore → sim → commands)

---

## Contribuer aux assets (graphiques, audio)

### Graphiques

- **Style obligatoire** : pixel art, palette limitée à [color_palette.md](color_palette.md) (64 couleurs officielles)
- **Tailles** : selon [render_spec.md](render_spec.md) (sprites 16×16, 32×32, tuiles iso 32×16)
- **Format** : PNG avec transparence, nommé `<catégorie>_<nom>_<variante>.png` (ex: `species_milavirex_idle.png`)
- **Source** : fournir le fichier source (Aseprite `.ase` / `.aseprite` de préférence)
- **License** : tu certifies en contribuant que l'asset est original ou sous licence compatible (CC0, CC-BY, MIT-like)

### Audio

- **Conformité** : [audio_design.md](audio_design.md) (normalisation -14 LUFS, no stroboscopique, respect des stems)
- **Format** :
  - SFX : WAV 44.1 kHz 16-bit
  - Musique : WAV ou OGG Vorbis (~200 kbps) stéréo
- **Nommage** : `<catégorie>_<nom>_<variante>.ext` (ex: `sfx_volcano_eruption_01.wav`, `music_age4_stem_drums.ogg`)
- **Durée** : les stems musicaux doivent être **loopables** (pas de fade-in/out naturel)
- **License** : même règle que pour les graphiques

### Organisation

Les assets vont dans (quand le code existera) :
```
frontend/src/assets/
├── sprites/
├── tilesets/
├── fonts/
audio/
├── sfx/
├── music/
└── ambience/
```

---

## Code de conduite

Ce projet adopte une version simplifiée du [Contributor Covenant](https://www.contributor-covenant.org/) :

### Attendu

- Respect mutuel
- Accueil des newcomers avec patience
- Critiques centrées sur le code / la contribution, jamais sur la personne
- Reconnaissance du travail des autres

### Inacceptable

- Insultes, harcèlement, discrimination (race, genre, orientation, religion, handicap, âge)
- Spam, auto-promotion hors sujet
- Contenu illégal, sexuel non sollicité, ou incitation à la violence
- Tentative de nuire au projet (vandalisme, empoisonnement de PR, doxing)

Les violations peuvent entraîner un ban du repo sans préavis. Pour signaler un problème : ouvre une issue privée ou contacte directement le mainteneur.

---

## Remerciements

Chaque contribution — qu'elle soit d'une ligne ou de mille — fait avancer Genesis Live. Les contributeurs seront listés dans le fichier `CREDITS.md` (créé au premier merge externe), et les viewers les plus actifs du stream verront leurs pseudos passer dans les **mythes des cycles** à travers le mécanisme de [pseudo-lineage](genesis_live_lore.md#glossaire).

Merci.

---

*Guide de contribution v1.0 — à faire évoluer avec le projet.*
