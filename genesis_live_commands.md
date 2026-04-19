# ⌨️ GENESIS LIVE — Référentiel des commandes

*Toutes les commandes disponibles dans le chat, leurs effets, coûts et mécaniques.*

---

## 📖 Table des matières

1. [Principes généraux](#principes-généraux)
2. [Système économique](#système-économique)
3. [Commandes universelles](#commandes-universelles)
4. [Commandes — Âge I (Feu)](#commandes--âge-i-feu)
5. [Commandes — Âge II (Eaux)](#commandes--âge-ii-eaux)
6. [Commandes — Âge III (Germes)](#commandes--âge-iii-germes)
7. [Commandes — Âge IV (Grouillement)](#commandes--âge-iv-grouillement)
8. [Commandes — Âge V (Étincelles)](#commandes--âge-v-étincelles)
9. [Commandes — Âge VI (Cités)](#commandes--âge-vi-cités)
10. [Commandes — Âge VII (Vide)](#commandes--âge-vii-vide)
11. [Commandes passives (likes & subs)](#commandes-passives-likes--subs)
12. [Commandes cachées / secrètes](#commandes-cachées--secrètes)
13. [Commandes de modération](#commandes-de-modération)
14. [Tableau récapitulatif](#tableau-récapitulatif)

---

## Principes généraux

### Philosophie du système de commandes

**1. Aucune commande ne garantit un résultat**
Chaque commande modifie des **probabilités** ou **paramètres** — jamais directement le résultat final. Un viewer ne "contrôle" rien, il influence.

**2. Toute action a une conséquence**
Même les commandes "gentilles" peuvent avoir des effets secondaires. `!rain` trop souvent = inondation.

**3. Les commandes sont contextuelles**
Toutes les commandes ne sont pas disponibles dans tous les âges. Utiliser `!city` à l'Âge I ne fait rien (ou trigger un message du moteur).

**4. Les commandes s'attribuent au pseudo**
L'action et ses conséquences restent associées au viewer **pour toujours**. Son nom entre dans les chroniques.

### Syntaxe générale

```
!commande [param1] [param2]
```

- **Préfixe** : `!` pour toutes les commandes publiques
- **Nom** : en minuscules, un seul mot
- **Paramètres** : optionnels selon la commande, séparés par espaces
- **Insensible à la casse** : `!RAIN`, `!Rain`, `!rain` fonctionnent pareil

### Système de cooldown

Chaque commande a un **cooldown personnel** (par viewer) pour éviter le spam :
- **Court** : 30 secondes (commandes mineures)
- **Moyen** : 2-5 minutes (commandes standard)
- **Long** : 10-30 minutes (commandes puissantes)
- **Par cycle** : 1 seule fois par cycle (commandes majeures)
- **Global** : cooldown partagé entre tous les viewers (commandes uniques)

---

## Système économique

### Points d'Influence (PI)

Chaque viewer accumule des **Points d'Influence** en étant présent. Les valeurs canoniques sont définies dans [chat_integration.md §Accumulation des PI](chat_integration.md#accumulation-des-pi) ; résumé :
- **+1 PI** par minute de présence (cap anti-spam : 100 PI/min via chat)
- **+10 PI** par message de chat (**+25** si message long/pertinent)
- **+5 PI** par like, **+50** par partage
- **+500 PI** pour un nouvel abonnement, **+250** pour un resub, **+100** pour un sub offert, **+1000** pour un tier supérieur
- **+100 PI par euro** de don (minimum 500 PI)
- Bonus : **+50** par jour de présence, **+10** par jour consécutif, **+200** au retour après un cycle d'absence, paliers **+500 / +5000** aux 100ᵉ / 1000ᵉ actions

Les PI permettent d'utiliser les commandes : certaines sont **gratuites**, d'autres **coûteuses**.

### Catégories de coût

| Symbole | Coût | Description |
|---------|------|-------------|
| 🆓 | 0 PI | Gratuit, illimité (sauf cooldown) |
| 💠 | 50 PI | Commande mineure |
| 💎 | 200 PI | Commande standard |
| 👑 | 1000 PI | Commande majeure |
| 🌟 | 5000 PI | Commande légendaire |
| ⚡ | Sub uniquement | Réservée aux abonnés |
| 🔥 | Superchat | Déclenchée par don monétaire |

### Règles anti-spam

- **Limite de 3 commandes par viewer par minute** (toutes commandes confondues)
- **Pénalité** : spam → cooldown de 10 minutes sur toutes les commandes
- **Bans automatiques** après 5 pénalités consécutives

---

## Commandes universelles

*Disponibles dans tous les âges.*

### `!help` 🆓
**Effet** : envoie un message privé au viewer avec la liste des commandes disponibles dans l'âge actuel.
**Cooldown** : 5 minutes

### `!status` 🆓
**Effet** : affiche brièvement à l'écran l'état actuel de la planète (âge, température, pop, etc.).
**Cooldown** : 2 minutes
**Limite** : max 1 activation par minute (globale)

### `!me` 🆓
**Effet** : affiche les stats du viewer (PI, titres gagnés, actions totales, cycle de première arrivée).
**Cooldown** : 1 minute

### `!lore [sujet]` 🆓
**Effet** : affiche un extrait du Grand Registre sur le sujet demandé (âge, civilisation, espèce, cycle).
**Exemples** : `!lore age3`, `!lore tomsgx`, `!lore cycle14`
**Cooldown** : 2 minutes

### `!prophecy` 💠
**Effet** : génère une prophétie cryptique sur les prochains ticks. Parfois vraie, parfois fausse. Donne des indices sur les événements à venir.
**Cooldown** : 10 minutes

### `!pray` 🆓
**Effet** : augmente légèrement la "Faveur Divine" du viewer. N'a pas d'effet direct, mais influence les probabilités de titres mystiques.
**Cooldown** : 30 secondes

### `!name [nouveau_nom]` 💎
**Effet** : si le viewer a fondé une entité (espèce, cité, religion), il peut la renommer une fois.
**Limite** : 1 fois par entité possédée
**Restrictions** : nom max 20 caractères, pas de caractères spéciaux, pas de noms offensants

### `!observe [coordonnées/entité]` 💠
**Effet** : demande à la caméra de zoomer sur un point précis pendant 30 secondes. Les viewers votent la cible la plus demandée. La caméra bascule automatiquement en vue isométrique au-delà du seuil de zoom (voir [render_spec.md §Projection adaptative au zoom](render_spec.md#projection-adaptative-au-zoom)).
**Cooldown** : 5 minutes

### `!link [plateforme] [pseudo]` 🆓
**Effet** : lie manuellement un pseudo d'une autre plateforme au viewer courant (ex: un viewer YouTube lie son compte Twitch). Fusionne les PI et l'historique des deux viewers. Voir [chat_integration.md §Résolution d'identité cross-platform](chat_integration.md#résolution-didentité-cross-platform).
**Validation** : nécessite une confirmation depuis le compte cible dans un délai de 5 minutes.
**Cooldown** : 1 heure

---

## Commandes — Âge I (Feu)

*La planète est en formation. Température extrême. Aucune vie possible.*

### `!impact` 💠
**Effet** : fait tomber une météorite aléatoire sur la planète.
- Météorite petite (70%) : +masse, pas d'effet majeur
- Météorite moyenne (25%) : crée un cratère, ajoute minéraux
- Météorite géante (5%) : impact majeur, peut former la Lune Jumelle si ce n'est pas déjà fait
**Cooldown** : 2 minutes
**Titre possible** : *Le Lanceur* si le viewer déclenche 10 impacts dans le cycle

### `!volcano [intensité]` 💠
**Effet** : déclenche une éruption volcanique.
- `light` (gratuit) : petite éruption locale
- `medium` (défaut) : éruption normale, libère gaz et cendres
- `massive` (💎) : super-éruption, peut obscurcir l'atmosphère
**Cooldown** : 3 minutes
**Titre possible** : *Le Forgeron* pour la plus grosse éruption du cycle

### `!cool` 🆓
**Effet** : accélère légèrement le refroidissement global (-0.1°C).
**Limite** : effet dilué — 100 viewers qui l'utilisent = seulement -5°C total
**Cooldown** : 1 minute

### `!heat` 💠
**Effet** : réchauffe la planète (+0.2°C) et retarde l'apparition des océans.
**Cooldown** : 3 minutes
**Attention** : utilisée en excès, bloque la progression vers l'Âge II

### `!shake` 💠
**Effet** : déclenche un tremblement de terre. Peut déplacer les continents naissants, créer des failles.
**Cooldown** : 5 minutes

### `!gas [type]` 💎
**Effet** : injecte un gaz dans l'atmosphère primitive. Influence l'ambiance future.
- `oxygen` : accélère l'apparition de la vie (Âges III+)
- `methane` : rend l'atmosphère plus toxique (extrémophiles favorisés)
- `nitrogen` : stabilise l'atmosphère
- `co2` : réchauffe long terme
**Cooldown** : 10 minutes

### `!comet` 👑
**Effet** : fait tomber une comète glacée. Ajoute massivement de l'eau. **Principal moyen d'accélérer le passage à l'Âge II.**
**Cooldown** : 15 minutes
**Titre possible** : *Le Porteur d'Eau* (très convoité)

### `!ring` 🌟
**Effet** : crée un système d'anneaux autour de la planète (comme Saturne). Effet purement esthétique mais permanent pour le cycle.
**Cooldown** : 1 fois par cycle (global)
**Titre** : *Le Couronneur*

---

## Commandes — Âge II (Eaux)

*Océans se forment, continents dérivent, atmosphère se stabilise.*

### `!rain [durée]` 🆓
**Effet** : déclenche une pluie.
- Sans paramètre : 5 minutes de pluie modérée
- `storm` (💠) : orage avec éclairs pendant 10 min
- `monsoon` (💎) : pluie diluvienne prolongée
**Cooldown** : 3 minutes

### `!comet` 💠
**Effet** : continue d'ajouter de l'eau. Toujours utile mais moins crucial qu'en Âge I.
**Cooldown** : 10 minutes

### `!quake` 💠
**Effet** : active la tectonique. Fait dériver les continents de façon aléatoire. Peut créer chaînes de montagnes ou séparer des terres.
**Cooldown** : 5 minutes

### `!tsunami` 💎
**Effet** : génère une vague massive. Érode les côtes, remodèle les continents. Dangereux si la vie est déjà apparue.
**Cooldown** : 10 minutes

### `!freeze` 💎
**Effet** : déclenche un âge glaciaire partiel. Diminue la température, forme des calottes.
**Cooldown** : 15 minutes
**Attention** : peut geler toute la planète si utilisée en combo avec `!cool`

### `!lightning` 💠
**Effet** : fait tomber la foudre. À l'Âge II, peut théoriquement amorcer les premières molécules pré-biotiques.
**Cooldown** : 2 minutes
**Effet caché** : accumulation d'éclairs → accélère le passage à l'Âge III

### `!tide` 🆓
**Effet** : augmente légèrement l'amplitude des marées. Favorise la diversité biologique future dans les zones côtières.
**Cooldown** : 2 minutes
**Limite** : nécessite que la Lune existe

### `!current [direction]` 💠
**Effet** : influence la direction des courants océaniques. Important pour les futures migrations et climats.
**Cooldown** : 10 minutes

### `!island` 👑
**Effet** : fait émerger une nouvelle île volcanique au nom du viewer. Elle persiste dans le cycle (et laisse des traces au cycle suivant).
**Cooldown** : 1 fois par cycle par viewer
**Titre** : *Le Géographe*

---

## Commandes — Âge III (Germes)

*Première vie microbienne. Les viewers deviennent des souches.*

### `!seed [couleur]` 💠
**Effet** : injecte une souche de micro-organismes nommée du pseudo viewer.
- Sans couleur : aléatoire
- Avec couleur (`red`, `blue`, `green`, `purple`, `yellow`, `white`, `black`, `cyan`, `orange`) : influence les traits
**Cooldown** : 10 minutes
**Effet** : la souche hérite du pseudo et d'une palette de traits dérivée du hash du pseudo
**Titre possible** : *La Semeuse* si la souche domine l'âge

### `!mutate [cible]` 💠
**Effet** : force une mutation aléatoire sur une souche.
- Sans cible : affecte une souche aléatoire
- Avec pseudo de souche : cible spécifique
**Cooldown** : 5 minutes
**Effet** : peut créer une nouvelle sous-espèce, rendre stérile, ou donner un trait légendaire

### `!oxygen` 💎
**Effet** : booste la photosynthèse. Favorise les souches vertes/photosynthétiques.
**Cooldown** : 10 minutes
**Effet secondaire** : trop d'oxygène → extinction des souches anaérobies (Grand Empoisonnement)

### `!poison` 💎
**Effet** : libère des toxines dans les océans. Favorise les souches résistantes, tue les fragiles.
**Cooldown** : 10 minutes

### `!merge [souche1] [souche2]` 👑
**Effet** : tente de fusionner deux souches. 20% de réussite → **Le Premier Baiser**, crée l'eucaryote originel.
**Cooldown** : 30 minutes
**Titre** : *L'Unificateur* si la fusion réussit

### `!current [direction]` 💠
**Effet** : influence les courants, donc la dispersion des souches.
**Cooldown** : 10 minutes

### `!depth` 💠
**Effet** : pousse une souche vers les abysses où elle peut évoluer différemment (extrémophile).
**Cooldown** : 15 minutes

### `!light` 💠
**Effet** : augmente la lumière atteignant les océans de surface. Favorise la photosynthèse.
**Cooldown** : 10 minutes

### `!complex` 👑
**Effet** : tente de pousser une souche vers la multicellularité. Condition principale pour passer à l'Âge IV.
**Cooldown** : 20 minutes
**Réussite** : 30% (plus élevé si la souche a certains traits)

### `!extinct [souche]` 🌟
**Effet** : tente d'éliminer une souche spécifique. Coûteux mais peut changer l'évolution.
**Cooldown** : 1 fois par cycle
**Attention** : peut rater si la souche est trop dominante

---

## Commandes — Âge IV (Grouillement)

*Vie complexe. Créatures marines, terrestres, volantes. L'ère des monstres.*

### `!evolve [nom]` 💠
**Effet** : déclenche une évolution dirigée sur une espèce existante. Le pseudo du viewer devient le nouveau nom de la sous-espèce.
**Cooldown** : 10 minutes

### `!spawn [type]` 💎
**Effet** : introduit une nouvelle espèce dans l'écosystème.
- `aquatic` : créature marine
- `terrestrial` : créature terrestre
- `aerial` : créature volante
- `amphibian` : créature amphibie
**Cooldown** : 15 minutes

### `!mutate [espèce]` 💠
**Effet** : force une mutation. Peut créer des traits utiles ou monstrueux.
**Cooldown** : 5 minutes
**Rare (1%)** : mutation légendaire → crée une créature impossible (dragon, télépathe, etc.)

### `!predator` 💠
**Effet** : pousse une espèce vers le sommet de la chaîne alimentaire. Accélère l'apparition d'un apex predator.
**Cooldown** : 10 minutes

### `!prey` 💠
**Effet** : inverse : favorise les espèces proies (populations massives, défenses).
**Cooldown** : 10 minutes

### `!plant [type]` 💠
**Effet** : introduit une nouvelle plante.
- `tree`, `flower`, `vine`, `grass`, `carnivorous`
**Cooldown** : 5 minutes

### `!forest` 💎
**Effet** : fait croître une forêt massive à un endroit. Crée un biome stable et abrite des espèces.
**Cooldown** : 15 minutes

### `!migrate [espèce]` 💠
**Effet** : force une migration d'une espèce vers un nouveau continent.
**Cooldown** : 10 minutes

### `!climate [type]` 💎
**Effet** : modifie le climat global.
- `warming` : réchauffement (favorise reptiles)
- `cooling` : refroidissement (favorise mammifères)
- `wet` : humidité (favorise amphibiens)
- `dry` : sécheresse (favorise insectes/reptiles)
**Cooldown** : 20 minutes

### `!meteor` 👑
**Effet** : fait tomber un gros météore. Peut provoquer une **extinction de masse** partielle.
**Cooldown** : 30 minutes
**Effet** : reset partiel du bestiaire, fait place à de nouvelles espèces dominantes

### `!volcano_mass` 👑
**Effet** : volcanisme massif (trapps). Extinction lente mais massive sur plusieurs ticks.
**Cooldown** : 30 minutes

### `!flight` 💎
**Effet** : pousse une espèce à développer le vol. Accélère l'apparition d'espèces aériennes.
**Cooldown** : 20 minutes

### `!giant` 💎
**Effet** : favorise le gigantisme chez une espèce. Crée des créatures monstrueuses (mais vulnérables aux extinctions).
**Cooldown** : 20 minutes

### `!intelligence` 👑
**Effet** : pousse une espèce vers l'intelligence. Condition principale pour passer à l'Âge V.
**Cooldown** : 30 minutes
**Réussite** : faible (~10%), mais s'accumule avec les tentatives de plusieurs viewers

### `!symbiosis [esp1] [esp2]` 💎
**Effet** : crée une relation symbiotique entre deux espèces. Les rend dépendantes mais renforcées.
**Cooldown** : 15 minutes

### `!extinct_species [nom]` 🌟
**Effet** : tente de rayer une espèce. Coûteux.
**Cooldown** : 1 fois par cycle

---

## Commandes — Âge V (Étincelles)

*Premières tribus, feu, outils, langage, religion.*

### `!tribe [nom]` 💠
**Effet** : fonde une tribu portant le pseudo du viewer.
**Cooldown** : 15 minutes
**Titre possible** : *Le Patriarche* (ou Matriarche) si la tribu devient dominante

### `!fire` 💎
**Effet** : donne le feu à une tribu. Énorme avancée culturelle.
**Cooldown** : 20 minutes
**Titre** : *Le Porteur de Flamme* pour le premier viewer à le donner dans le cycle

### `!tool [type]` 💠
**Effet** : fait découvrir un type d'outil à une tribu.
- `stone` : outils en pierre (basique)
- `wood` : outils en bois
- `bone` : outils en os
- `bow` : arc
- `spear` : lance
**Cooldown** : 10 minutes

### `!language` 💎
**Effet** : développe la langue d'une tribu. Permet la transmission du savoir et des mythes.
**Cooldown** : 20 minutes

### `!art` 💠
**Effet** : pousse une tribu à créer de l'art (peintures rupestres, sculptures).
**Cooldown** : 15 minutes
**Effet** : les œuvres persistent dans tous les cycles suivants sous forme de ruines

### `!ritual` 💠
**Effet** : une tribu développe un rituel spirituel. Précurseur de la religion.
**Cooldown** : 15 minutes

### `!bury` 💠
**Effet** : la tribu commence à enterrer ses morts. Étape cruciale vers la spiritualité.
**Cooldown** : 15 minutes

### `!migrate_tribe [tribu] [destination]` 💠
**Effet** : force une tribu à migrer. Évite les catastrophes locales ou explore.
**Cooldown** : 15 minutes

### `!meet [tribu1] [tribu2]` 💎
**Effet** : organise une rencontre entre deux tribus. Issue aléatoire :
- 40% : échange pacifique (partage de connaissances)
- 30% : alliance
- 20% : conflit mineur
- 10% : guerre tribale
**Cooldown** : 20 minutes

### `!farm` 💎
**Effet** : la tribu développe l'agriculture. Étape vers la sédentarisation et l'Âge VI.
**Cooldown** : 25 minutes

### `!domesticate [espèce]` 💎
**Effet** : tentative de domestication d'une espèce animale. Favorise l'élevage.
**Cooldown** : 20 minutes

### `!metallurgy` 👑
**Effet** : découverte du travail du métal. Accélère le passage à l'Âge VI.
**Cooldown** : 30 minutes

### `!plague` 💎
**Effet** : déclenche une maladie dans une tribu. Peut l'éliminer ou la renforcer génétiquement.
**Cooldown** : 20 minutes

### `!hero [nom]` 👑
**Effet** : désigne un viewer comme **héros mythique** dans une tribu. Son nom passera dans les légendes à travers les cycles.
**Cooldown** : 1 fois par cycle
**Limite** : le héros doit avoir interagi au moins 20 fois dans le cycle
**Titre** : *Le Légendaire*

---

## Commandes — Âge VI (Cités)

*Civilisations complètes. Plus de commandes disponibles car c'est la phase la plus longue.*

### Commandes de fondation

### `!city [nom]` 💎
**Effet** : fonde une cité. Si nom non fourni, prend le pseudo du viewer.
**Cooldown** : 20 minutes
**Conditions** : nécessite qu'une tribu soit devenue agricole

### `!capital [cité]` 👑
**Effet** : élève une cité au rang de capitale d'un empire naissant.
**Cooldown** : 1 fois par cycle
**Conditions** : la cité doit avoir >1000 habitants simulés

### `!religion [nom]` 👑
**Effet** : fonde une religion. Peut s'inspirer des forces primordiales (SOL, NOX, KHRON, VOX).
**Cooldown** : 1 fois par cycle par viewer
**Titre** : *Le Prophète*

### `!dynasty [nom]` 👑
**Effet** : fonde une dynastie royale dans une cité. Succession héréditaire sur plusieurs générations simulées.
**Cooldown** : 1 fois par cycle

### Commandes militaires

### `!war [cité1] [cité2]` 💎
**Effet** : déclenche un conflit entre deux cités. Issue dépend des forces respectives.
**Cooldown** : 15 minutes

### `!peace [cité1] [cité2]` 💠
**Effet** : tente de mettre fin à une guerre. Réussite variable selon le contexte.
**Cooldown** : 10 minutes

### `!conquer [attaquant] [cible]` 👑
**Effet** : pousse une cité à en conquérir une autre. Nécessite une armée supérieure.
**Cooldown** : 30 minutes

### `!rebel [cité]` 💎
**Effet** : déclenche une rébellion dans une cité. Peut renverser le pouvoir ou créer une guerre civile.
**Cooldown** : 20 minutes

### `!assassinate [cible]` 🌟
**Effet** : tente d'assassiner un dirigeant. Réussite : 30%. Conséquences dramatiques si réussi.
**Cooldown** : 1 fois par cycle
**Titre possible** : *Le Traître* si le viewer assassine sa propre création

### Commandes économiques

### `!trade [cité1] [cité2]` 💠
**Effet** : établit une route commerciale. Enrichit les deux cités, diffuse les cultures.
**Cooldown** : 15 minutes

### `!coin` 💎
**Effet** : introduit la monnaie dans une civilisation. Accélère le développement économique.
**Cooldown** : 20 minutes
**Limite** : 1 seule civilisation peut le découvrir en premier

### `!tax [cité]` 💠
**Effet** : augmente les taxes. Enrichit la cité mais diminue le bonheur.
**Cooldown** : 10 minutes

### `!famine [cité]` 💎
**Effet** : déclenche une famine. Ralentit la croissance.
**Cooldown** : 20 minutes

### Commandes technologiques

### `!tech [type]` 💎
**Effet** : débloque une avancée technologique pour une civilisation. Chaque `!tech` avance d'un niveau.
- `bronze` → `iron` → `steel` → `gunpowder` → `steam` → `electric` → `nuclear` → `digital` → `quantum`
**Cooldown** : 15 minutes
**Limite** : chaque niveau nécessite le précédent

### `!writing` 💎
**Effet** : développe l'écriture dans une civilisation. Permet la transmission du savoir et du lore.
**Cooldown** : 20 minutes

### `!wheel` 💠
**Effet** : découverte de la roue. Améliore transports et agriculture.
**Cooldown** : 15 minutes

### `!medicine` 💎
**Effet** : développe la médecine. Augmente l'espérance de vie, protège contre les pestes.
**Cooldown** : 20 minutes

### `!print` 💎
**Effet** : invente l'imprimerie. Diffusion rapide des idées. Nécessaire pour les révolutions culturelles.
**Cooldown** : 20 minutes

### `!industrial` 👑
**Effet** : déclenche la révolution industrielle. Ouvre les sous-âges modernes.
**Cooldown** : 1 fois par cycle par civilisation
**Titre** : *L'Ingénieur-Roi*

### `!electric` 👑
**Effet** : découverte de l'électricité.
**Cooldown** : 1 fois par cycle par civilisation

### Commandes culturelles

### `!art [type]` 💠
**Effet** : crée un mouvement artistique.
- `sculpture`, `painting`, `music`, `literature`, `architecture`
**Cooldown** : 10 minutes

### `!festival [cité]` 💠
**Effet** : organise un festival. Augmente temporairement le bonheur et la culture.
**Cooldown** : 10 minutes

### `!university [cité]` 💎
**Effet** : fonde une université. Booste la recherche technologique.
**Cooldown** : 20 minutes

### `!library [cité]` 💎
**Effet** : fonde une grande bibliothèque. Protège le savoir contre les catastrophes.
**Cooldown** : 20 minutes

### `!philosophy [nom]` 💎
**Effet** : crée un courant philosophique. Influence les décisions politiques.
**Cooldown** : 20 minutes

### `!schism [religion]` 👑
**Effet** : provoque un schisme religieux. Divise les fidèles, potentiellement en guerre.
**Cooldown** : 1 fois par cycle
**Titre** : *L'Hérésiarque*

### Commandes catastrophes

### `!plague_city [cité]` 💎
**Effet** : déclenche une épidémie dans une cité. Peut s'étendre aux voisines.
**Cooldown** : 20 minutes
**Titre possible** : *Le Porteur de Peste*

### `!flood [région]` 💎
**Effet** : inondation régionale. Détruit fermes, tue bétail, déplace populations.
**Cooldown** : 15 minutes

### `!fire_city [cité]` 💎
**Effet** : grand incendie urbain. Détruit partiellement la cité.
**Cooldown** : 15 minutes

### `!earthquake [région]` 💎
**Effet** : séisme régional. Détruit bâtiments, peut ouvrir des failles.
**Cooldown** : 20 minutes

### Commandes exploratoires

### `!explore [direction]` 💠
**Effet** : envoie une expédition. Peut découvrir un nouveau continent, des ruines, des ressources.
**Cooldown** : 15 minutes

### `!sail` 💎
**Effet** : développe la navigation océanique. Permet les découvertes intercontinentales.
**Cooldown** : 20 minutes

### `!discover_ruins` 💎
**Effet** : tente de trouver des ruines d'un cycle précédent. Rien si c'est le cycle 1.
**Cooldown** : 20 minutes

### `!colony [cité] [région]` 👑
**Effet** : fonde une colonie. Étend l'influence d'une cité-mère.
**Cooldown** : 1 fois par cycle par viewer

### Commandes spéciales

### `!revolution [cité]` 👑
**Effet** : révolution politique. Change le régime (monarchie → république, par exemple).
**Cooldown** : 1 fois par cycle

### `!genocide [peuple]` 🌟
**Effet** : extermination d'un peuple. Terrible mais possible. Traces permanentes.
**Cooldown** : 1 fois par cycle
**Titre** : *Le Destructeur*
**Restriction** : peut être désactivée selon la politique du stream

### `!unify [cités]` 👑
**Effet** : tente d'unifier plusieurs cités en un seul empire. Rare mais possible.
**Cooldown** : 1 fois par cycle
**Titre** : *L'Empereur*

---

## Commandes — Âge VII (Vide)

*Civilisation spatiale. La plus courte phase, souvent fatale.*

### `!launch` 💎
**Effet** : lance une sonde spatiale. Premier pas hors du monde.
**Cooldown** : 20 minutes
**Titre** : *L'Astronaute* pour le premier

### `!satellite` 💎
**Effet** : place un satellite en orbite. Améliore communications et prévisions.
**Cooldown** : 15 minutes

### `!station` 👑
**Effet** : construit une station spatiale. Permet la présence humaine continue en orbite.
**Cooldown** : 1 fois par cycle par viewer

### `!moon_colony` 👑
**Effet** : colonise la Lune Jumelle. Peut survivre à une apocalypse planétaire (rare).
**Cooldown** : 1 fois par cycle

### `!ai` 🌟
**Effet** : crée une IA avancée. **Risque majeur** : peut déclencher l'apocalypse « Singularité ». Si la civilisation survit, sa trajectoire devient imprévisible (fusion homme-machine, éveil de l'IA, ou contrôle total).
**Cooldown** : 1 fois par cycle
**Titre** : *L'Ingénieur-Roi* (si réussite)

### `!contact` 🌟
**Effet** : tente un contact avec le Vide Noir. **Très dangereux**. Peut déclencher une apocalypse type "Le Contact".
**Cooldown** : 1 fois par cycle

### `!terraform [région]` 👑
**Effet** : tente de terraformer une zone dégradée. Seul moyen de ralentir certaines apocalypses.
**Cooldown** : 30 minutes

### `!nuke [cible]` 🌟
**Effet** : déclenche une frappe nucléaire. Énormes dégâts locaux. Risque d'escalade et d'apocalypse "Hiver des Cendres".
**Cooldown** : 1 fois par cycle
**Titre** : *Le Destructeur* (cumulable)

### `!ascension` 🌟
**Effet** : tentative d'Ascension — faire quitter la planète à une partie de la civilisation avant l'apocalypse.
**Cooldown** : 1 fois par cycle
**Réussite** : <5%
**Titre** : *L'Ascendant*

### `!signal` 🔥
**Effet** : reçoit un message du Vide Noir. Événement scripté, apparition du Signal mystérieux.
**Cooldown** : 1 fois par cycle (global, déclenché par superchat uniquement)

### `!warp` 🌟
**Effet** : rare — tentative de voyage plus rapide que la lumière. Issue imprévisible.
**Cooldown** : 1 fois par cycle

---

## Commandes passives (likes & subs)

*Actions déclenchées automatiquement sans commande tapée.*

### Like sur la vidéo 🆓
**Effet par like** :
- Âge I : +1 unité de chaleur (mineur)
- Âge II : +1 goutte de pluie
- Âge III : +1 nutriment dans les océans
- Âge IV : +1 point de biomasse
- Âge V : +1 unité de bonheur tribal
- Âge VI : +1 unité de culture
- Âge VII : +1 unité d'énergie

**Cumul** : 100 likes → événement mineur automatique

### Nouvel abonnement ⚡
**Effet** : déclenche un événement moyen selon l'âge :
- Âge I : météorite moyenne garantie
- Âge II : tempête garantie
- Âge III : nouvelle souche injectée
- Âge IV : nouvelle espèce ajoutée
- Âge V : nouvelle tribu fondée
- Âge VI : nouvelle cité fondée (prend le pseudo du sub)
- Âge VII : nouvelle station / technologie

### Super-sub / niveau supérieur ⚡
**Effet** : évènement majeur garanti, et le viewer gagne un titre spécial **"Le Mécène"**.

### Superchat / don 🔥
**Effet variable selon le montant** :
- Petit don : commande majeure gratuite
- Don moyen : événement cinématique
- Gros don : débloque un événement unique (Signal, apparition rarissime, etc.)

---

## Commandes cachées / secrètes

*Non documentées officiellement, à découvrir par les viewers.*

### `!42` 🆓
**Effet** : affiche un message cryptique. Clin d'œil.

### `!konami` 💠
**Effet** : si 10 viewers tapent la séquence konami dans les bonnes commandes, événement secret.

### `!pray_to_vox` 💎
**Effet** : "parle à VOX". Parfois, VOX répond sur le stream (message narratif spécial).
**Cooldown** : très long

### `!break_fourth_wall` 🌟
**Effet** : fait apparaître brièvement une main géante qui pointe la planète (référence au streamer). Événement esthétique rare.
**Cooldown** : 1 fois par cycle

### `!remember [cycle_précédent]` 💎
**Effet** : demande au moteur de rappeler un événement d'un cycle précédent sur le stream.
**Cooldown** : 30 minutes

### `!oracle` 🌟
**Effet** : appelle l'Oracle — affiche une vraie prédiction (déterministe selon l'état du monde) sur les 1000 prochains ticks.
**Cooldown** : 1 fois par cycle

### `!whisper [pseudo]` 💎
**Effet** : envoie un "murmure" mystique à un autre viewer (message privé stylisé).
**Cooldown** : 5 minutes

### Commandes à déclenchement contextuel (pas tapées)

- **Commande secrète de l'astéroïde** : si 10 viewers tapent "astéroïde" dans le chat en 10 secondes → impact automatique
- **Commande secrète de la pluie** : si 20 viewers disent "il pleut" → déclenche une pluie
- **Appel des anciens** : si un viewer tape le nom d'une civilisation morte depuis 3+ cycles → chance d'événement spécial

---

## Commandes de modération

*Réservées au streamer ou aux modérateurs.*

### `!force [commande]` 🔒
**Effet** : force l'exécution d'une commande sans cooldown ni coût. Utilisable par le streamer uniquement.

### `!skip_age` 🔒
**Effet** : passe directement à l'âge suivant. À utiliser en cas de blocage.

### `!pause` 🔒
**Effet** : met la simulation en pause (pour les moments de discussion, intervention).

### `!resume` 🔒
**Effet** : reprend la simulation.

### `!speed [multiplicateur]` 🔒
**Effet** : accélère ou ralentit la simulation. `!speed 2` = 2x plus rapide.

### `!ban_viewer [pseudo]` 🔒
**Effet** : interdit à un viewer d'utiliser des commandes. N'affecte pas sa présence dans le chat.

### `!reset_cycle` 🔒
**Effet** : force une apocalypse et redémarre un nouveau cycle. À utiliser avec parcimonie.

### `!gift_pi [pseudo] [montant]` 🔒
**Effet** : donne des PI à un viewer.

### `!spotlight [pseudo]` 🔒
**Effet** : met en lumière un viewer particulier (cadre spécial, mention sur le stream).

### `!save` 🔒
**Effet** : force une sauvegarde manuelle de l'état du monde.

### `!backup_load [snapshot]` 🔒
**Effet** : charge un snapshot antérieur (en cas de bug ou d'état problématique).

---

## Tableau récapitulatif

### Par fréquence d'usage attendu

**🔥 Commandes ultra-fréquentes** (attendre que tous les viewers les utilisent) :
- `!rain`, `!impact`, `!seed`, `!evolve`, `!tribe`, `!city`, `!war`, `!tech`

**💧 Commandes régulières** :
- `!volcano`, `!mutate`, `!fire`, `!trade`, `!explore`, `!art`, `!plague`

**⚡ Commandes rares** :
- `!comet`, `!religion`, `!dynasty`, `!industrial`, `!launch`, `!ai`

**✨ Commandes légendaires** :
- `!ring`, `!merge`, `!hero`, `!ascension`, `!contact`, `!nuke`

### Par âge (nombre de commandes disponibles)

| Âge | Commandes actives | + universelles |
|-----|-------------------|----------------|
| I — Feu | 7 | +8 universelles = **15** |
| II — Eaux | 9 | +8 = **17** |
| III — Germes | 10 | +8 = **18** |
| IV — Grouillement | 16 | +8 = **24** |
| V — Étincelles | 14 | +8 = **22** |
| VI — Cités | 35 | +8 = **43** |
| VII — Vide | 11 | +8 = **19** |
| **Total unique** | **102** | **+8** |

**+ commandes secrètes** : ~10
**+ commandes modération** : 10
**= ~130 commandes au total**

### Priorité d'implémentation

**MVP (Phase 1)** — 20 commandes essentielles :
```
!help, !status, !me, !rain, !impact, !volcano, !cool, !seed,
!mutate, !evolve, !spawn, !tribe, !fire, !city, !war, !tech,
!trade, !plague_city, !launch, !ai
```

**Phase 2** — + 40 commandes pour la richesse :
Toutes les commandes standards restantes de chaque âge.

**Phase 3** — + 30 commandes pour la profondeur :
Commandes majeures/légendaires (👑🌟), titres, cinématiques associées.

**Phase 4** — + commandes secrètes et contextuelles :
Easter eggs, combos, commandes déclenchées par mots-clés du chat.

---

## ✨ Notes finales

### Équilibrage

Les coûts et cooldowns sont **indicatifs**. À ajuster après observation :
- Si tout le monde reste Âge I pendant 3 jours → réduire les coûts de `!comet`
- Si les apocalypses arrivent trop vite → augmenter les cooldowns des commandes destructrices
- Si un âge est skippé trop vite → augmenter les conditions de passage

### Accessibilité

- **Alias en français** : pour chaque commande, créer un alias FR (`!pluie` = `!rain`, `!guerre` = `!war`...)
- **Auto-complete** : proposer les commandes dans le chat quand un `!` est tapé (si plateforme permet)
- **Tutoriel in-game** : les premières commandes du stream doivent pouvoir se lire facilement

### Évolution

Cette liste est **vivante**. Chaque nouveau cycle peut introduire des commandes découvertes par les viewers :
- Commandes débloquées après certains succès (titres rares)
- Commandes "héritées" : si tu as fondé X civilisations, tu débloques `!emperor`
- Commandes saisonnières : Halloween, Noël, etc.

---

*Document de référence — v1.0*
*À mettre à jour à chaque ajout/retrait de commande et après chaque cycle pour équilibrage.*
