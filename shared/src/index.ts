export type Platform = "youtube" | "twitch" | "kick" | "discord" | "mock";

export type AgeId = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII";

export interface ChatMessage {
  id: string;
  platform: Platform;
  receivedAt: number;
  viewer: ViewerInfo;
  text: string;
}

export interface ViewerInfo {
  platformId: string;
  pseudo: string;
  isSubscriber: boolean;
  isModerator: boolean;
  isBroadcaster: boolean;
}

export interface TickEvent {
  tick: number;
  cycle: number;
  age: AgeId;
  type: string;
  actor: string;
  description: string;
}
