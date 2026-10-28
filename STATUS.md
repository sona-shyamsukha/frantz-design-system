# Status — Frantz portal prototype

Updated 28.10.2026.

## In progress
- Branch `atelier/review` (committed, not pushed): baseline review. Report: `atelier/05-checks/report.html`.
- Branch `atelier/fixes` (committed, not pushed): the changes Sona approved on 28.10. Tour opens only from «Vis meg rundt». Ny kampanje fills in Frantz's suggestion, sorts finished ads, shows «Slik går det videre». Bestilt has one status card and a missing-ads banner. The report compares with the customer's last campaign. «dere» everywhere. All 50 tests pass.

## Waiting on Sona
1. The suggested budget for Sykepleier Kristiansand is kr 37 000. Users said 8–12k is normal. Lower the suggestion? yes / no
2. The report funnel has 6 steps but is drawn for 4. Redraw it? yes / no
3. Push both branches and deploy a Vercel preview? yes / no

## Questions for Frantz (Tuesday 3.11)
1. How do customers change job details after ordering today: the Pixel page, or «Forespør endringer»?
2. Do customers use their own tracking links («Vis annonselenker») for ads outside Frantz?
3. Customers without an integration: how often do they need the tracking code before they order?

## Next
- Presentation for the client on Tuesday 3.11.

## Decisions
- 28.10: `sporingskode-guide` and `tabell-justering` are merged into `main` (PR 19, PR 20).
- 28.10: `tabell-tekst` is merged into `main` (PR 21). One text size in every table cell.
- 28.10: Change 2 («Kontakt rådgiver» to a named advisor) is not important. Dropped.
- 28.10: Change 6 (language choice) is fixed in the real product, not in the prototype.
- 28.10: Connect detail page removed. Audience category and ISCO belong in the admin version only.
- 28.10: Interest confirmation captures both email and phone by default. No setting for customers.
- 28.10: Copy controls use one shared design everywhere: code font, one bordered box, copy icon inside.
