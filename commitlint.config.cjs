/**
 * Commitlint config — Conventional Commits
 * Cohérent avec README.md § Workflow Git.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // nouvelle fonctionnalité
        "fix",      // correction de bug
        "docs",     // documentation seule
        "refactor", // refactoring sans changement de comportement
        "chore",    // outillage, config, deps
        "test",     // ajout / modif de tests
        "perf",     // amélioration de perf
        "ci",       // CI / GitHub Actions
        "build",    // système de build, deps
        "revert",   // revert d'un commit précédent
        "style"     // formatage, point-virgules, etc. (pas de changement fonctionnel)
      ]
    ],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "header-max-length": [2, "always", 100],
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"]
  }
};
