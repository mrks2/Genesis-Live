# 💻 Bonnes pratiques de codage

*Guide pratique pour écrire du code propre, maintenable et évolutif — particulièrement pour des projets complexes et long-terme.*

---

## 📖 Table des matières

1. [Philosophie générale](#philosophie-générale)
2. [Nommage](#nommage)
3. [Structure et organisation](#structure-et-organisation)
4. [Fonctions et méthodes](#fonctions-et-méthodes)
5. [Commentaires et documentation](#commentaires-et-documentation)
6. [Gestion des erreurs](#gestion-des-erreurs)
7. [État et données](#état-et-données)
8. [Performance](#performance)
9. [Tests](#tests)
10. [Git et versioning](#git-et-versioning)
11. [Sécurité](#sécurité)
12. [Code review](#code-review)
13. [Dette technique](#dette-technique)
14. [Spécifique aux projets temps-réel / simulation](#spécifique-aux-projets-temps-réel--simulation)

---

## Philosophie générale

### Les 5 principes qui comptent vraiment

**1. Le code est lu 10x plus qu'il n'est écrit.**
Optimise pour la lisibilité, pas pour l'écriture rapide. Ton toi-du-futur te remerciera.

**2. Fais marcher, puis fais bien, puis fais vite.**
Dans cet ordre. Optimiser du code qui ne marche pas est une perte de temps.

**3. Un code simple bat un code intelligent.**
Si tu es fier de la complexité de ton code, c'est probablement mauvais signe. La vraie intelligence, c'est la simplicité.

**4. La cohérence vaut mieux que la perfection.**
Un projet avec des conventions moyennes mais respectées partout est plus maintenable qu'un projet où chaque fichier suit des règles différentes.

**5. Tout code est un passif.**
Chaque ligne est une ligne à maintenir. Écris le moins de code possible pour résoudre le problème.

### Les principes SOLID (adaptés, sans dogme)

- **S**ingle Responsibility : une fonction/classe fait UNE chose bien
- **O**pen/Closed : ouvert à l'extension, fermé à la modification
- **L**iskov Substitution : les sous-types doivent être substituables à leur type parent
- **I**nterface Segregation : plusieurs interfaces spécifiques > une interface générale
- **D**ependency Inversion : dépends des abstractions, pas des implémentations

En pratique, retiens surtout **S** (single responsibility) — c'est 80% de la valeur.

### DRY, KISS, YAGNI

- **DRY** (Don't Repeat Yourself) : si tu écris la même logique trois fois, extrais-la.
- **KISS** (Keep It Simple, Stupid) : la solution la plus simple qui marche est souvent la bonne.
- **YAGNI** (You Aren't Gonna Need It) : ne code pas pour des besoins hypothétiques futurs.

**Attention au DRY excessif** : deux bouts de code qui se ressemblent aujourd'hui mais évolueront différemment ne doivent **pas** être fusionnés. La duplication est préférable à une mauvaise abstraction.

---

## Nommage

Le nommage est **la chose la plus importante** en programmation, après la correction du code.

### Règles universelles

**1. Les noms doivent révéler l'intention**
```js
// ❌ Mauvais
const d = 30; // délai en jours
const list1 = users.filter(u => u.a);

// ✅ Bon
const DELAY_IN_DAYS = 30;
const activeUsers = users.filter(user => user.isActive);
```

**2. Évite les abréviations cryptiques**
```js
// ❌ Mauvais
function calcTmpAvg(usrLst) { ... }

// ✅ Bon
function calculateTemperatureAverage(userList) { ... }
```

Exception : les abréviations universellement comprises (`id`, `url`, `http`, `db`) sont OK.

**3. Utilise des noms prononçables**
Si tu ne peux pas prononcer un nom de variable à voix haute dans une réunion, change-le.

**4. Les noms doivent être "cherchables"**
```js
// ❌ Mauvais — impossible à chercher dans le codebase
const t = 7;

// ✅ Bon — facile à trouver et comprendre
const DAYS_PER_WEEK = 7;
```

### Conventions par type

**Variables & fonctions** : `camelCase`
```js
let userName = "Alice";
function getUserById(id) { ... }
```

**Classes & types** : `PascalCase`
```js
class GameEngine { ... }
interface UserProfile { ... }
```

**Constantes** : `SCREAMING_SNAKE_CASE`
```js
const MAX_PLAYERS = 100;
const API_BASE_URL = "https://...";
```

**Fichiers** : convention cohérente dans le projet
- `kebab-case.js` (le plus courant en JS)
- `snake_case.py` (Python)
- `PascalCase.tsx` (composants React)

**Booléens** : toujours une question qui se répond par oui/non
```js
// ✅ Bon
const isReady = true;
const hasPermission = false;
const canEdit = user.role === "admin";
const shouldRetry = attempts < 3;
```

**Fonctions** : commencer par un verbe
```js
getUserById()        // récupère
calculateTotal()     // calcule
isValidEmail()       // vérifie (booléen)
convertToJSON()      // transforme
handleClick()        // gère un événement
```

### Les noms à bannir

```
data, info, object, thing, stuff, tmp, temp, foo, bar, test, myVar
```

Ces noms ne portent **aucune information**. Si tu as vraiment besoin de nommer quelque chose comme ça, c'est que tu n'as pas réfléchi assez longtemps.

---

## Structure et organisation

### Architecture en couches

Sépare clairement les responsabilités :

```
┌─────────────────────────────────┐
│  Présentation (UI, routes, API) │
├─────────────────────────────────┤
│  Logique métier (services)      │
├─────────────────────────────────┤
│  Accès aux données (repos, ORM) │
├─────────────────────────────────┤
│  Infrastructure (DB, API ext.)  │
└─────────────────────────────────┘
```

Une couche ne dépend que des couches **en dessous** d'elle, jamais au-dessus.

### Organisation des fichiers

**Deux approches valides** :

**1. Par type (pour petits projets)**
```
src/
  components/
  services/
  utils/
  types/
```

**2. Par feature (pour projets moyens/gros) — RECOMMANDÉ**
```
src/
  user/
    user.service.js
    user.controller.js
    user.types.js
    user.test.js
  payment/
    payment.service.js
    ...
  shared/
    utils/
    types/
```

L'organisation par feature scale **beaucoup mieux** : tout ce qui concerne une fonctionnalité est au même endroit.

### Règle des 3 niveaux de profondeur

Si tu imbriques plus de 3 niveaux de dossiers, tu te compliques la vie. Reste plat autant que possible.

### Taille des fichiers

**Règles indicatives** :
- Fichier > 300 lignes → questionne-toi
- Fichier > 500 lignes → refactor probable
- Fichier > 1000 lignes → refactor obligatoire

Un gros fichier n'est **jamais** justifié. C'est toujours un manque de découpage.

---

## Fonctions et méthodes

### La règle d'or : petites et focalisées

**Taille indicative** : une fonction devrait tenir sur un écran sans scroll (20-30 lignes max).

Une fonction qui fait plusieurs choses = plusieurs fonctions qui en font une seule.

### Les 4 lois des bonnes fonctions

**1. Elle fait UNE chose**
```js
// ❌ Mauvais — fait 3 choses
function processUser(user) {
  validateEmail(user.email);
  saveToDatabase(user);
  sendWelcomeEmail(user.email);
}

// ✅ Bon — le caller orchestre, chaque fonction fait son travail
function validateUser(user) { ... }
function saveUser(user) { ... }
function sendWelcomeEmail(email) { ... }

// Puis dans le code appelant :
validateUser(user);
saveUser(user);
sendWelcomeEmail(user.email);
```

**2. Elle est au bon niveau d'abstraction**
Ne mélange pas du haut niveau (logique métier) et du bas niveau (manipulation de string) dans la même fonction.

**3. Elle a peu de paramètres**
- 0-2 paramètres : idéal
- 3 paramètres : tolérable
- 4+ paramètres : utilise un objet

```js
// ❌ Mauvais
function createUser(name, email, age, country, role, isActive) { ... }

// ✅ Bon
function createUser({ name, email, age, country, role, isActive }) { ... }
```

**4. Elle n'a pas d'effets de bord cachés**
Si une fonction modifie quelque chose en dehors de son scope, son nom doit le refléter.

```js
// ❌ Piège — l'utilisateur ne s'attend pas à ce que sa variable soit modifiée
function calculateTotal(cart) {
  cart.totalCalculated = true; // effet de bord caché
  return cart.items.reduce(...);
}

// ✅ Clair
function calculateTotal(cart) {
  return cart.items.reduce(...);
}
```

### Pure functions > impure functions

Une **pure function** :
- Donne toujours le même résultat pour les mêmes entrées
- Ne modifie rien en dehors de son scope

Les pures sont plus faciles à tester, déboguer, et paralléliser. Maximise-les.

### Early return

Évite les pyramides d'indentation :

```js
// ❌ Mauvais
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.user.isVerified) {
        // vraie logique ici, à 4 niveaux d'indentation
      }
    }
  }
}

// ✅ Bon
function processOrder(order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (!order.user.isVerified) return;
  
  // vraie logique ici, à plat
}
```

---

## Commentaires et documentation

### Le principe fondamental

**Le meilleur commentaire est celui qu'on n'a pas besoin d'écrire.**

Un code lisible se passe de commentaires. Si tu ressens le besoin d'expliquer *ce que* fait ton code, renomme tes variables et découpe tes fonctions.

### Quand commenter

**✅ Commente le POURQUOI, pas le QUOI**
```js
// ❌ Inutile
// Incrémente i
i++;

// ✅ Utile
// Retry une fois car l'API tiers a un bug intermittent connu
await retryRequest(url, { attempts: 2 });
```

**✅ Commente les décisions non-évidentes**
```js
// On utilise un Set ici car on aura besoin de chercher par valeur
// dans une boucle critique. La liste aurait été O(n²).
const userIds = new Set(users.map(u => u.id));
```

**✅ Commente les hacks temporaires**
```js
// TODO: retirer quand l'API v2 sera disponible (prévu Q3 2026)
// HACK: workaround pour le bug #1234 côté librairie X
// FIXME: cette regex casse avec les emails Unicode
```

**✅ Commente les formules complexes / non-intuitives**
```js
// Formule de Haversine pour calculer la distance entre deux
// coordonnées GPS en tenant compte de la courbure terrestre
function getDistance(lat1, lon1, lat2, lon2) { ... }
```

### Documentation de code

**Pour les fonctions publiques / API** : utilise JSDoc, docstrings, ou équivalent.

```js
/**
 * Calcule le score ELO mis à jour après un match.
 * 
 * @param {number} currentRating - Rating ELO actuel du joueur
 * @param {number} opponentRating - Rating ELO de l'adversaire
 * @param {number} score - Résultat du match : 1 (victoire), 0.5 (nul), 0 (défaite)
 * @param {number} [kFactor=32] - Facteur K (volatilité du rating)
 * @returns {number} Le nouveau rating ELO
 */
function updateEloRating(currentRating, opponentRating, score, kFactor = 32) {
  ...
}
```

### README : la porte d'entrée

Tout projet doit avoir un README avec **au minimum** :

```markdown
# Nom du projet

## Description
Une phrase qui explique le projet.

## Installation
Commandes exactes pour setup

## Usage
Exemple minimal pour lancer/utiliser

## Architecture (optionnel)
Schéma ou explication rapide

## Contribution
Comment contribuer

## License
```

---

## Gestion des erreurs

### Ne jamais ignorer silencieusement

```js
// ❌ TERRIBLE — l'erreur disparaît dans le néant
try {
  doSomething();
} catch (e) {}

// ❌ Mauvais — log sans action
try {
  doSomething();
} catch (e) {
  console.log(e);
}

// ✅ Bon — log structuré + action claire
try {
  doSomething();
} catch (error) {
  logger.error("Failed to do something", { error, context: {...} });
  throw new DomainError("User-friendly message", { cause: error });
}
```

### Types d'erreurs

Différencie :
- **Erreurs attendues** (validation, input utilisateur invalide) → traitement normal
- **Erreurs système** (DB down, API externe HS) → retry, fallback, ou alerte
- **Erreurs de programmation** (bug) → crash rapide avec log détaillé

### Fail fast, fail loud

En développement, **crash dès qu'une invariance est violée**. Un bug visible tôt coûte 100x moins cher qu'un bug découvert en production.

```js
function calculateDiscount(price, discountPercent) {
  if (price < 0) throw new Error(`Invalid price: ${price}`);
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error(`Invalid discount: ${discountPercent}`);
  }
  return price * (1 - discountPercent / 100);
}
```

### Validation aux frontières

**Règle** : valide les données à l'entrée de ton système (API, formulaires, lecture fichier), pas partout ensuite.

Une fois qu'une donnée a passé la validation, tu peux lui faire confiance dans tout ton code interne.

### Erreurs custom

Crée des types d'erreurs spécifiques pour ton domaine :

```js
class ValidationError extends Error { ... }
class NotFoundError extends Error { ... }
class AuthError extends Error { ... }
```

Ça permet des `catch` ciblés et du logging différencié.

---

## État et données

### Immutabilité par défaut

**Règle** : traite tes données comme immutables sauf exception justifiée.

```js
// ❌ Mutation
function addItem(cart, item) {
  cart.items.push(item);
  return cart;
}

// ✅ Immutable
function addItem(cart, item) {
  return {
    ...cart,
    items: [...cart.items, item]
  };
}
```

Pourquoi ? L'immutabilité élimine des **classes entières de bugs** : les effets de bord inattendus, les race conditions, les états incohérents.

### Single Source of Truth

Chaque donnée doit avoir **une seule source de vérité**. Dupliquer l'état = bugs garantis à terme.

```js
// ❌ Mauvais — userName et userNameUpper vont désynchroniser
state = {
  userName: "alice",
  userNameUpper: "ALICE",
  userInitial: "A"
};

// ✅ Bon — dériver à la volée
state = { userName: "alice" };
const userNameUpper = state.userName.toUpperCase();
const userInitial = state.userName[0].toUpperCase();
```

### Séparer état et dérivé

- **État** : la donnée brute, stockée, modifiée
- **Dérivé** : calculé à partir de l'état

Ne stocke jamais ce qui peut être calculé (sauf pour des raisons de perf avec memoization).

### Normalisation des données

Pour des structures complexes, normalise (comme une base de données) :

```js
// ❌ Difficile à maintenir
const state = {
  posts: [
    { id: 1, title: "...", author: { id: 5, name: "Alice" } },
    { id: 2, title: "...", author: { id: 5, name: "Alice" } }, // dupliqué !
  ]
};

// ✅ Normalisé
const state = {
  posts: { 1: { id: 1, title: "...", authorId: 5 }, 2: { ... } },
  authors: { 5: { id: 5, name: "Alice" } }
};
```

---

## Performance

### Les 3 règles d'or

**1. Mesure avant d'optimiser**
"Premature optimization is the root of all evil" — Knuth.
Profile ton code. L'intuition sur les bottlenecks est fausse 80% du temps.

**2. Optimise le bon endroit**
Loi de Pareto : 80% du temps d'exécution est passé dans 20% du code. Concentre-toi là.

**3. La complexité algorithmique compte plus que les micro-optimisations**
Passer d'O(n²) à O(n log n) bat toutes les astuces de syntaxe.

### Complexité : les bases

Apprends à estimer la complexité de tes algos :

| Notation | Nom | Exemple |
|----------|-----|---------|
| O(1) | Constant | Accès à un tableau par index |
| O(log n) | Logarithmique | Recherche binaire |
| O(n) | Linéaire | Parcours d'un tableau |
| O(n log n) | Log-linéaire | Tri efficace (quicksort, mergesort) |
| O(n²) | Quadratique | Double boucle imbriquée |
| O(2^n) | Exponentielle | Force brute sur sous-ensembles |

**Warning signs** :
- Boucles imbriquées sur de grandes collections
- Recherches répétées dans des tableaux (utilise Set/Map)
- Allocations en boucle (crée une fois, réutilise)

### Optimisations courantes

**Memoization** (cache de résultats)
```js
const cache = new Map();
function expensive(input) {
  if (cache.has(input)) return cache.get(input);
  const result = /* calcul coûteux */;
  cache.set(input, result);
  return result;
}
```

**Lazy evaluation** (calculer seulement quand nécessaire)

**Batch processing** (grouper les opérations)
```js
// ❌ Mauvais — 1000 appels réseau
for (const user of users) {
  await api.save(user);
}

// ✅ Bon — 1 appel
await api.saveBatch(users);
```

**Debounce / throttle** (limiter les appels fréquents)

### Attention à la mémoire

Dans les apps long-running (comme des simulations continues) :
- **Fuites de mémoire** : listeners non supprimés, caches qui grossissent à l'infini
- **Garbage collector** : trop d'allocations = pauses GC = freezes
- **Références circulaires** : anciennes sources de fuite en JS (moins vrai aujourd'hui)

---

## Tests

### Pourquoi tester

1. **Confiance** : tu peux refactorer sans crainte
2. **Documentation** : les tests montrent comment utiliser le code
3. **Design** : du code testable est généralement du bon code
4. **Régression** : empêche de recasser ce qui marchait

### La pyramide des tests

```
         /\
        /E2E\        Peu, lents, fragiles
       /------\
      /Intégr.\      Modéré
     /----------\
    /  Unitaires \   Beaucoup, rapides, isolés
   /--------------\
```

- **Tests unitaires** : testent une fonction/classe en isolation. Rapides, nombreux.
- **Tests d'intégration** : testent plusieurs composants ensemble.
- **Tests E2E** : testent le système complet, comme un utilisateur.

### Qu'est-ce qu'un bon test ?

**AAA : Arrange, Act, Assert**
```js
test('calculates total with tax', () => {
  // Arrange
  const cart = { items: [{ price: 100 }], taxRate: 0.2 };
  
  // Act
  const total = calculateTotal(cart);
  
  // Assert
  expect(total).toBe(120);
});
```

**Un test = un comportement**
Ne teste pas 15 choses dans un seul test.

**Les tests doivent être déterministes**
Pas de dépendance à l'heure, au réseau, à l'ordre d'exécution.

**Les tests doivent être lisibles**
Un test mal écrit est pire qu'un test manquant.

### Ce qu'il faut tester

- **Logique métier complexe** : priorité absolue
- **Edge cases** : valeurs limites, null, vides, négatifs
- **Bugs corrigés** : ajoute un test pour éviter la régression
- **API publiques** : le contrat avec l'extérieur

### Ce qu'il ne faut PAS tester

- **Code trivial** : un getter qui retourne un champ
- **Libs tierces** : on fait confiance au framework
- **Détails d'implémentation** : teste le comportement, pas la mécanique

### TDD (optionnel mais puissant)

Test-Driven Development :
1. Écris le test **avant** le code
2. Code le minimum pour le faire passer
3. Refactor

Difficile au début, très efficace une fois maîtrisé.

---

## Git et versioning

### Messages de commit

**Format conventional commits** (recommandé) :
```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

**Types courants** :
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `refactor` : refactoring sans changement de comportement
- `docs` : documentation
- `test` : ajout/modification de tests
- `chore` : tâches de maintenance
- `perf` : amélioration de performance

**Exemples** :
```
feat(auth): add OAuth2 login with Google
fix(api): handle null user in profile endpoint
refactor(db): extract query builder to separate module
docs(readme): add setup instructions for Windows
```

### Règles d'or des commits

**1. Commits atomiques**
Un commit = une idée cohérente. Pas de "WIP" ou "misc changes".

**2. Commits fréquents**
Mieux vaut 10 petits commits qu'1 énorme. Facilite le review et le rollback.

**3. Ne casse jamais la branche principale**
Chaque commit sur main doit compiler et passer les tests.

**4. Écris des messages au présent impératif**
- ✅ "add login feature"
- ❌ "added login feature"
- ❌ "adding login feature"

### Branches

**Modèles courants** :

**Git Flow** (complexe, pour gros projets avec releases)
- `main` : production
- `develop` : intégration
- `feature/*`, `release/*`, `hotfix/*`

**GitHub Flow** (simple, pour web apps en déploiement continu) — RECOMMANDÉ
- `main` : toujours déployable
- `feature/*` : branches courtes, merge rapide

**Trunk-Based Development** (pour équipes matures)
- Tout sur `main`, feature flags pour le WIP

### .gitignore

**Toujours ignorer** :
- Dépendances (`node_modules`, `venv`, etc.)
- Fichiers de build (`dist`, `build`)
- Fichiers d'IDE (`.vscode`, `.idea`)
- Secrets (`.env`, clés privées)
- Fichiers OS (`.DS_Store`, `Thumbs.db`)
- Logs (`*.log`)

### Secrets : JAMAIS dans Git

**RÈGLE ABSOLUE** : aucune clé API, aucun mot de passe, aucun token dans le code versionné.

Utilise des variables d'environnement ou un gestionnaire de secrets. Si tu en committes un par erreur : **change-le immédiatement**, l'historique Git est public.

---

## Sécurité

### Les basiques indispensables

**1. Valide TOUT ce qui vient de l'extérieur**
Input utilisateur, paramètres URL, API externes, fichiers uploadés. Tout.

**2. Utilise des requêtes paramétrées**
```js
// ❌ INJECTION SQL
db.query(`SELECT * FROM users WHERE name = '${userInput}'`);

// ✅ Sûr
db.query('SELECT * FROM users WHERE name = ?', [userInput]);
```

**3. Échappe les sorties**
Tout ce qui est affiché dans le navigateur doit être échappé pour éviter les XSS.

**4. HTTPS partout**
Aucune excuse en 2026.

**5. Authentification solide**
- Ne stocke jamais les mots de passe en clair (bcrypt/argon2)
- Tokens JWT avec expiration courte + refresh tokens
- 2FA pour les comptes sensibles

**6. Principe du moindre privilège**
Donne à chaque composant/utilisateur **le minimum** de permissions nécessaires.

**7. Dépendances à jour**
Utilise `npm audit`, `dependabot`, ou équivalent. Les failles dans les libs tierces sont une source majeure d'attaques.

### OWASP Top 10

Connais au minimum les vulnérabilités courantes :
1. Injection (SQL, NoSQL, commandes)
2. Authentification cassée
3. Exposition de données sensibles
4. XXE (XML External Entities)
5. Contrôle d'accès cassé
6. Mauvaise configuration de sécurité
7. XSS (Cross-Site Scripting)
8. Désérialisation non sécurisée
9. Composants avec failles connues
10. Logging/monitoring insuffisant

---

## Code review

### Pourquoi

- **Qualité** : détection précoce de bugs
- **Partage de connaissance** : tout le monde comprend le code
- **Cohérence** : maintien des standards
- **Mentorat** : apprentissage mutuel

### Bonnes pratiques en tant qu'auteur

- **PR courtes** (< 400 lignes) : plus c'est petit, mieux c'est reviewé
- **Description claire** : explique le pourquoi, pas seulement le quoi
- **Auto-review** : relis ta propre PR avant de la soumettre
- **Réponds aux commentaires** : ne les ignore pas, même pour dire "bonne idée mais hors scope"

### Bonnes pratiques en tant que reviewer

- **Sois gentil** : critique le code, pas la personne
- **Explique** : "ne fais pas ça" ≠ "ne fais pas ça parce que X"
- **Distingue** : "bloquant", "suggestion", "nit" (détail)
- **Complimente** : souligne aussi le bon code
- **Sois rapide** : un review qui traîne bloque toute l'équipe

### Checklist mentale

- [ ] Le code fait ce qu'il prétend faire ?
- [ ] Y a-t-il des edge cases non traités ?
- [ ] Les tests couvrent-ils les cas importants ?
- [ ] Le code est-il lisible ?
- [ ] Y a-t-il des problèmes de performance évidents ?
- [ ] Y a-t-il des problèmes de sécurité ?
- [ ] La documentation est-elle à jour ?

---

## Dette technique

### Accepter qu'elle existe

Toute base de code a de la dette technique. Ce n'est pas un échec, c'est une réalité. Ce qui compte, c'est de la **gérer**.

### Types de dette

**1. Dette intentionnelle**
"On sait que c'est sale, on fait ça vite pour la deadline, on corrigera après."
→ OK si tu documentes et corriges vraiment après.

**2. Dette non intentionnelle**
Code écrit sans connaître mieux. Se découvre plus tard.
→ Normal, fait partie de l'apprentissage.

**3. Dette par obsolescence**
Le monde a changé (nouvelles libs, nouveaux besoins) et ton code est dépassé.
→ Inévitable. Refactor régulier.

### Règle du Boy Scout

*"Laisse toujours le code dans un meilleur état que celui dans lequel tu l'as trouvé."*

Pas besoin de tout refactorer. Juste : quand tu touches un fichier, améliore-le un peu. Un nom, une fonction extraite, un commentaire retiré.

### Quand rembourser

- **En continu** : la règle du Boy Scout
- **Lors des refactors ciblés** : quand la dette bloque une feature
- **Sprints dédiés** : de temps en temps, un sprint 100% dette technique

### Quand ignorer

- **Code qui ne sera jamais modifié** : s'il marche, laisse-le
- **Code qui sera supprimé bientôt** : pas la peine de polir ce qu'on va jeter
- **Coût > bénéfice** : parfois c'est juste pas rentable

---

## Spécifique aux projets temps-réel / simulation

*(Pertinent pour des projets comme Genesis Live, jeux, dashboards live, etc.)*

### Architecture tick-based

Pour une simulation continue, structure autour d'une **boucle de tick** :

```js
const TICK_RATE_MS = 1000;

function tick() {
  const deltaTime = Date.now() - lastTick;
  
  updatePhysics(deltaTime);
  updateEntities(deltaTime);
  processEvents();
  renderFrame();
  
  lastTick = Date.now();
}

setInterval(tick, TICK_RATE_MS);
```

**Pièges à éviter** :
- **Tick trop rapide** → CPU saturé
- **Tick trop lent** → simulation qui lag
- **Opérations longues dans le tick** → freeze de la simulation

### Séparer simulation et rendu

**Règle** : la logique de simulation ne doit pas dépendre du rendu.

```
Simulation (tick) → État du monde → Rendu (frame)
```

Avantages :
- Tu peux changer le rendu sans toucher la logique
- Tu peux avoir plusieurs rendus de la même simulation (globe, iso, ASCII debug…) — Genesis Live utilise d'ailleurs deux projections 2D cohabitant, voir [render_spec.md](render_spec.md)
- Tu peux accélérer/ralentir la simulation indépendamment du framerate

### Persistance de l'état

Pour un stream qui doit tourner en continu sur des semaines :

**1. Snapshots réguliers**
Sauvegarde l'état complet toutes les X minutes. En cas de crash, rechargement rapide.

**2. Event sourcing** (plus avancé)
Ne stocke pas l'état, mais la séquence d'événements qui y mène. Permet de rejouer, de debugger, de remonter dans le temps.

**3. Backups tournants**
Garde plusieurs snapshots (dernier, 1h, 6h, 24h, 1 semaine). Si corruption, tu peux remonter.

### Gestion du chat / inputs externes

**1. Queue d'événements**
Ne traite pas les messages du chat directement. Mets-les dans une queue, le tick les consomme.

```js
const eventQueue = [];

chatClient.on('message', msg => eventQueue.push(msg));

function tick() {
  while (eventQueue.length > 0) {
    const event = eventQueue.shift();
    processEvent(event);
  }
  // ... reste du tick
}
```

**2. Rate limiting**
Limite les actions par viewer pour éviter le spam et les surcharges.

**3. Validation stricte**
Chaque input du chat est hostile jusqu'à preuve du contraire. Valide tout.

### Déterminisme (si possible)

Une simulation **déterministe** (mêmes inputs → même résultat) est :
- Plus facile à déboguer
- Plus facile à rejouer
- Plus facile à synchroniser

Pour y arriver :
- Utilise un PRNG (random) **seedé** au lieu de `Math.random()`
- Évite les dépendances au timestamp réel dans la logique
- Sérialise l'ordre des événements

### Monitoring et observabilité

Pour un système qui tourne en continu, tu **dois** savoir ce qui se passe :

**Métriques à suivre** :
- Tick rate réel vs cible
- Latence de traitement des événements
- Mémoire utilisée (détecter les fuites)
- Erreurs par minute
- Activité du chat
- État de la simulation (nombre d'entités, âge actuel, etc.)

**Outils** :
- Logs structurés (JSON) avec niveaux (DEBUG, INFO, WARN, ERROR)
- Dashboard de métriques (Grafana, ou un simple endpoint `/stats`)
- Alertes (crash, anomalies)

### Gestion des crashes

Pour un stream 24/7 :

**1. Auto-restart** : utilise `pm2`, `systemd`, ou `Docker restart policy`.

**2. Graceful degradation** : un composant qui crash ne doit pas tout emporter.

**3. Circuit breakers** : si une API externe est HS, arrête de l'appeler temporairement.

**4. Dead letter queues** : les événements qui échouent sont stockés pour analyse, pas perdus.

### Scalabilité future

Même si tu commences petit, pense à :
- **Séparer les responsabilités** : simulation, chat, rendu, persistance
- **Interfaces bien définies** : tu pourras changer une implémentation sans tout casser
- **Configuration externalisée** : pas de valeurs hardcodées dans le code

---

## 🎯 Mantras à afficher au-dessus de l'écran

> "Code is read more than it's written."

> "Make it work, make it right, make it fast — in that order."

> "Premature optimization is the root of all evil."

> "The best code is no code."

> "Simplicity is the ultimate sophistication."

> "Clarity over cleverness."

> "When in doubt, leave it out."

> "Fix the cause, not the symptom."

> "Debug by understanding, not by guessing."

> "A bug found in dev costs 1. In staging, 10. In prod, 100."

---

## 📚 Pour aller plus loin

**Livres essentiels** :
- *Clean Code* — Robert C. Martin
- *The Pragmatic Programmer* — Hunt & Thomas
- *Refactoring* — Martin Fowler
- *Design Patterns* — Gang of Four
- *Code Complete* — Steve McConnell

**Concepts à explorer** :
- Domain-Driven Design (DDD)
- Hexagonal Architecture / Clean Architecture
- Functional Programming basics
- CAP Theorem (pour le distribué)
- Event-Driven Architecture

---

## ✨ Conclusion

Les bonnes pratiques ne sont **pas des règles absolues**. Ce sont des **défauts raisonnables** qui t'épargnent des problèmes dans 90% des cas.

Apprends-les, applique-les, puis apprends **quand les casser**. C'est la marque d'un développeur expérimenté.

Et surtout : **le meilleur code est celui qui existe**. Ne vise pas la perfection, vise l'amélioration continue.

---

*Document vivant. À relire de temps en temps, surtout quand on est tenté de faire des raccourcis.*
