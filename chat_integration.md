# 💬 GENESIS LIVE — Intégration du chat

*Comment connecter les plateformes de streaming au moteur, parser les commandes, gérer les abus et créer une boucle viewer → monde fluide.*

---

## 📖 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Plateformes supportées](#plateformes-supportées)
3. [Architecture du chat adapter](#architecture-du-chat-adapter)
4. [Intégration YouTube Live](#intégration-youtube-live)
5. [Intégration Twitch](#intégration-twitch)
6. [Intégration Kick (optionnel)](#intégration-kick-optionnel)
7. [Parsing des commandes](#parsing-des-commandes)
8. [Système de Points d'Influence (PI)](#système-de-points-dinfluence-pi)
9. [Rate limiting et cooldowns](#rate-limiting-et-cooldowns)
10. [Modération automatique](#modération-automatique)
11. [Gestion des erreurs](#gestion-des-erreurs)
12. [Feedback aux viewers](#feedback-aux-viewers)
13. [Événements passifs](#événements-passifs)
14. [Commandes multi-chat](#commandes-multi-chat)
15. [Monitoring et analytics](#monitoring-et-analytics)
16. [Sécurité](#sécurité)

---

## Vue d'ensemble

### Le pont entre deux mondes

Le chat adapter est **le composant le plus critique** de Genesis Live. C'est lui qui transforme des messages de chat en événements qui modifient le monde. Si le chat adapter casse, tout le jeu s'arrête.

### Objectifs du système

**1. Fiabilité**
Le chat doit fonctionner **24/7** avec un taux d'erreur < 0.1%. Une déconnexion de l'API doit être invisible pour les viewers.

**2. Latence minimale**
Cible : **< 3 secondes** entre le moment où un viewer tape une commande et le moment où il voit l'effet à l'écran.

**3. Équité**
Tous les viewers doivent avoir leurs chances. Pas de favoritisme système (sauf pour les features payantes explicites).

**4. Protection**
Le système doit résister au spam, au troll organisé, aux bots malveillants, aux injections de code.

**5. Adaptabilité**
Support de plusieurs plateformes simultanément. Ajout facile de nouvelles plateformes.

### Flux haut niveau

```
┌──────────────────────────────────────────────────────────┐
│  PLATEFORMES (YouTube, Twitch, Kick...)                  │
└──────────────────────┬───────────────────────────────────┘
                       │ Messages bruts
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ADAPTERS (1 par plateforme)                              │
│  - Connexion API                                          │
│  - Reconnexion auto                                       │
│  - Normalisation des messages                             │
└──────────────────────┬───────────────────────────────────┘
                       │ Format unifié
                       ▼
┌──────────────────────────────────────────────────────────┐
│  MESSAGE PROCESSOR                                        │
│  - Détection de commandes                                 │
│  - Modération préliminaire                                │
│  - Enregistrement présence                                │
└──────────────────────┬───────────────────────────────────┘
                       │ Commandes parsées
                       ▼
┌──────────────────────────────────────────────────────────┐
│  COMMAND VALIDATOR                                        │
│  - Vérification existence viewer                          │
│  - Cooldowns                                              │
│  - PI suffisants                                          │
│  - Permissions                                            │
└──────────────────────┬───────────────────────────────────┘
                       │ Commandes valides
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ACTION EMITTER                                           │
│  - Enqueue dans event queue simulation                    │
│  - Log pour analytics                                     │
└──────────────────────┬───────────────────────────────────┘
                       │ ChatAction events
                       ▼
                [Simulation Engine]
```

---

## Plateformes supportées

### Priorités d'intégration

**Phase 1 (MVP)** :
- ✅ YouTube Live Chat (priorité 1)
- ✅ Mock adapter (pour dev local)

**Phase 2** :
- ✅ Twitch Chat (tmi.js)

**Phase 3** :
- ⏳ Kick.com
- ⏳ Discord (pour tests VIP)

**Phase 4 (futur)** :
- TikTok Live (quand l'API sera stable)
- Rumble
- X (Twitter) Spaces

### Comparaison des plateformes

| Feature | YouTube | Twitch | Kick | Discord |
|---------|---------|--------|------|---------|
| API chat officielle | ✅ | ✅ | ⚠️ Limitée | ✅ |
| Coût | Gratuit (quota) | Gratuit | Gratuit | Gratuit |
| Identité viewer | ChannelID | Username | Username | UserID |
| Subs détectables | ✅ | ✅ | ⚠️ | ❌ (boost) |
| Superchats | ✅ | ⚠️ Bits | ✅ | ❌ |
| WebSocket natif | ❌ Poll | ✅ IRC | ⚠️ | ✅ |
| Rate limit API | Strict | Moyen | ? | Généreux |
| Latence moyenne | 3-5s | 1-2s | 2-3s | <1s |

**Stratégie de diffusion** : **multistream YouTube Live + Twitch en simultané dès le lancement**. Les deux plateformes reçoivent le même flux vidéo (via OBS + relais multistream — voir [architecture.md §Diffusion multi-plateforme](architecture.md#diffusion-multi-plateforme)) et les deux chats sont agrégés dans le même monde Genesis Live (voir [§Commandes multi-chat](#commandes-multi-chat)).

Techniquement, Twitch est plus confortable (IRC WebSocket, latence ~1-2s). YouTube est indispensable pour la découvrabilité et les superchats. Les deux sont donc traités en **co-primaires**, pas hiérarchisés.

---

## Architecture du chat adapter

### Interface unifiée

Tous les adapters implémentent la même interface :

```typescript
interface ChatAdapter {
  // Configuration
  readonly platform: 'youtube' | 'twitch' | 'kick' | 'discord' | 'mock';
  readonly channelId: string;
  
  // Cycle de vie
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Événements entrants
  onMessage(handler: (msg: ChatMessage) => void): void;
  onSubscribe(handler: (event: SubscribeEvent) => void): void;
  onDonation(handler: (event: DonationEvent) => void): void;
  onViewerJoin(handler: (viewer: ViewerInfo) => void): void;
  onViewerLeave(handler: (viewer: ViewerInfo) => void): void;
  onRaid(handler: (event: RaidEvent) => void): void;
  
  // Actions sortantes (optionnel selon plateforme)
  sendMessage(text: string): Promise<void>;
  
  // Stats
  getCurrentViewerCount(): number;
  getConnectedSince(): Date | null;
}
```

### Format de message unifié

Chaque plateforme normalise ses messages vers ce format :

```typescript
interface ChatMessage {
  // Méta
  id: string;                        // ID unique du message
  platform: Platform;
  receivedAt: number;                // Timestamp Unix ms
  
  // Auteur
  viewer: {
    platformId: string;              // ID sur la plateforme
    pseudo: string;
    displayColor: string | null;     // Couleur choisie sur la plateforme
    isSubscriber: boolean;
    subscriberTier: number;          // 0 = non-sub, 1, 2, 3...
    isModerator: boolean;
    isVIP: boolean;
    isBroadcaster: boolean;
    badges: string[];                // Badges spéciaux
  };
  
  // Contenu
  text: string;                      // Texte brut
  emotes: Emote[];                   // Emotes détectées
  
  // Super chats / bits
  isSuperchat: boolean;
  superchatAmount: number | null;    // En euros équivalent
  superchatCurrency: string | null;
  bits: number | null;               // Twitch bits
  
  // Contexte
  replyToMessageId: string | null;
}
```

### Classe de base AbstractAdapter

Pour éviter la duplication, une classe abstraite gère les concepts communs :

```typescript
abstract class AbstractChatAdapter implements ChatAdapter {
  protected handlers: Map<string, Function[]> = new Map();
  protected connected: boolean = false;
  protected connectedSince: Date | null = null;
  protected logger: Logger;
  
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  
  async reconnect() {
    this.logger.info('Reconnecting...');
    try {
      await this.disconnect();
    } catch (e) {
      // Ignorer les erreurs de disconnect
    }
    await this.sleep(1000);
    await this.connect();
  }
  
  onMessage(handler) { this.addHandler('message', handler); }
  onSubscribe(handler) { this.addHandler('subscribe', handler); }
  // ... autres handlers
  
  protected emit(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(h => {
      try {
        h(data);
      } catch (e) {
        this.logger.error('Handler error', { event, error: e });
      }
    });
  }
  
  isConnected() { return this.connected; }
  getConnectedSince() { return this.connectedSince; }
}
```

### Reconnexion automatique

**Stratégie** : exponential backoff avec jitter, jamais d'abandon.

```typescript
class ReconnectionManager {
  private attempts = 0;
  private readonly MAX_DELAY = 60000; // 1 minute max
  
  async reconnectWithBackoff(adapter: ChatAdapter) {
    while (true) {
      this.attempts++;
      const delay = Math.min(
        1000 * Math.pow(2, this.attempts - 1),
        this.MAX_DELAY
      );
      const jitter = Math.random() * 1000;
      const totalDelay = delay + jitter;
      
      this.logger.warn(`Reconnect attempt ${this.attempts} in ${totalDelay}ms`);
      await this.sleep(totalDelay);
      
      try {
        await adapter.connect();
        this.attempts = 0;
        this.logger.info('Reconnected successfully');
        return;
      } catch (error) {
        this.logger.error('Reconnect failed', { attempt: this.attempts, error });
      }
    }
  }
}
```

---

## Intégration YouTube Live

### Approche technique

YouTube ne propose pas de WebSocket officiel pour le chat. Il faut **poll** l'API régulièrement. C'est moins élégant mais ça marche.

**Deux approches possibles** :

**Option A : API officielle YouTube Data API v3** (recommandée)
- Endpoint : `GET /liveChat/messages`
- Quota : 10 000 unités/jour (1 requête chat = 5 unités)
- À une requête par 2 secondes → 43 200 unités/jour ❌
- À une requête par 5 secondes → 17 280 unités/jour ❌

Il faut donc optimiser : **requête toutes les 3-4 secondes**, et réduire la fréquence en période creuse.

**Option B : Librairies tierces non-officielles**
- Exemple : `@yt-live-chat/api`
- Utilisent du scraping, risqué (peut casser), non supporté
- À éviter en production long terme

### Setup YouTube API

```typescript
// Configuration nécessaire dans .env
YOUTUBE_API_KEY=AIza...              // Clé API Google Cloud
YOUTUBE_CHANNEL_ID=UC...             // ID de la chaîne
YOUTUBE_LIVE_VIDEO_ID=optional       // Si stream en cours
```

**Étapes côté Google Cloud Console** :
1. Créer un projet
2. Activer YouTube Data API v3
3. Créer des credentials (clé API)
4. Configurer les quotas si besoin (demande de quota élevé gratuite)

### Implémentation

```typescript
class YouTubeLiveAdapter extends AbstractChatAdapter {
  platform = 'youtube' as const;
  private pollInterval = 3000;
  private liveChatId: string | null = null;
  private nextPageToken: string | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  
  async connect() {
    // 1. Trouver le live chat ID depuis la video ID ou le channel
    this.liveChatId = await this.findLiveChatId();
    
    if (!this.liveChatId) {
      throw new Error('No active live stream found');
    }
    
    // 2. Démarrer le polling
    this.connected = true;
    this.connectedSince = new Date();
    this.startPolling();
    this.emit('connect', {});
  }
  
  private async startPolling() {
    while (this.connected) {
      try {
        await this.pollMessages();
        await this.sleep(this.pollInterval);
      } catch (error) {
        this.logger.error('Poll failed', { error });
        this.emit('error', { error });
        // Ralentir en cas d'erreur (évite rate limiting)
        await this.sleep(10000);
      }
    }
  }
  
  private async pollMessages() {
    const url = `https://www.googleapis.com/youtube/v3/liveChat/messages`;
    const params = {
      liveChatId: this.liveChatId,
      part: 'snippet,authorDetails',
      pageToken: this.nextPageToken,
      maxResults: 200,
      key: process.env.YOUTUBE_API_KEY
    };
    
    const response = await fetch(`${url}?${new URLSearchParams(params)}`);
    const data = await response.json();
    
    if (data.error) {
      throw new YouTubeAPIError(data.error.message);
    }
    
    // Ajuster le polling selon la réponse
    this.pollInterval = Math.max(data.pollingIntervalMillis || 3000, 2000);
    this.nextPageToken = data.nextPageToken;
    
    // Émettre chaque message
    for (const item of data.items) {
      this.emit('message', this.normalizeMessage(item));
    }
  }
  
  private normalizeMessage(item: any): ChatMessage {
    const snippet = item.snippet;
    const author = item.authorDetails;
    
    return {
      id: item.id,
      platform: 'youtube',
      receivedAt: Date.now(),
      
      viewer: {
        platformId: author.channelId,
        pseudo: author.displayName,
        displayColor: null,
        isSubscriber: author.isChatSponsor,
        subscriberTier: 0, // YouTube ne différencie pas les tiers
        isModerator: author.isChatModerator,
        isVIP: false,
        isBroadcaster: author.isChatOwner,
        badges: this.extractBadges(author)
      },
      
      text: snippet.displayMessage,
      emotes: [], // YouTube emotes : complexe à parser
      
      isSuperchat: snippet.type === 'superChatEvent',
      superchatAmount: snippet.superChatDetails?.amountMicros 
        ? snippet.superChatDetails.amountMicros / 1_000_000 
        : null,
      superchatCurrency: snippet.superChatDetails?.currency || null,
      bits: null,
      
      replyToMessageId: null
    };
  }
  
  private async findLiveChatId(): Promise<string | null> {
    if (process.env.YOUTUBE_LIVE_VIDEO_ID) {
      return await this.getLiveChatIdFromVideo(process.env.YOUTUBE_LIVE_VIDEO_ID);
    }
    return await this.findActiveLiveStream(process.env.YOUTUBE_CHANNEL_ID);
  }
  
  async disconnect() {
    this.connected = false;
    if (this.pollTimer) clearTimeout(this.pollTimer);
  }
}
```

### Détection des abonnements

YouTube permet d'obtenir les events `newSponsorEvent` via l'API events. Un poll séparé peut être nécessaire.

```typescript
// Endpoint : /youtube/v3/liveChat/messages avec filter sur type
// Types possibles: 'textMessageEvent', 'newSponsorEvent', 'superChatEvent', 'memberMilestoneChatEvent'
```

### Limitations YouTube

- **Latence** : 2-5 secondes typiques entre l'envoi et la réception
- **Quota** : à surveiller, requêtes consomment du quota
- **Emotes custom** : difficile à détecter
- **Messages supprimés** : l'API les filtre automatiquement

---

## Intégration Twitch

### Approche technique

Twitch utilise **IRC over WebSocket** — beaucoup plus simple et plus rapide que YouTube.

**Librairie recommandée** : `tmi.js` (battle-tested, doc excellente)

### Setup Twitch

**Étapes** :
1. Créer une application Twitch Developer
2. Obtenir un OAuth token (pour bot)
3. Identifier le canal cible

```typescript
// .env
TWITCH_USERNAME=genesis_live_bot
TWITCH_OAUTH=oauth:xxxxxxxxxxxxx
TWITCH_CHANNEL=your_channel_name
```

### Implémentation

```typescript
import tmi from 'tmi.js';

class TwitchAdapter extends AbstractChatAdapter {
  platform = 'twitch' as const;
  private client: tmi.Client | null = null;
  
  async connect() {
    this.client = new tmi.Client({
      options: { debug: false },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_OAUTH
      },
      channels: [process.env.TWITCH_CHANNEL!]
    });
    
    this.setupHandlers();
    await this.client.connect();
    
    this.connected = true;
    this.connectedSince = new Date();
    this.emit('connect', {});
  }
  
  private setupHandlers() {
    if (!this.client) return;
    
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return; // Ignorer nos propres messages
      
      this.emit('message', this.normalizeMessage(tags, message));
    });
    
    this.client.on('subscription', (channel, username, method, message, userstate) => {
      this.emit('subscribe', {
        viewer: this.normalizeUserstate(userstate),
        tier: this.parseTier(userstate['msg-param-sub-plan']),
        isGift: false
      });
    });
    
    this.client.on('resub', (channel, username, months, message, userstate, methods) => {
      this.emit('subscribe', {
        viewer: this.normalizeUserstate(userstate),
        tier: this.parseTier(userstate['msg-param-sub-plan']),
        isGift: false,
        isResub: true,
        months
      });
    });
    
    this.client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
      this.emit('subscribe', {
        viewer: { pseudo: recipient, platformId: userstate['msg-param-recipient-id'] },
        gifter: { pseudo: username, platformId: userstate['user-id'] },
        tier: this.parseTier(userstate['msg-param-sub-plan']),
        isGift: true
      });
    });
    
    this.client.on('cheer', (channel, userstate, message) => {
      const bits = parseInt(userstate['bits'] || '0');
      this.emit('donation', {
        viewer: this.normalizeUserstate(userstate),
        bits,
        amount: bits * 0.01, // 1 bit ≈ 1 cent
        message
      });
    });
    
    this.client.on('raided', (channel, username, viewers) => {
      this.emit('raid', {
        raider: username,
        viewerCount: viewers
      });
    });
    
    this.client.on('disconnected', (reason) => {
      this.connected = false;
      this.emit('disconnect', { reason });
    });
  }
  
  private normalizeMessage(tags: any, text: string): ChatMessage {
    return {
      id: tags.id || `twitch-${Date.now()}-${Math.random()}`,
      platform: 'twitch',
      receivedAt: Date.now(),
      
      viewer: {
        platformId: tags['user-id'],
        pseudo: tags['display-name'] || tags.username,
        displayColor: tags.color || null,
        isSubscriber: !!tags.subscriber,
        subscriberTier: this.parseTier(tags.badges?.subscriber),
        isModerator: !!tags.mod,
        isVIP: !!tags.badges?.vip,
        isBroadcaster: !!tags.badges?.broadcaster,
        badges: Object.keys(tags.badges || {})
      },
      
      text,
      emotes: this.parseEmotes(tags.emotes, text),
      
      isSuperchat: false,
      superchatAmount: null,
      superchatCurrency: null,
      bits: tags.bits ? parseInt(tags.bits) : null,
      
      replyToMessageId: tags['reply-parent-msg-id'] || null
    };
  }
  
  async disconnect() {
    this.connected = false;
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
}
```

### Avantages Twitch

- **Latence** : 1-2 secondes
- **WebSocket natif** : pas de polling
- **API riche** : subs, resubs, gifts, bits, raids, hosts
- **Emotes parsables** : info détaillée dans les tags

---

## Intégration Kick (optionnel)

Kick.com est plus récent et son API est moins stable. À implémenter plus tard.

**Approche actuelle** : WebSocket privé utilisable mais non documenté officiellement. Risque de breaking changes.

**Recommandation** : attendre qu'une API officielle soit publiée, ou utiliser une librairie communautaire maintenue.

---

## Parsing des commandes

### Détection d'une commande

Un message est considéré comme une commande si :
1. Il commence par `!`
2. Le premier mot (sans `!`) est dans le registre des commandes
3. Le viewer a les permissions

### Parser structuré

```typescript
interface ParsedCommand {
  name: string;                      // ex: "rain"
  rawName: string;                   // ex: "!RaIn"
  args: string[];                    // ex: ["storm"]
  rawArgs: string;                   // tout après le nom
  viewer: ViewerInfo;
  message: ChatMessage;
}

class CommandParser {
  parse(message: ChatMessage): ParsedCommand | null {
    const text = message.text.trim();
    
    // 1. Commence par ! ?
    if (!text.startsWith('!')) return null;
    
    // 2. Extraire nom et args
    const parts = text.slice(1).split(/\s+/);
    const rawName = parts[0];
    const name = this.resolveAlias(rawName.toLowerCase());
    const args = parts.slice(1);
    const rawArgs = text.slice(1 + rawName.length).trim();
    
    // 3. Commande existe ?
    if (!this.commandRegistry.has(name)) return null;
    
    return {
      name,
      rawName,
      args,
      rawArgs,
      viewer: message.viewer,
      message
    };
  }
  
  private resolveAlias(input: string): string {
    return this.aliases.get(input) || input;
  }
}
```

### Registre des commandes

Chaque commande est définie dans un objet :

```typescript
interface CommandDefinition {
  name: string;
  aliases: string[];
  description: string;
  
  // Coût
  cost: number;                      // PI nécessaires
  
  // Limites
  cooldownMs: number;                // Cooldown personnel
  globalCooldownMs?: number;         // Cooldown global (toutes viewers)
  onePerCycle?: boolean;             // 1 fois max par cycle
  
  // Permissions
  requiresSubscriber?: boolean;
  requiresMinTier?: number;          // Tier minimum de sub
  requiresModerator?: boolean;
  requiresSuperchat?: boolean;       // Déclenchable uniquement via superchat
  
  // Disponibilité contextuelle
  availableInAges: string[];         // ["III", "IV", "V", "VI", "VII"]
  availableOnlyInApocalypse?: boolean;
  
  // Exécution
  validate?: (ctx: CommandContext) => ValidationResult;
  execute: (ctx: CommandContext) => CommandResult;
}
```

### Exemple complet

```typescript
const rainCommand: CommandDefinition = {
  name: 'rain',
  aliases: ['pluie', 'rainfall'],
  description: 'Déclenche une pluie',
  
  cost: 0,
  cooldownMs: 3 * 60 * 1000,
  
  availableInAges: ['II', 'III', 'IV', 'V', 'VI', 'VII'],
  
  validate(ctx) {
    const intensity = ctx.args[0];
    const validIntensities = ['light', 'normal', 'storm', 'monsoon'];
    
    if (intensity && !validIntensities.includes(intensity)) {
      return { 
        valid: false, 
        reason: `Intensité invalide. Valides : ${validIntensities.join(', ')}` 
      };
    }
    
    return { valid: true };
  },
  
  execute(ctx) {
    const intensity = ctx.args[0] || 'normal';
    const cost = intensity === 'storm' ? 50 : intensity === 'monsoon' ? 200 : 0;
    
    if (cost > 0 && ctx.viewer.pi < cost) {
      return {
        success: false,
        reason: `Il vous faut ${cost} PI pour une pluie ${intensity}`
      };
    }
    
    return {
      success: true,
      effect: {
        type: 'RAIN',
        params: { intensity, duration: { light: 300, normal: 600, storm: 900, monsoon: 1800 }[intensity] }
      },
      piConsumed: cost
    };
  }
};
```

### Alias multilingues

Pour rendre les commandes accessibles dans plusieurs langues :

```typescript
const aliases = new Map([
  // Français
  ['pluie', 'rain'],
  ['foudre', 'lightning'],
  ['guerre', 'war'],
  ['paix', 'peace'],
  ['cité', 'city'],
  ['ville', 'city'],
  ['volcan', 'volcano'],
  
  // Espagnol
  ['lluvia', 'rain'],
  ['ciudad', 'city'],
  
  // Allemand
  ['regen', 'rain'],
  ['stadt', 'city'],
  
  // ... etc
]);
```

---

## Système de Points d'Influence (PI)

### Accumulation des PI

Chaque viewer accumule des PI selon son engagement :

```typescript
const PI_EARNINGS = {
  // Présence
  PER_MINUTE_WATCHING: 1,            // +1 PI par minute
  
  // Chat actif
  PER_MESSAGE: 10,                   // +10 PI par message
  PER_QUALITY_MESSAGE: 25,           // +25 si message long/pertinent
  MAX_PER_MINUTE: 100,               // Cap anti-spam
  
  // Interactions
  PER_LIKE: 5,                       // +5 par like
  PER_SHARE: 50,                     // +50 par partage
  
  // Subscriptions
  PER_SUBSCRIBE: 500,                // +500 pour nouveau sub
  PER_RESUBSCRIBE: 250,              // +250 pour resub
  PER_GIFTED_SUB: 100,               // +100 pour sub offert
  PER_SUB_TIER_UP: 1000,             // +1000 si tier supérieur
  
  // Monétaire
  PER_EURO_DONATED: 100,             // +100 PI par euro
  MINIMUM_DONATION_PI: 500,          // Minimum, même pour 1€
  
  // Bonus spéciaux
  DAILY_LOGIN: 50,                   // +50 par jour de présence
  STREAK_BONUS: 10,                  // +10 par jour consécutif
  RETURNING_AFTER_CYCLE: 200,        // +200 au retour après 1 cycle d'absence
  MILESTONE_100_ACTIONS: 500,        // +500 à la 100e action
  MILESTONE_1000_ACTIONS: 5000       // +5000 à la 1000e action
};
```

### Gestion du solde

**Stockage** : table `Viewer.currentPI` (int)
**Atomicité** : les opérations sur les PI doivent être atomiques pour éviter les race conditions.

```typescript
class PIManager {
  async awardPI(viewerId: number, amount: number, reason: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const viewer = await tx.viewer.findByIdForUpdate(viewerId);
      
      // Anti-fraud : vérifier que l'award n'est pas absurde
      if (amount > 10000) {
        throw new Error(`Award suspect: ${amount}`);
      }
      
      viewer.currentPI += amount;
      viewer.lifetimePI += amount;
      
      await tx.viewer.update(viewer);
      await tx.piHistory.insert({
        viewerId,
        delta: amount,
        reason,
        balanceAfter: viewer.currentPI,
        timestamp: Date.now()
      });
    });
  }
  
  async consumePI(viewerId: number, amount: number, reason: string): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const viewer = await tx.viewer.findByIdForUpdate(viewerId);
      
      if (viewer.currentPI < amount) {
        return false; // Pas assez
      }
      
      viewer.currentPI -= amount;
      viewer.lifetimePISpent += amount;
      
      await tx.viewer.update(viewer);
      await tx.piHistory.insert({
        viewerId,
        delta: -amount,
        reason,
        balanceAfter: viewer.currentPI,
        timestamp: Date.now()
      });
      
      return true;
    });
  }
}
```

### Affichage des PI au viewer

**Commande** `!me` : affiche ses propres stats
**Commande** `!pi [@pseudo]` : voir les PI d'un autre viewer (si option activée)

Exemple de réponse :
```
@Tom — 2457 PI | 12 titres | 89 actions | Présent depuis cycle 7
```

### Protection contre l'inflation

Sur le très long terme, les PI peuvent s'accumuler dangereusement. Plusieurs protections :

1. **Dépréciation lente** : -1% des PI par semaine d'inactivité (dissuade l'accumulation passive)
2. **Cap** : maximum 1 000 000 PI par viewer (dissuade l'hyper-accumulation)
3. **Commandes "sink"** : certaines commandes très coûteuses drainent les PI accumulés

---

## Rate limiting et cooldowns

### Trois niveaux de limitation

**1. Rate limiting global (anti-spam)**

Limite le nombre de commandes qu'un viewer peut faire sur une fenêtre courte :

```typescript
const RATE_LIMITS = {
  MAX_COMMANDS_PER_MINUTE: 3,        // Par viewer
  MAX_COMMANDS_PER_HOUR: 30,         // Par viewer
  PENALTY_DURATION_MS: 10 * 60 * 1000 // 10 min de timeout si dépassement
};
```

**2. Cooldown par commande**

Chaque commande a son propre cooldown :

```typescript
class CooldownManager {
  private cooldowns: Map<string, number> = new Map(); // key: `${viewerId}:${command}`
  
  check(viewerId: number, command: string, cooldownMs: number): boolean {
    const key = `${viewerId}:${command}`;
    const lastUsed = this.cooldowns.get(key);
    
    if (lastUsed && Date.now() - lastUsed < cooldownMs) {
      return false; // En cooldown
    }
    
    return true;
  }
  
  set(viewerId: number, command: string): void {
    const key = `${viewerId}:${command}`;
    this.cooldowns.set(key, Date.now());
  }
  
  // Nettoyage périodique
  cleanup() {
    const now = Date.now();
    const MAX_AGE = 60 * 60 * 1000; // 1 heure
    
    for (const [key, time] of this.cooldowns.entries()) {
      if (now - time > MAX_AGE) {
        this.cooldowns.delete(key);
      }
    }
  }
}
```

**3. Cooldown global (pour les commandes exceptionnelles)**

Certaines commandes ne peuvent être utilisées qu'une fois par cycle ou une fois tous les X ticks :

```typescript
interface GlobalCooldown {
  command: string;
  lastUsedAtTick: number;
  lastUsedByViewerId: number;
  minimumTicksBetween: number;
}
```

### Pénalités en cas de spam

```typescript
class SpamDetector {
  private violations: Map<number, number> = new Map(); // viewerId -> count
  
  recordViolation(viewerId: number) {
    const count = (this.violations.get(viewerId) || 0) + 1;
    this.violations.set(viewerId, count);
    
    if (count >= 5) {
      this.applyPenalty(viewerId, 'severe');
    } else if (count >= 3) {
      this.applyPenalty(viewerId, 'medium');
    } else {
      this.applyPenalty(viewerId, 'light');
    }
  }
  
  applyPenalty(viewerId: number, level: 'light' | 'medium' | 'severe') {
    const durations = {
      light: 5 * 60 * 1000,      // 5 min
      medium: 30 * 60 * 1000,    // 30 min
      severe: 24 * 60 * 60 * 1000 // 24h (ban temporaire)
    };
    
    this.timeoutManager.timeout(viewerId, durations[level]);
  }
}
```

### Courbe de punition

Les pénalités augmentent exponentiellement :
- 1ère infraction : warning silencieux
- 2ème : cooldown global x2 pendant 30 min
- 3ème : timeout 5 min (aucune commande)
- 4ème : timeout 30 min
- 5ème : timeout 24h
- 6ème : ban permanent (sauf levée manuelle)

**Réinitialisation** : les violations s'effacent après 7 jours sans nouvelle infraction.

---

## Modération automatique

### Filtres en amont

**Avant même le parsing**, les messages passent par des filtres :

```typescript
class MessageFilter {
  shouldProcess(message: ChatMessage): FilterResult {
    // 1. Message vide ou trop court
    if (message.text.trim().length < 1) {
      return { action: 'ignore' };
    }
    
    // 2. Message trop long (probablement spam)
    if (message.text.length > 500) {
      return { action: 'ignore' };
    }
    
    // 3. Blacklist de mots
    if (this.containsBlockedWord(message.text)) {
      return { action: 'block', reason: 'blocked_word' };
    }
    
    // 4. Detection de liens
    if (this.containsURL(message.text) && !message.viewer.isModerator) {
      return { action: 'block', reason: 'url_not_allowed' };
    }
    
    // 5. Caps excessives (>70% majuscules)
    if (this.hasExcessiveCaps(message.text)) {
      return { action: 'warn' };
    }
    
    // 6. Répétition de caractères (aaaaa, !!!!!)
    if (this.hasRepetition(message.text)) {
      return { action: 'warn' };
    }
    
    return { action: 'process' };
  }
}
```

### Blacklist de mots

Structure à 3 niveaux :

```typescript
const BLOCKED_WORDS = {
  // Niveau 1 : bloqués absolument (insultes extrêmes, contenu illégal)
  absolute: [
    // Liste à compléter avec la langue et le contexte du stream
  ],
  
  // Niveau 2 : bloqués dans certains contextes
  contextual: [
    // Ex: mots ambigus
  ],
  
  // Niveau 3 : warning (message passe, mais logué pour analyse)
  warning: [
    // Mots à surveiller
  ]
};
```

**Détection fuzzy** : pour contrer les contournements (l33t speak, caractères spéciaux) :

```typescript
function normalizeForModeration(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-z]/g, ''); // Enlever tout caractère non-alphabétique
}
```

### Protection des noms d'entités

Quand un viewer nomme une entité (espèce, cité, religion), on vérifie :

```typescript
class EntityNameValidator {
  validate(name: string): ValidationResult {
    // Longueur
    if (name.length < 2 || name.length > 30) {
      return { valid: false, reason: 'length' };
    }
    
    // Caractères autorisés uniquement
    if (!/^[a-zA-Z0-9_\- àâçéèêëîïôûù]+$/.test(name)) {
      return { valid: false, reason: 'invalid_chars' };
    }
    
    // Pas de mot blacklisté
    if (this.moderator.containsBlockedWord(name)) {
      return { valid: false, reason: 'blocked_word' };
    }
    
    // Pas de pattern problématique (doxxing, threats...)
    if (this.isProblematicPattern(name)) {
      return { valid: false, reason: 'pattern' };
    }
    
    return { valid: true };
  }
}
```

### Détection de bots

Signaux qui suggèrent un bot :

1. **Messages identiques** en rafale
2. **Timing parfait** (exactement même intervalle entre messages)
3. **Patterns prédictibles** (séquences numérotées)
4. **Absence d'erreurs typiques** (humain fait des fautes, bot non)
5. **Compte récent** + présence soudaine et intense

```typescript
class BotDetector {
  private messageHistories: Map<number, ChatMessage[]> = new Map();
  
  analyze(viewerId: number, message: ChatMessage): BotScore {
    const history = this.messageHistories.get(viewerId) || [];
    history.push(message);
    
    let score = 0;
    
    // Messages identiques récents
    const duplicates = history.filter(m => m.text === message.text).length;
    if (duplicates > 3) score += 30;
    
    // Timing régulier
    if (this.hasRegularTiming(history)) score += 20;
    
    // Longueur anormalement constante
    if (this.hasConstantLength(history)) score += 15;
    
    // Vocabulaire ultra-limité
    if (this.hasLimitedVocabulary(history)) score += 15;
    
    // Compte nouveau + très actif
    const accountAge = Date.now() - message.viewer.accountCreatedAt;
    if (accountAge < 24 * 60 * 60 * 1000 && history.length > 20) {
      score += 20;
    }
    
    this.messageHistories.set(viewerId, history.slice(-50)); // Garder 50 derniers
    
    return {
      score,
      isLikelyBot: score >= 60,
      confidence: Math.min(score / 100, 1)
    };
  }
}
```

### Shadowbans

Pour les viewers problématiques, un **shadowban** est souvent plus efficace qu'un ban explicite : leurs messages sont ignorés mais ils continuent de voir le stream normal. Ils ne réalisent pas et ne reviennent pas créer un nouveau compte.

```typescript
class ShadowbanManager {
  private shadowbanned: Set<number> = new Set();
  
  shadowban(viewerId: number, reason: string) {
    this.shadowbanned.add(viewerId);
    this.logger.info('Viewer shadowbanned', { viewerId, reason });
  }
  
  isShadowbanned(viewerId: number): boolean {
    return this.shadowbanned.has(viewerId);
  }
}
```

---

## Gestion des erreurs

### Types d'erreurs

**1. Erreurs de plateforme** (API down, rate limited)
→ Reconnexion automatique, notification admin si persistant

**2. Erreurs de validation** (commande inconnue, pas assez de PI)
→ Feedback poli au viewer, pas de log d'erreur

**3. Erreurs de simulation** (état du monde incohérent)
→ Log détaillé, rollback si possible, alerte admin

**4. Erreurs de code** (bug)
→ Log + stack trace, ne doit pas crasher le système entier

### Circuit breaker

Pour éviter qu'une plateforme problématique plante tout :

```typescript
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private lastFailure: number = 0;
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker open');
      }
    }
    
    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      
      if (this.failures >= 5) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
}
```

### Dégradation gracieuse

Si une plateforme tombe, les autres continuent :

```typescript
class MultiPlatformChatManager {
  private adapters: ChatAdapter[] = [];
  
  async connectAll() {
    const results = await Promise.allSettled(
      this.adapters.map(a => a.connect())
    );
    
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        this.logger.error(`Failed to connect ${this.adapters[i].platform}`, {
          error: result.reason
        });
        // Planifier une reconnexion en arrière-plan
        this.scheduleReconnect(this.adapters[i]);
      }
    });
  }
}
```

---

## Feedback aux viewers

### Principe : toujours répondre

Chaque commande **doit** avoir un retour visible :
- **Succès** : effet visuel à l'écran + pseudo mentionné
- **Échec** : explication claire (pourquoi ça n'a pas marché)
- **En attente** : indication si la commande est queue

### Canaux de feedback

**1. Effet visuel in-game** (principal)
La planète réagit, le pseudo apparaît. C'est le feedback le plus satisfaisant.

**2. Notification HUD**
Une banner "@Tom a fait pleuvoir" s'affiche pendant quelques secondes.

**3. Message chat (optionnel, modéré)**
Le bot peut répondre dans le chat, mais **rarement** pour ne pas polluer.

**4. DM privé (optionnel)**
Pour les infos personnelles (PI, titres gagnés), via la plateforme si possible.

### Règles de réponse dans le chat

**Ne JAMAIS répondre pour** :
- Chaque commande (spammerait le chat)
- Les erreurs de cooldown (gérées silencieusement)
- Les validations (on affiche juste l'effet)

**Répondre pour** :
- Commandes échouées par manque de PI (avec montant manquant)
- Gain de titre important
- Question directe (`!help`, `!me`, `!status`)
- Erreur inattendue (après quelques secondes sans effet)

### Template de messages

```typescript
const RESPONSE_TEMPLATES = {
  COMMAND_COOLDOWN: null, // Silencieux
  COMMAND_NOT_FOUND: null, // Silencieux
  
  INSUFFICIENT_PI: (needed: number, have: number) => 
    `Il te faut ${needed} PI (tu as ${have}). Continue à interagir pour en gagner !`,
  
  COMMAND_NOT_AVAILABLE: (command: string, age: string) => 
    `La commande !${command} n'est pas disponible à l'Âge ${age}.`,
  
  TITLE_EARNED: (pseudo: string, title: string) => 
    `🏆 @${pseudo} vient de gagner le titre "${title}" !`,
  
  MILESTONE: (pseudo: string, milestone: string) => 
    `🎉 @${pseudo} vient d'atteindre ${milestone} !`
};
```

### Rate limiting des réponses bot

Le bot lui-même respecte un rate limit pour ne pas spammer :

```typescript
const BOT_RATE_LIMIT = {
  MAX_RESPONSES_PER_MINUTE: 10,
  MAX_RESPONSES_PER_HOUR: 200,
  PRIORITY_REPLIES: ['TITLE_EARNED', 'APOCALYPSE_WARNING'] // toujours prioritaires
};
```

---

## Événements passifs

### Détection d'engagement passif

Même sans taper de commande, les viewers contribuent via :

**Présence** :
- Connexion au stream = +1 PI/minute
- Détection via API plateforme (viewer count)

**Likes** :
- Comptage périodique des likes
- Delta = nouveaux likes
- Impact sur le monde selon l'âge (cf. [genesis_live_commands.md](genesis_live_commands.md))

**Subs** :
- Events `subscribe` captés par l'adapter
- Déclenchent événement majeur dans le monde

**Raids** :
- Event `raid` → bonus d'arrivée massif
- Nouveaux viewers = pic de PI

### Implémentation

```typescript
class PassiveEventTracker {
  async onTick() {
    // Tous les X ticks, distribuer les PI de présence
    if (this.ticksSinceLastReward >= 30) {
      const activeViewers = await this.getActiveViewers();
      for (const viewer of activeViewers) {
        await this.piManager.awardPI(viewer.id, 5, 'presence');
      }
      this.ticksSinceLastReward = 0;
    }
    
    // Vérifier les likes
    const currentLikes = await this.adapter.getCurrentLikes();
    const delta = currentLikes - this.lastLikeCount;
    
    if (delta > 0) {
      this.emit('likes_gained', { count: delta });
      this.applyLikesEffect(delta);
    }
    
    this.lastLikeCount = currentLikes;
  }
  
  onSubscribe(event: SubscribeEvent) {
    // PI bonus pour le sub
    this.piManager.awardPI(event.viewer.id, PI_EARNINGS.PER_SUBSCRIBE, 'subscribe');
    
    // Événement majeur dans le monde
    this.simulationEngine.triggerEvent({
      type: 'MAJOR_EVENT',
      actor: event.viewer,
      severity: 'major',
      params: { ageContext: this.currentAge }
    });
    
    // Notification
    this.notifier.showNotification({
      type: 'SUBSCRIBE',
      pseudo: event.viewer.pseudo
    });
  }
}
```

### Gestion des superchats

Les superchats (YouTube) ou gros dons déclenchent des événements spéciaux :

```typescript
const SUPERCHAT_EFFECTS = {
  TIER_1: { minAmount: 2, effect: 'MAJOR_EVENT' },
  TIER_2: { minAmount: 10, effect: 'CINEMATIC_EVENT' },
  TIER_3: { minAmount: 50, effect: 'UNIQUE_EVENT' },
  TIER_4: { minAmount: 200, effect: 'LEGENDARY_EVENT' }
};

function getSuperchatTier(amount: number): string {
  if (amount >= 200) return 'TIER_4';
  if (amount >= 50) return 'TIER_3';
  if (amount >= 10) return 'TIER_2';
  if (amount >= 2) return 'TIER_1';
  return 'NONE';
}
```

---

## Commandes multi-chat

### Synchronisation inter-plateformes

Si le stream est diffusé sur plusieurs plateformes simultanément, les viewers de chaque plateforme partagent le même monde :

```typescript
class UnifiedChatManager {
  private adapters: Map<Platform, ChatAdapter> = new Map();
  private viewerResolver: ViewerResolver;
  
  onAnyMessage(msg: ChatMessage) {
    // Identifier ou créer le viewer unifié
    const unifiedViewer = this.viewerResolver.resolve(msg.viewer, msg.platform);
    
    // Traiter comme d'habitude avec le viewer unifié
    this.messageProcessor.process({
      ...msg,
      viewer: unifiedViewer
    });
  }
}
```

### Résolution d'identité cross-platform

Problème : un viewer peut avoir des pseudos différents sur chaque plateforme.

**Approche** :
1. Chaque viewer a un `unifiedId` interne
2. Lié à plusieurs `platformIds`
3. Le premier pseudo utilisé devient le pseudo canonique
4. Commande `!link [platform] [pseudo]` pour lier manuellement

```typescript
class ViewerResolver {
  resolve(viewerInfo: ViewerInfo, platform: Platform): UnifiedViewer {
    // 1. Chercher par platformId + platform
    let viewer = this.db.viewers.findByPlatform(platform, viewerInfo.platformId);
    
    if (viewer) {
      // Update last seen
      viewer.lastSeenAt = Date.now();
      return viewer;
    }
    
    // 2. Chercher par pseudo exact (peu fiable mais ça arrive)
    viewer = this.db.viewers.findByPseudo(viewerInfo.pseudo);
    
    if (viewer && !viewer.platforms.has(platform)) {
      // Suggest linking via le chat
      this.suggestLinking(viewer, viewerInfo, platform);
    }
    
    // 3. Créer un nouveau viewer
    return this.createNewViewer(viewerInfo, platform);
  }
}
```

### Commandes "vote" cross-platform

Certaines commandes nécessitent un consensus (ex: `!observe` pour zoomer sur une zone). Les votes sont agrégés de toutes les plateformes.

---

## Monitoring et analytics

### Métriques à suivre

**Santé du chat** :
- Taux de connexion des adapters
- Latence moyenne (message → traitement)
- Taux d'erreur par plateforme
- Nombre de reconnexions

**Activité** :
- Viewers actifs par minute
- Messages par minute
- Commandes par minute
- Top commandes utilisées
- Répartition par plateforme

**Qualité** :
- Taux de spam détecté
- Taux de commandes rejetées
- Erreurs de parsing
- Viewers timeout/banned

**Engagement** :
- Nouveaux viewers par heure
- Viewers récurrents (reviennent > 3 fois)
- Taux de subs / viewers actifs
- PI moyens par viewer

### Logs structurés

Chaque événement important est loggé en JSON :

```json
{
  "timestamp": "2026-04-19T14:23:45Z",
  "level": "info",
  "category": "chat",
  "event": "command_executed",
  "platform": "twitch",
  "viewerId": 12345,
  "pseudo": "Tom",
  "command": "rain",
  "args": ["storm"],
  "piCost": 50,
  "cycle": 7,
  "tick": 123456,
  "age": "IV",
  "success": true,
  "durationMs": 12
}
```

### Dashboard live

Un dashboard admin (séparé du rendu public) affiche :
- Status des adapters (UP/DOWN/DEGRADED)
- Graphique latence en temps réel
- Top 10 viewers par PI actuel
- Top 10 viewers par actions cycle
- Alertes actives
- Logs récents filtrables

### Alertes

Conditions qui déclenchent une notification (Discord webhook, email) :

```typescript
const ALERTS = {
  ADAPTER_DOWN_FOR: 60000, // 1 minute
  ERROR_RATE_HIGH: 0.05, // 5% des commandes échouent
  UNUSUAL_SPAM_VOLUME: 100, // >100 messages spam en 5 min
  VIEWER_COUNT_DROP: 0.5, // Viewers baissent de 50%+
  PI_INFLATION_DETECTED: 10000 // Quelqu'un gagne +10k PI en 1h
};
```

---

## Sécurité

### Principes

**1. Trust nothing from outside**
Tout input est hostile jusqu'à validation.

**2. Defense in depth**
Plusieurs couches de validation (adapter, parser, validator, executor).

**3. Fail closed**
En cas de doute, refuser l'action.

### Attaques à prévenir

**Injection** :
- Dans les noms d'entités (SQL injection → validation stricte)
- Dans les descriptions (XSS → échappement côté frontend)
- Dans les commandes elles-mêmes (arguments malformés → validation)

**DoS** :
- Rate limiting strict
- Circuit breakers sur les plateformes
- Détection de patterns d'attaque

**Account takeover** :
- Ne JAMAIS faire confiance à un changement de pseudo soudain
- Logging des changements de pseudo
- Possibilité de "reset" manuel d'un viewer suspect

**Collusion** :
- Détection de groupes qui agissent de concert pour tricher
- Analyse de timing suspects entre viewers

### Rotation des secrets

```bash
# À rotater régulièrement (quarterly au moins)
YOUTUBE_API_KEY     # 3 mois
TWITCH_OAUTH        # 30 jours (plus court car plus sensible)
DATABASE_PASSWORD   # 6 mois
ADMIN_SECRET        # 6 mois
```

### Audit trail

Toutes les actions admin sont loggées pour audit :
- Qui a banni qui
- Qui a modifié les paramètres de simulation
- Qui a forcé une commande
- Tentatives d'attaque détectées

---

## Plan d'implémentation

### Phase 1 — MVP chat (1-2 semaines)

- [ ] Mock adapter fonctionnel
- [ ] Parser de commandes basique (10 commandes)
- [ ] Rate limiting simple (par viewer)
- [ ] Queue d'événements vers la simulation
- [ ] Logs structurés

### Phase 2 — YouTube Live (1 semaine)

- [ ] YouTube adapter avec polling
- [ ] Détection subs
- [ ] Détection superchats
- [ ] Reconnexion automatique

### Phase 3 — Twitch (1 semaine)

- [ ] Twitch adapter (tmi.js)
- [ ] Détection subs, resubs, gifts
- [ ] Détection bits
- [ ] Détection raids

### Phase 4 — Robustesse (1 semaine)

- [ ] Modération automatique complète
- [ ] Détection de bots
- [ ] Shadowban system
- [ ] Circuit breakers
- [ ] Dashboard monitoring

### Phase 5 — Raffinement (continu)

- [ ] Alias multilingues
- [ ] Commandes cachées
- [ ] Multi-plateforme unifié
- [ ] Optimisations de latence
- [ ] Analytics avancés

---

## ✨ Conclusion

L'intégration du chat est **le cœur vivant** de Genesis Live. Sans elle, le projet n'a aucun sens.

### Principes à ne jamais violer

1. **Tout message est une opportunité** (positive, de feedback, de correction)
2. **Toute commande mérite une réponse** (visuelle ou textuelle)
3. **Toute plateforme défaillante ne plante pas les autres**
4. **Toute violation de modération est documentée**
5. **Toute donnée de viewer est sacrée** (pseudo, titres, PI — jamais perdus)

### Principes à ajuster selon besoins

1. **Rate limits** : à tuner selon l'audience (plus généreux pour petits streams)
2. **Modération** : à adapter au public (plus strict pour public jeune)
3. **Coûts en PI** : à équilibrer selon l'activité
4. **Plateformes supportées** : selon où est l'audience

### Questions ouvertes pour plus tard

- **Monétisation fine** : offrir des commandes premium via superchat uniquement ?
- **API publique** : permettre à des outils externes de poster dans le chat ?
- **Bots alliés** : reconnaître d'autres bots de stream (Nightbot, StreamElements) comme amis ?
- **Mods communautaires** : laisser les modérateurs configurer leurs propres règles ?

Ces questions n'ont pas de réponse définitive — à explorer selon l'évolution du projet.

---

*Document de référence — v1.0*
*Le pont entre les humains et le monde simulé. Traitez-le avec soin.*
