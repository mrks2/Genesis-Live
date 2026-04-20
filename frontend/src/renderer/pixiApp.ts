import * as PIXI from "pixi.js";

export const LOGICAL_WIDTH = 640;
export const LOGICAL_HEIGHT = 360;

// Pixi v7.1+ : settings.SCALE_MODE est déprécié au profit de BaseTexture.defaultOptions.scaleMode.
// settings.ROUND_PIXELS reste l'API recommandée en v7.4 (toujours utilisé en interne).
PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

export function createPixiApp(parent: HTMLElement): PIXI.Application {
  const app = new PIXI.Application({
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    antialias: false,
    backgroundAlpha: 0,
    powerPreference: "high-performance",
    resolution: 1,
    autoDensity: false,
  });

  const canvas = app.view as HTMLCanvasElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.objectFit = "contain";
  canvas.style.imageRendering = "pixelated";
  parent.appendChild(canvas);

  return app;
}
