import type { AgeId } from "@genesis-live/shared";

const BANNER = `
╔═══════════════════════════════════════════════════════════╗
║           🌍  GENESIS LIVE — Backend  🌍                    ║
║                                                             ║
║  Au commencement, il n'y avait que le Chat.                ║
║  Et le Chat dit : que la planète soit.                      ║
╚═══════════════════════════════════════════════════════════╝
`;

function main(): void {
  console.log(BANNER);
  const initialAge: AgeId = "I";
  console.log(`  Âge actuel : ${initialAge} — Le Feu`);
  console.log(`  Tick 0 — la planète est une larme de métal en fusion.`);
}

main();
