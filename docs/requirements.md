# Product requirements

Captured 2026-10-27. These are goals and proposals, not implemented features or approval to publish.

## Primary experience
- Adapt a recipe URL or idea using saved preferences with minimal repeated input.
- Preserve the original recipe, explain the user's version, and retain feedback over time.
- Use recipe adaptations as the foundation for optional plans and comprehensive groceries.
- Optimize ingredient reuse for one person: package practicality, perishability, overlap, freezing, and appealing follow-up uses.

## Phone UI and Cook Mode
- Redesign the mobile interface with clearer navigation, readable typography, good contrast, accessible controls, and generous touch targets.
- Make recipes, planning, and cooking easy to reach. Final navigation and visual direction require design review.
- Cook Mode is essential: easy-to-read ingredients and steps, ingredient and step checks, actual countdown timers, and recoverable progress are proposed priorities.
- Preserve crisp textures with specific packing and assembly instructions.
- Consider screen wake lock with graceful fallback and timer recovery when the browser backgrounds. Do not promise background alarms without verifying phone browser behavior.
- Preserve existing recipes, custom recipes, plans, grocery checks, and browser state through a documented migration.

## Low-input form and remote routine
- A short phone-friendly form should accept a recipe page or video URL with optional desired changes. Reuse saved preferences; avoid manual transcription when accessible source details can be retrieved.
- For video sources, use accessible captions, descriptions, and recipe links where available. If required details are missing, ask only for those details; do not invent quantities or claim to have watched inaccessible content.
- Consider feedback and planning requests through the same entry path.
- Proposed processing: retrieve source, adapt, check consistency, preview, approve, save, publish.
- Keep root index.html as the GitHub Pages entry point. Additional source, data, tooling, and docs are acceptable.
- Select the execution approach after reviewing hosting and authentication needs. GitHub Actions and a separate service are candidates, not a decision.
- Keep credentials server-side or in an appropriate secret store; never embed them in the public frontend.
- Remote execution should not depend on the desktop staying awake unless the user explicitly chooses that limitation.

## Approval policy still unresolved
- The user has not answered whether routine updates may publish automatically.
- Existing explicit-per-commit/push/PR permission remains in force.
- Do not activate unattended publishing, create a recurring automation, or deploy based solely on the desire for less manual input.

## Suggested implementation order
1. Finish preferences and recipe audit; review important unresolved choices.
2. Present a concrete mobile UI and Cook Mode proposal.
3. Design reusable recipe data and validate ingredient/step/grocery consistency.
4. Implement approved UI and cooking changes while preserving data.
5. Implement the approved form and remote update path; verify approvals, failures, and deployment.

## Evolving preferences (confirmed 2026-11-16)
- Provide a phone-friendly preference form with add, edit, and remove actions; also support preference updates through conversation.
- Let users express likes, dislikes, exclusions, and contextual needs with explicit exceptions, without repeating the full profile.
- Preview how a preference change affects saved recipes; do not silently rewrite existing recipes.
- Use current confirmed preferences for new recipe adaptations and avoid asking the same questions repeatedly.
- Preference storage and synchronization must be designed as part of the remote workflow; documentation alone does not implement in-app editing or sync.

## Weekday lunch requirements (confirmed 2026-11-16)
- Default to substantial lunches prepared ahead, including enjoyable dinner leftovers, with minimal work at lunchtime.
- Include packing, assembly, and reheating guidance; keep crisp components separate where useful.
- Preserve cold breakfast and quick Tuesday/Thursday dinner preferences.
- Support a confident, fully equipped cook; do not simplify recipes based on assumed lack of skill or equipment.

## First implementation status (2026-11-16)
- Bright playful kitchen visual direction selected by the user.
- Local UI, recipe/video inbox, editable preferences, plan previews, and persistent Cook Mode checks/timers implemented; see IMPLEMENTATION.md.
- Japanese barbecue chicken/salmon meal templates and vegetable selection added, with optional next-day lunch leftovers.
- Recipe/video adaptation and remote publishing remain unconnected. Local plan drafts use recipe overlap rather than AI and need review.

## Meal indicators (confirmed 2026-11-16)
- Use B / L / D for planned breakfast, lunch, and dinner instead of dots whose colors encode meal/protein categories.
- Omit skipped meals and preserve the out-of-home label. Show a short key and accessible full meal labels.
- Calendar entries use the same letters. Meal rows with full written meal labels need no extra colored dot.
- Meal labels also use consistent colors: breakfast amber, lunch sage, dinner lavender. Keep the letters and matching colored key so meaning never depends on color alone.

## Recipe yield (requested 2026-11-16)
- Show an explicit Makes N servings label on recipe cards and in Cook Mode.
- Breakfast recipes are labeled for a single serving; the tzatziki recipe explicitly makes two containers. Barbecue templates cover dinner plus next-day lunch.
- Older recipes without a verified yield display Servings not specified. Do not guess a yield or infer it from nutrition estimates.
- Allow saving a confirmed serving count in Cook Mode. This edits the label only and does not scale ingredients, groceries, or nutrition.
- Browser overrides persist in kitchen.servings.v1 and are included in data backups. Recipe-specific yield verification remains part of the original recipe audit.
