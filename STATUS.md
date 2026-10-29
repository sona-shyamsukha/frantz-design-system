# Status — Frantz portal prototype

Updated 29.10.2026.

## In progress
- Nothing open. `atelier/review` and `atelier/fixes` are merged into `main` (PR 22, 29.10). Before/after page: `atelier/05-checks/endringer-28-10.html`.

## Questions for Frantz (Tuesday 3.11)
1. How do customers change job details after ordering today: the Pixel page, or «Forespør endringer»?
2. Do customers use their own tracking links («Vis annonselenker») for ads outside Frantz?
3. Customers without an integration: how often do they need the tracking code before they order?

## Next
- Presentation for the client on Tuesday 3.11.

## Decisions
- 29.10: `atelier/fixes` (with the review) merged into `main` (PR 22).
- 29.10: Report comparison was too much text in the small cards (Sona). Cards now say only «34 flere enn sist»; «Sist» is explained in one line under the cards.
- 28.10: The report funnel now draws all 6 steps (Sona said yes). The approval hint in Ny kampanje sits under both order buttons.
- 28.10: Suggested budget in Ny kampanje capped at kr 15 000, never below the channel minimum (Sona said yes).
- 28.10: `sporingskode-guide` and `tabell-justering` are merged into `main` (PR 19, PR 20).
- 28.10: `tabell-tekst` is merged into `main` (PR 21). One text size in every table cell.
- 28.10: Change 2 («Kontakt rådgiver» to a named advisor) is not important. Dropped.
- 28.10: Change 6 (language choice) is fixed in the real product, not in the prototype.
- 28.10: Connect detail page removed. Audience category and ISCO belong in the admin version only.
- 28.10: Interest confirmation captures both email and phone by default. No setting for customers.
- 28.10: Copy controls use one shared design everywhere: code font, one bordered box, copy icon inside.
