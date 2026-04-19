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

## Licence

À définir.

---

*Documentation v1.0 — avril 2026*
