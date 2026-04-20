import * as PIXI from "pixi.js";

import type { AgeId } from "@genesis-live/shared";

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./pixiApp.js";

// Une couleur dominante par âge tirée de color_palette.md. Placeholder Phase 1 :
// remplacé par les textures planet_base_age*.png et leurs animations en Phase 5.
export const AGE_PLACEHOLDER_COLORS: Record<AgeId, number> = {
  I: 0xd46b3d, // ember — planète en fusion
  II: 0x2b5f8a, // ocean — océans naissants
  III: 0x7fe8a8, // mystic-green — vie microbienne
  IV: 0x6b9b4f, // grass — foisonnement biologique
  V: 0x8b5a2b, // clay — tribus terriennes
  VI: 0xc89b6f, // sand — civilisations
  VII: 0x1a0f2e, // night-purple — vide cosmique
};

const PLANET_RADIUS = 130; // pixels logiques (render_spec.md : 120-140)
const BREATH_PERIOD_MS = 3000; // un cycle 0.98 → 1.02 → 0.98 toutes les 3 s
const BREATH_AMPLITUDE = 0.02; // ±0.02 autour de 1.0

export interface PlaceholderPlanet {
  setAge(age: AgeId): void;
  destroy(): void;
}

export function createPlaceholderPlanet(
  app: PIXI.Application,
  initialAge: AgeId = "I",
): PlaceholderPlanet {
  let currentAge: AgeId = initialAge;

  const graphics = new PIXI.Graphics();
  graphics.x = LOGICAL_WIDTH / 2;
  graphics.y = LOGICAL_HEIGHT / 2;

  const redraw = (): void => {
    graphics.clear();
    graphics.beginFill(AGE_PLACEHOLDER_COLORS[currentAge]);
    graphics.drawCircle(0, 0, PLANET_RADIUS);
    graphics.endFill();
  };
  redraw();
  app.stage.addChild(graphics);

  let elapsedMs = 0;
  const tickerHandler = (_dt: number): void => {
    elapsedMs = (elapsedMs + app.ticker.deltaMS) % BREATH_PERIOD_MS;
    const phase = (elapsedMs / BREATH_PERIOD_MS) * Math.PI * 2;
    const scale = 1 + Math.sin(phase) * BREATH_AMPLITUDE;
    graphics.scale.set(scale);
  };
  app.ticker.add(tickerHandler);

  return {
    setAge(age) {
      currentAge = age;
      redraw();
    },
    destroy() {
      app.ticker.remove(tickerHandler);
      graphics.destroy();
    },
  };
}
