# Initial audit

Reviewed on 2026-10-27: repository root index.html, pasted project instructions, and meal-planning-export.zip. Read-only inspection; recipe source pages and live deployment were not verified. Findings describe the inspected local file, not necessarily the currently deployed site or browser-stored custom data.

## Baseline
- 21 built-in recipes: 4 breakfasts, 7 lunches, 10 dinners.
- Current baked plan version: 2026-10-27-v1; window 2026-10-28 through 2026-11-01.
- l7, l8, d9, d10, and d11 are already present. Export notes saying to add them are stale.
- Root index.html is authoritative for the inspected app. Historical claude/index.html references are stale.

## Recipe findings
- l6 Caesar pasta salad uses homemade dressing despite the inherited store-bought shortcut. Dressing is mixed into the salad before storage; keeping it separate would better support crunchy lunches.
- l7 lemon-tahini quinoa salad makes its dressing from scratch. Its chickpea/spinach version differs substantially from the export's corn/edamame/cucumber/pistachio version without a complete adaptation history. Source is unverified.
- l8 smoky corn salad uses unspecified mild taco seasoning despite excluded spices. It differs from export notes, including mayonnaise versus Greek yogurt. The three-to-four-day storage text conflicts with the inherited two-day routine.
- d4 teriyaki chicken uses homemade sauce despite the inherited premade preference. d6 also makes its glaze from scratch.
- d10 crispy rice salmon salad advertises about four days refrigerated, conflicts with the inherited routine, and lacks separate-storage guidance to preserve crispness.
- Several recipe URLs point to creator homepages rather than exact recipes: l4, l5, l6, l7, d3. b4, b6, b7, d7 have placeholder links and should not be represented as verified sourced recipes.
- Numerical protein/fiber estimates lack documented calculation basis. Recipe yield is not represented consistently; verify before relying on estimates or shopping calculations.

## Grocery findings
- Grocery entries are maintained separately from cooking ingredients and omit required ingredients in multiple recipes. For example l3 omits soy sauce, cornstarch, garlic, honey, and cooking oil from its own grocery list.
- Greek yogurt and Greek yogurt (large tub) are distinct deduplication keys.
- Optional ingredients and alternative choices are not represented consistently in groceries.
- derivedGroceryList collects unique meal IDs, then deduplicates exact item names. It does not aggregate quantities across repeated meals.
- Grocery notes include fixed instructions such as buy two salmon fillets and freeze until Friday that may not fit a custom plan.

## App and workflow findings
- Cook Mode renders timerSeconds as a text time estimate; there are no countdown controls in the inspected Cook Mode code.
- The add-recipe form stores metadata with empty ingredients, steps, and grocery arrays. It does not retrieve or adapt a submitted URL.
- User preferences are not represented as an explicit adaptable profile in the inspected app.
- buildPlan automatically skips weekend lunches, conflicting with the exported instruction to ask about weekends individually.
- Week patterns and week-specific recipe restrictions are too rigid for the newly stated recipe-first direction.
- Export claims about PWA behavior, live site state, and deployment configuration still need verification.

## Next review
- Confirm preference exceptions and retire outdated assumptions.
- Verify exact source recipes when adapting each one; preserve original and adapted versions with explained changes.
- Review every recipe for texture, practical shortcuts, ingredient reuse, yield consistency, and complete groceries.
- Define Cook Mode acceptance criteria and mobile design before implementation.
- Decide the remote form, execution environment, and publishing approval policy.
