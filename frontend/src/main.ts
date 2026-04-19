import type { AgeId } from "@genesis-live/shared";

const currentAge: AgeId = "I";

const app = document.querySelector<HTMLDivElement>("#app");
if (app) {
  app.innerHTML = `
    <div>
      <h1>🌍 Genesis Live</h1>
      <p class="subtitle">Âge ${currentAge} — Le Feu</p>
      <p class="subtitle">La planète est une larme de métal en fusion dans l'obscurité du vide.</p>
    </div>
  `;
}
