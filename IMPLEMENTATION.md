# Kitchen redesign: first working version

## Serving and building

Root `index.html` remains the GitHub Pages entry point. Publish `assets/kitchen.css` and `assets/kitchen.js` alongside it; uploading index.html alone is no longer sufficient. The existing single-file recipe data and planning functionality are preserved. New functionality is authored in strict TypeScript in `src/kitchen.ts`, compiled to the included browser asset.

Install development dependencies with `npm install`, run `npm run typecheck`, then `npm run build` after source changes. GitHub Pages serves the published assets and needs no server-side build. Never edit the generated assets/kitchen.js directly.

The visual direction is bright and playful: buttery yellow, tomato accents, fresh green, lilac, rounded surfaces, readable type, and responsive layouts. Nutrition calculations and original source verification are not introduced by this UI change.

## Working features

- Kitchen, Plan, Shop, Recipes, and For you navigation.
- Searchable recipe collection and two Japanese barbecue meal templates (chicken or salmon). These are the user's own go-to meal, not externally sourced recipes.
- A plan form with date range, ingredients to use, barbecue protein and vegetable choice, next-day bowl leftovers, weekend meal choices, and a preview before replacing the browser's current plan.
- Plan drafts use a deterministic ingredient-overlap heuristic over existing recipes. They do not interpret arbitrary requests or enforce new free-text preferences automatically. Review before applying, especially after changing preferences. Meal-specific skip controls remain available after saving.
- Cook Mode: native ingredient buttons, step checks, per-recipe saved progress, countdown timers with pause/reset, timer recovery after reload, keyboard focus containment, and optional screen wake lock where supported.
- Editable preference entries and a recipe/video request inbox. A request carries the current preferences when copied for adaptation in chat.
- Browser-data backup download.

## Browser storage and migration

Existing `meal*` keys and baked-plan version are preserved. New preference, inbox, timer, and cooking-progress keys use the `kitchen.` prefix. No remote storage is enabled. Preferences and requests stay in the browser where entered; they do not automatically update repository markdown or another device.

Applying a reviewed plan intentionally replaces the browser's current plan and resets grocery checks. The barbecue variant's selected vegetable is saved with the template in browser custom recipes. Download a backup before substantial changes. Backup restore/import is not implemented yet.

Timers calculate remaining time from an end timestamp, so they recover after backgrounding or reload. They show completion in the open page. Background sound, push notifications, and operating-system alarms are not provided. Wake lock can be unavailable or released by the browser or operating system.

## Remote processing still to connect

The recipe inbox saves links and notes and can copy a request to chat. It does not fetch recipes, watch videos, run AI adaptations, submit data to a backend, or publish changes. The form states this explicitly.

Complete the remote workflow by choosing an authenticated execution service and credentials strategy, then implementing source retrieval, validated structured adaptations, review, and approved repository updates. Keep tokens out of the published app. Explicit permission for each commit/push/PR remains required; unattended publishing has not been authorized. No GitHub Actions workflow is activated by these changes.

The original recipe audit still applies: source links, ingredient/grocery consistency, storage instructions, nutrition estimates, and recipe-specific preference fixes need a separate verified pass. The existing shopping list is a checklist, not a package-quantity calculator; plan drafts do not calculate exact grocery amounts or a freezer schedule.

## Verification

Strict TypeScript compilation and browser interaction checks cover preference and request persistence, plan preview/apply, barbecue groceries and next-day lunch, Cook Mode checks/timers across reload, recipe search, existing storage retention, and viewport overflow at phone/tablet/desktop widths. Desktop browser emulation does not replace testing on the user's iPhone before publication.

## Verification performed

- Strict TypeScript compilation and generated JavaScript syntax check passed.
- Browser checks at 375, 390, 768, and 1440 CSS pixels found no horizontal page overflow on the tested shopping view; recipes and Cook Mode were additionally exercised at phone width.
- Preference and recipe-request persistence, recipe search, plan preview/save, barbecue dinner and next-day lunch, selected vegetable/sauce groceries, saved cooking checks, timer reload recovery, completion, restart, and pause were exercised.
- A separate browser context confirmed existing custom recipes, plan dates, and grocery checks survive the UI update.
- Invalid date order and modified draft inputs prevented applying a stale or invalid preview.
- Browser page-error collection reported no JavaScript exceptions during these flows.
- Tests used a local Chromium browser, not a physical iPhone. Background timer sounds/notifications are not implemented; elapsed time recovers when the page resumes. Original recipe sources, all grocery completeness issues, and remote processing remain follow-up work.

## Visual revision after user review

The user replaced the initial bright palette with muted lavender and slate. Promotional headings and benefit cards were removed; the home header is now simply Meal planner, with New plan and Add a recipe actions. Settings are labeled Preferences. This supersedes the original visual-direction paragraph above.

## Inventory-aware plan for November 17-20, 2026

The baked plan is now 2026-11-16-v1. See docs/plans/2026-11-17-through-20.md for the plan, complete grocery quantities, and thaw/prep schedule. preparedMeals counts remove already-prepared meal occurrences from groceries; stockedItems excludes items confirmed on hand for this plan. Bowl protein cuts, vegetables, and serving counts can be supplied by plan metadata. Date-specific prep reminders avoid prompting preparation of lunches already made. These fields are plan-specific; generated future drafts do not inherit this inventory. The app shopping view is an item checklist; detailed quantities are in the saved plan document.
