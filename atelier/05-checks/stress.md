# Stress test: Frantz portal

Date: 28.10.2026. Server: http://localhost:8080. Tool: Playwright (Chromium). All changes were made in the browser only (`page.evaluate`). No project file was edited.

Pages: dashboard (existing and `?bruker=ny`), campaigns, ny-kampanje, kampanje-bestilt (129074), kampanje-under-arbeid, campaign (129041, Aktiv), rapport (128984).

Cases run: long Norwegian compounds in h1, card titles, the top-bar button, a content button, the user name and a table row (90-character title plus a long company name). Long pasted text and an invalid link in ny-kampanje. Empty, invalid and extreme budgets, and an empty campaign name. Invalid email. A search with no results and with one result, and the new-user empty state. 200% zoom (720×450 CSS px at DPR 2). Widths of 320, 390, 720, 1440 and 1920. Reduced motion. Throttled network (400 ms latency, 50 kB/s) with a layout-shift observer.

Overflow sweep (`scrollWidth > innerWidth`) on all 8 pages at 320, 390, 720, 1440 and 1920 with real content: **no page-level horizontal overflow**. The only off-screen element is the closed mobile menu (`aside.rail`), which is intended. All overflow below appears only with long content.

---

## [P1] Campaign and report pages jump around on a slow connection
- Where: campaign.html (Aktiv) and rapport.html, `.cols.campaign-layout` and `.card--les` / `.card--betjen`; mobile and desktop. Also dashboard on mobile.
- What happened: The throttled load measured a Cumulative Layout Shift of **0.91 on mobile and 0.41 on desktop** for both pages, where good is under 0.1. Dashboard on mobile scored 0.20. The large shift happens at DOMContentLoaded: every panel renders stacked, then the scripts at the end of `<body>` hide the inactive tab panels and rearrange the cards. A blocking third-party script (`cdn.jsdelivr.net/npm/topojson-client`) in the middle of the body extends the window in which the wrong layout is visible.
- Why it matters: Task 4 (know what is happening with an order) and task 5 (show the result to the client). On a slow connection, someone who taps or starts reading early loses their place, and numbers jump under their finger.
- Suggested fix: Put `hidden` on the non-default tab panels and the moved cards in the HTML so the first paint already matches the final layout. Load scripts with `defer`, or move them before any content that depends on them. Load topojson with `defer` or only when the map is needed. Reserve height for cards filled by JS, using `min-height` or a skeleton.
- Screenshot: screenshots/stress-treg-aktiv-tidlig-390.png

## [P1] A long user or company name in the top bar spills off screen
- Where: `.topbar__who`, all pages, desktop at 1440.
- What happened: With "Kari Arbeidsmiljøtilsynsrapporteringsplikt-Hansen", the name ran 55 px wider than its box, went past the right edge, and gave every page 23 px of sideways scroll (`scrollWidth` 1463 vs 1440). It also pushes into the bell button.
- Why it matters: Real accounts include long agency and municipality names. Sideways scroll on every page makes the portal look broken to all users.
- Suggested fix: Give `.topbar__who` a `max-width` (for example `16rem`) with `min-width: 0`. Truncate the name with `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`, and put the full name in `title` and in the menu.
- Screenshot: screenshots/stress-lang-dash-1440.png

## [P1] Buttons never wrap, so a long label pushes the page sideways on phones
- Where: `.btn` (shared). Seen on the ny-kampanje primary button, the new-user dashboard CTA (`.btn--accent.btn--lg`), the top-bar "Ny kampanje" button and `.ad-card__action` on kampanje-under-arbeid. Mobile 320 and 390, plus 1440 for the ad card.
- What happened: Labels containing "Arbeidsmiljøtilsynsrapporteringsplikt" stayed on one line. The page widened to 438–489 px at 390, and the ad-card action text spilled past its button (sw 277 vs 203 at 1440).
- Why it matters: Task 1 (order fast). Labels built from data ("Neste: Kampanjen", package and campaign names), and longer translations later, will produce sideways scroll on phones.
- Suggested fix: In the shared `.btn`, use `white-space: normal; overflow-wrap: anywhere; text-align: center; max-width: 100%; min-width: 0`. Keep `nowrap` only on the fixed-label top-bar button, and below 360 px let it show the icon with a visually hidden label.
- Screenshot: screenshots/stress-lang-nyk-390.png, screenshots/stress-lang-ny-390.png

## [P1] Section headings in ny-kampanje do not wrap long words
- Where: ny-kampanje, `.intake-heading` and `.del__tittel`; mobile 320 and 390.
- What happened: A heading with a long compound became 448 px wide inside a 308 px card. It ran out of the card and off the screen. The other headings tested (h1, `.card__title`, `.table__title`) do wrap, because they have `overflow-wrap: anywhere`. These two headings don't.
- Why it matters: Task 1 is the main ordering flow. Section titles that come from the job title will break the form layout on phones.
- Suggested fix: Add `overflow-wrap: anywhere; hyphens: auto;` to `.intake-heading` and `.del__tittel`, or to all h2 and h3 in `#skjema`, and make sure `<html lang="nb">` is set so hyphens work.
- Screenshot: screenshots/stress-lang-nyk-390.png

## [P1] The pasted-text preview cuts long words in the middle
- Where: ny-kampanje summary after "Fyll ut skjemaet", the source excerpt at the top of the summary; mobile.
- What happened: Pasted text containing "Arbeidsmiljøtilsynsrapporteringspliktansvarlig" showed as "…rapporteringspliktans", hard-cut at the card edge with no ellipsis, while the line-clamp ellipsis appears only on the last line.
- Why it matters: Principle 2 (paste, upload, done). The user checks that Frantz read their text, and a word cut in half looks like the text was lost.
- Suggested fix: Add `overflow-wrap: anywhere` to the excerpt element, next to its `-webkit-line-clamp`.
- Screenshot: screenshots/stress-ny-lang-lest-390.png

## [P1] An invalid link is accepted without a warning
- Where: ny-kampanje step 1, `#lenke`; mobile and desktop.
- What happened: "frantz punkt no" was entered as the job-ad link. The field's `validity.valid` is false, but "Fyll ut skjemaet" went straight on to the summary. No error was shown, and the only hint was a generic "Fyll inn arbeidssted, budsjett og kanaler". The user never learns that the link could not be read.
- Why it matters: Task 1 and principle 2. Users who rely on "paste the link, Frantz fills in the rest" end up with an empty order and don't know why.
- Suggested fix: Validate on blur and on submit. Show an inline `.feil` error under the field ("Lenken ser ikke riktig ut. Den må starte med https://"), set `aria-invalid="true"` and `aria-describedby`, and keep the user on step 1. If a valid link cannot be fetched, say that in the summary ("Vi fikk ikke lest lenken").
- Screenshot: screenshots/stress-ny-ugyldig-lenke-390.png

## [P1] The budget field accepts any amount without a check
- Where: ny-kampanje, Kampanjen › Endre dialog, `#budsjett`; mobile and desktop.
- What happened: "5" was saved as kr 5 and "999999999999" as kr 999 999 999 999, both without a warning. "-500" silently became kr 500, and "abc" was silently cleared. No error state appeared for any of them.
- Why it matters: Principle 4 (numbers with meaning) and principle 1 (let Frantz choose). A typo of an extra 0 would be ordered as-is, and the price summary shows the absurd total as fact.
- Suggested fix: Set a minimum (the smallest package price) and a soft maximum. Show inline feedback under the field, such as "Minste budsjett er kr X" or "Det er uvanlig høyt. Stemmer kr 999 999 999 999?". Echo the formatted amount so the user sees what was understood, and tell the user when non-digits are dropped.
- Screenshot: screenshots/stress-ny-budsjett-stort-390.png

## [P2] Clearing the campaign name saves without a message
- Where: ny-kampanje, Kampanjen › Endre dialog, `#ref` (marked `required`); mobile.
- What happened: When the name was emptied, "Lagre endringer" closed the dialog with no error. The summary then shows "Mangler", and focus is not returned to the "Endre" button (`activeElement` is body).
- Why it matters: The order stays blocked with no feedback at the point of the mistake. Keyboard users lose their place.
- Suggested fix: Block saving and show `#ref-feil` in the dialog, or accept it on purpose but return focus to the "Endre" button that opened the dialog.
- Screenshot: screenshots/stress-ny-budsjett-tomt-390.png

## [P2] The email error on the interest list does not look like an error
- Where: campaign.html › Interessenter › "Send listen på e-post"; also rapport.html, via `components/js/interessenter.js`.
- What happened: An empty or invalid address ("kari@", "kari hansen@frantz") shows "Skriv en gyldig e-postadresse." in body text colour, in a `role="status"` element, below the Send button. The field border does not change, and there is no `aria-invalid` and no `aria-describedby`.
- Why it matters: The user may think it was sent. WCAG 3.3.1 needs the error tied to the field.
- Suggested fix: Use the shared `.feil` style (danger colour), put the message right under the input, set `aria-invalid="true"` and `aria-describedby`, and use `role="alert"` for errors only (keep `status` for success).
- Screenshot: screenshots/stress-epost-feil-390.png

## [P2] Search results: the count is silent for screen readers and the grammar is off
- Where: campaigns.html, `#vist-antall` and the pagination.
- What happened: A search with no results shows a good message, but the count has no `aria-live`, so screen readers hear nothing. The pagination still shows page "1" with disabled arrows when there are no results, and one result reads "Viser 1–1 av 1 kampanjer".
- Why it matters: Task 2 (find a campaign again).
- Suggested fix: Add `aria-live="polite"` to `#vist-antall`, hide the pagination when there are 0 results or only 1 page, and use the singular form ("Viser 1 kampanje").
- Screenshot: screenshots/stress-tomt-sok-390.png, screenshots/stress-ett-treff-390.png

## [P2] Help text lines are too long on wide screens
- Where: 1920 px; kampanje-bestilt `.piksel__hjelp`, campaign and rapport `.form-hint` under the results.
- What happened: Lines of 14 px text run about 120 characters, measured at about 850 px wide. The main body text stays within limits.
- Why it matters: Principle 4. The hints that explain the numbers get skipped when lines are this long.
- Suggested fix: Add `max-width: 65ch` to `.form-hint` and `.piksel__hjelp`, or to all `p` inside cards.
- Screenshot: screenshots/stress-1920-aktiv.png

## [P2] Scripted smooth scrolling ignores reduced motion
- Where: about 20 `scrollIntoView({ behavior: 'smooth' })` calls in portal pages and `components/js`, for example the error scroll in the ny-kampanje step handler.
- What happened: The CSS respects `prefers-reduced-motion`: `reset.css` cuts animations and transitions, and 0 running animations were measured on all pages. But JS smooth scrolling does not check the preference, and only `tour.js` does.
- Why it matters: WCAG 2.3.3. Users who are sensitive to motion still get long animated scrolls, for example to error messages.
- Suggested fix: Add a shared helper `rullTil(el)` that uses `behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'`, and replace the direct calls.
- Screenshot: none (code finding).

## [P2] Submitting an empty first step saves an empty draft
- Where: ny-kampanje step 1; mobile and desktop.
- What happened: Clicking "Fyll ut skjemaet" with nothing filled in shows the right error, and focus moves to the section, but the header also changes to "Lagret automatisk kl. 11.00", which suggests an empty draft was saved.
- Why it matters: Empty drafts would clutter the campaign list (task 2).
- Suggested fix: Skip autosave until at least one source field has content.
- Screenshot: screenshots/stress-ny-tom-390.png

---

## Works well
1. **No sideways scroll with real content.** All 8 pages pass at 320, 390, 720 (200% zoom), 1440 and 1920. Nothing was clipped or overlapping at 200% zoom, and the guided tour fits the zoomed viewport.
2. **Long names wrap where it matters most.** Page h1, card titles and campaign-list rows use `overflow-wrap: anywhere`, so a 90-character campaign title and a long company name wrap cleanly in the list, on the campaign page and in the ny-kampanje summary at 320.
3. **Empty and first-step error states exist and are clear.** "Ingen kampanjer passer. Prøv et annet søk, eller nullstill filtrene." comes with a visible "Nullstill". New users get the "Ingen kampanjer ennå" card. An empty ny-kampanje step 1 shows an error box and moves focus to the section, and "Bestill kampanjen" stays disabled with a reason until the order is complete.

Verdict: FAIL
