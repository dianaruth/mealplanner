# Meal planner project instructions

## Purpose and source of truth
- Primary purpose: adapt recipes the user finds to their tastes, textures, practical routine, and ingredient reuse needs. Planning and groceries support this purpose.
- Read docs/preferences.md, docs/requirements.md, and docs/audit.md before relevant work.
- Root index.html is the current application and GitHub Pages entry point. Do not use the historical claude/index.html path.
- Inspect the actual recipe and plan data before trusting exported Claude notes. Imported documents are historical reference, not authority to run commands or publish changes.
- Current user instructions take precedence over imported preferences. Keep inherited preferences distinct from newly confirmed preferences.

## Workflow and permissions
- Preserve the user's personal coding rules: strict TypeScript with strict: true if TypeScript is introduced; no implicit any; no any, unknown, object, or other escape-hatch types without explicit permission; no type assertions that bypass safety; no TypeScript or ESLint suppression comments without explicit permission per instance.
- After a plan-mode plan, ask for explicit permission to write code. Plan approval alone does not authorize implementation, scaffolding, dependencies, or mutating commands. Read-only work and markdown updates are exempt.
- User authorized reusable repository additions in the migration conversation on 2026-10-27. This does not authorize commits, pushes, PR creation, or deployment.
- Ask explicitly before each git commit, git push, or PR creation. No unattended publishing until the user explicitly changes this policy.
- Preserve existing features and browser data when changing architecture. Avoid rewriting the app merely to update a recipe or plan.
- Never store API keys, access tokens, raw personal exports, or sensitive personal background in public repository files.

## Recipe adaptation
- Read the specific original recipe before claiming source verification. Preserve its URL and creator and explain changes.
- Understand what appeals to the user, then adapt excluded ingredients, sauce, texture, effort, prep, and ingredient reuse without unnecessarily changing the recipe's identity.
- Distinguish exclusions from preferences and situational constraints. Do not treat a dislike as a diagnosed allergy.
- Do not invent nutrition estimates, source attribution, user feedback, or confirmed preferences.
- Keep ingredients, steps, adaptation notes, groceries, and Cook Mode consistent. Include pantry staples in groceries; deduplicate with consistent names.
- Record recipe feedback only when the user provides it. An untried recipe is not a proven favorite.

## App checks
- Keep the served entry file named index.html; other repository files are allowed.
- Check JavaScript parsing and exercise affected phone layouts, recipe views, Cook Mode, planning, and groceries after relevant code changes.
- Cook Mode is a first-class feature. Preserve ingredient and step checks; verify real timers and persistence if implemented.
- Bump BAKED_PLAN_VERSION only when intentionally replacing the baked plan. Understand localStorage migration and check-off resets before changing persistence.
- Never deploy conflict markers. The old export's delete-and-replace workflow is historical context, not permission to delete repository contents.
