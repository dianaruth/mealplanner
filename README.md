# Meal planner

A personal, phone-friendly recipe collection and meal planner served from root `index.html` on GitHub Pages.

## Project context

- `AGENTS.md`: reusable instructions for Codex work in this repository.
- `docs/preferences.md`: preference baseline, confirmation status, and recipe adaptation guidance.
- `docs/requirements.md`: intended recipe, cooking, UI, and automation experience.
- `docs/audit.md`: initial findings from the existing application and Claude export.

The existing app remains unchanged during this documentation import. Open `index.html` to use it; the current app has no build step.

## Working with Codex

Open this repository as the Codex project so its instructions and files are available together. Ask for an audit, describe a change, or share a recipe URL and what appeals to you. Review any proposed implementation and explicitly authorize code work when required by your workflow. Commits, pushes, and PR creation each require explicit permission.

## Publishing

Keep `index.html` as the entry page. Additional files may be accessible through the repository or published site depending on GitHub Pages configuration; do not put secrets or sensitive personal exports here. Remote recipe processing and authenticated repository updates require a separately designed execution path. They are not implemented yet.

## Redesign implementation (2026-11-16)

A first working redesign is now implemented; the earlier migration-only status above is historical. See `IMPLEMENTATION.md` for implemented features, verification, limitations and build instructions.

Publish root `index.html` together with `assets/kitchen.css` and `assets/kitchen.js`. New behavior is maintained in strict TypeScript (`src/kitchen.ts`); generated assets are committed for buildless GitHub Pages serving. The remote adaptation and publishing service is not connected yet.
