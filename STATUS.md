# Status — Frantz portal prototype

Updated 28.10.2026.

## In progress
- Branch `sporingskode-guide` (not merged to `main` yet):
  - New page under Ressurser: `portal/sporingskode.html` («Slik legger dere inn sporingskoden»).
  - «Stillinger» table: Stilling (with campaign name when it exists), Arbeidsgiver, Periode, Sporingskode (copy), Status.
  - One shared copy field for the whole portal (`.copy-field`).
  - The Connect detail page (`portal/connect-detalj.html`) is removed.

## Waiting on Sona
1. Merge `sporingskode-guide` into `main`? yes / changes

## Questions for Frantz (Tuesday 3.11)
1. How do customers change job details after ordering today: the Pixel page, or «Forespør endringer»?
2. Do customers use their own tracking links («Vis annonselenker») for ads outside Frantz?
3. Customers without an integration: how often do they need the tracking code before they order?

## Next
- Presentation for the client on Tuesday 3.11.

## Decisions
- 28.10: Change 2 («Kontakt rådgiver» to a named advisor) is not important. Dropped.
- 28.10: Change 6 (language choice) is fixed in the real product, not in the prototype.
- 28.10: Connect detail page removed. Audience category and ISCO belong in the admin version only.
- 28.10: Interest confirmation captures both email and phone by default. No setting for customers.
- 28.10: Copy controls use one shared design everywhere: code font, one bordered box, copy icon inside.
