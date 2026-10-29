# Persona walkthroughs — Frantz portal (baseline, 28.10.2026)

Method: every task was run in Playwright (Chromium) against http://localhost:8080/portal/. Desktop runs used 1440×900. Ola used an iPhone 13 profile at 390×844 with touch. Sigrid's run used only the keyboard (Tab, Enter, Esc) with reduced motion. axe-core 4 (`@axe-core/playwright`, WCAG 2.0–2.2 A/AA tags) was run on 8 pages. Each run started with a fresh browser context, so the "Vis meg rundt" tour showed on first load.

## Walkthrough logs (short)

**Mari, existing agency advisor.** Pasted a 1 KB strategy into «Skriv øvrig informasjon…» (ref `WN-4471`, period with a pause, 60/40 channel split, 3 finished ads) → «Fyll ut skjemaet» → summary. Stilling, sted, arbeidsgiver, frist, budget and channels parsed correctly. **Period came out as `05.10.2026 – 25.10.2026 · 3 uker`.** Her dates, the pause and the split were gone, and «Materiell» said «Ikke oppgitt». To upload she had to find the third «Endre», choose «Jeg har ferdige annonser», upload, then «Lagre endringer». Then «Bestill kampanjen». That took 6 clicks and about 8 s scripted, and stays under 3 minutes for a person. In «Kampanjer» a search for `WN-4471` found the campaign at once ✔. On the campaign page, «Be om endring» and «Kontakt rådgiver» both open a `mailto:post@frantz.no` draft.

**Hanne, municipal HR.** Entered a Finn link and one sentence. Summary showed «Stilling: Ad html», «Søknadsfrist: 28.10.2026» (her text said 20.11.2026) and «Arbeidsgiver: Ikke oppgitt», although the text said «Lillehammer kommune». Budget and channels were required. «Bruk anbefalt» filled kr 17 000 but ticked no channels, so she had to pick channels herself. Price showed clearly as «Totalt eks. mva. kr 17 000». She sent the plan with «Send planen til godkjenning» → modal → «Send forespørsel», then «Test i prototypen» → «Se e-posten». The manager email reads «…kampanjeplanen for «Ad html»». The approval page needed no login and approving took one click ✔. It showed «Det er ikke lagt ved noe annonsemateriell til denne forespørselen.», so the manager saw **no preview**. Back in the sender tab, status changed to «Godkjent – Planen er godkjent. Bestill kampanjen når dere er klare.» ✔. She ordered, and the campaign page then said «Dette må avklares før oppstart: materiell. Ta kontakt med Frantz.»

**Jonas, new customer.** On `?bruker=ny` the tour opened on top of the page. The element at the centre of «Lag første kampanje» is `div.tour-lag`, so the main button can't be clicked until he skips the tour. The tour's 4 steps never say that Frantz checks ads before they go out. «Kom i gang» does say it: «Frantz lager annonsene. Dere ser dem før noe publiseres.» ✔. «Lag første kampanje» opens the form without the «Hent fra Stillinger» field ✔. The form's placeholder asks for «Budsjett:» and «Kanaler:», and neither the form nor the order button says what happens after ordering.

**Sigrid, keyboard + screen reader.** The tour dialog took focus and trapped Tab inside it. Esc closed it but left focus on `<body>`. After a reload, Tab stop 1 was «Hopp til innholdet» ✔ and every stop had a visible ring ✔. Stops 17 and 18 are `<tr tabindex="0" onclick=…>` with no link role. Enter on «Sykepleier Oslo» opened `campaign.html?id=129041#innsikt`, but focus started on `<body>`. Tabs use a roving tabindex ✔. The report link and «Kopier rapport uten innlogging» were stops 38–39 ✔. axe found one serious violation on all 8 pages (`label-content-name-mismatch` on the account button) and nothing critical.

**Ola, 390 px phone.** None of the 7 pages scrolled sideways ✔. Taps: «Hopp over» (tour) → «Sykepleier Oslo» card → «Kampanjeoversikt» (collapsed by default) → copy icon. The clipboard got the `delt-rapport.html?lenke=…` URL and the page said «Kopiert.» ✔. Four taps fit well inside a minute. The copy icon is 32×32 px and sits beside a 270×21 px link that opens the report.

---

## New customers

## [P1] «Bruk anbefalt» sets the budget but leaves every channel unticked
- Where: Ny kampanje → summary → Kampanjen «Endre» dialog, desktop
- What happened: «Bruk anbefalt» filled kr 17 000. All 5 channel boxes stayed unticked, and the estimate box said «Velg minst én kanal for å se estimatet.». A moment earlier the hint had mentioned «kanalene Frantz anbefaler». Hanne, who "knows little about channels", had to choose them herself.
- Why it matters: Principle 1, "Let Frantz choose". Research A: the municipal HR adviser wants live price and channels, not a channel decision.
- Suggested fix: «Bruk anbefalt» fills budget and the recommended channels together and says so, e.g. «Anbefalt: kr 17 000 · Meta og Nettsteder og aviser». Keep the boxes editable.
- Screenshot: screenshots/persona-hanne-anbefalt-no-channels.png

## [P1] Parsing a link or short text gives wrong values that then spread
- Where: Ny kampanje → «Fyll ut skjemaet» → summary, desktop
- What happened: The link `finn.no/job/fulltime/ad.html?finnkode=…` became «Stilling: Ad html». The text said «Søknadsfrist 20.11.2026», but the field showed «28.10.2026». «Arbeidsgiver» showed «Ikke oppgitt», though the text named «Lillehammer kommune». The manager's email and approval page then said «kampanjeplanen for «Ad html»».
- Why it matters: Principle 5, plain Norwegian with no internal junk. Hanne worries about "choosing the wrong thing", and the junk reaches her manager.
- Suggested fix: Never use a URL slug as a job title. Leave a field empty and flag it «Mangler – fyll inn» instead of guessing. Let any date written in the text win over the default. Use the campaign name, not «Stilling», in the approval email subject.
- Screenshot: screenshots/persona-hanne-link-parse-and-approval.png

## [P1] The manager approves price and channels without seeing an ad
- Where: godkjenning.html (plan approval), desktop
- What happened: The plan had no material, so the approval page said «Det er ikke lagt ved noe annonsemateriell til denne forespørselen.». Hanne's only route to a preview is to build or upload an ad in the «Endre materiell og filer» modal first.
- Why it matters: Hanne's goal is to show "price, channels and a preview" to the manager. Research A: the municipal HR adviser would self-serve only with "channels, live price, preview".
- Suggested fix: When no material exists, show the manager an example preview built from the job info (title, sender, «Søk nå»), labelled «Eksempel – Frantz lager de endelige annonsene». Show the same preview on the summary before Hanne sends.
- Screenshot: screenshots/persona-hanne-manager-no-preview.png

## [P2] The first-visit tour covers «Lag første kampanje» and skips the review step
- Where: dashboard.html?bruker=ny, first load, desktop and mobile
- What happened: The tour opens automatically and its layer sits over the amber «Lag første kampanje» button, so clicks land on the overlay. Its 4 steps (Start en kampanje, Kampanjer, Varsler, Spør Frantz) never say that Frantz checks ads before they go live.
- Why it matters: Jonas's success criteria are "starts a campaign" and "knows Frantz reviews before publishing". Research A, Headley: "minner meg mer om en meny enn en knapp".
- Suggested fix: Don't auto-open the tour for new users, because the «Kom i gang» card already teaches the steps. Keep «Vis meg rundt». If the tour stays, add a step: «Frantz går gjennom og lager annonsene. Dere godkjenner før noe publiseres.»
- Screenshot: screenshots/persona-jonas-tour-covers-cta.png

## [P2] Nothing next to «Bestill kampanjen» says what happens after ordering
- Where: Ny kampanje → bottom of summary, desktop
- What happened: The only text near the button is «Oppstart avklares med Frantz. Materiell kan ettersendes og må være klart og godkjent før publisering.». The clear explanation («Frantz går gjennom bestillingen… Du får en e-post når de er klare til godkjenning») appears only after ordering.
- Why it matters: Jonas worries about "committing money without knowing what happens next". Task 4: know what is happening with an order.
- Suggested fix: Move that post-order explanation above the buttons as 2–3 short steps: «1 Frantz går gjennom · 2 Du godkjenner annonsene · 3 Kampanjen starter». Add «Du betaler ingenting før …» if that is true.
- Screenshot: screenshots/persona-mari-parsed-summary.png

## [P2] «Materiell kan ettersendes» turns into "email us" after ordering
- Where: kampanje-bestilt.html after Hanne's order (no material), desktop
- What happened: The order page promised that material could be sent later. The new campaign page then said «Dette må avklares før oppstart: materiell. Ta kontakt med Frantz.», and its only action, «Kontakt rådgiver», is a `mailto:`.
- Why it matters: Principle 3, one place per campaign. A first-time buyer is sent out of the portal at once.
- Suggested fix: Put the actions in the banner itself: «Last opp annonser» and «La Frantz lage annonsene».
- Screenshot: screenshots/persona-hanne-link-parse-and-approval.png

## Existing customers

## [P0] The pasted strategy's period, pause and channel split are silently lost
- Where: Ny kampanje → summary, and kampanje-bestilt «Kampanjen som bestilt», desktop
- What happened: Mari pasted «Periode: 02.11–15.11, pause 08.11–09.11…» and «Kanaler: Meta 60 %, LinkedIn 40 %». The summary showed «05.10.2026 – 25.10.2026 · 3 uker» and «Meta, LinkedIn». After ordering, «Kampanjen som bestilt» kept only the «Tilleggsinformasjon» line. The raw paste, including the period and the split, is not stored with the order, so Frantz never sees what she agreed with her client.
- Why it matters: Principle 2, "paste, upload, done must still work". Research B: the coordinator pastes "hele den kampanjestrategien", and "Split periods are free text". An agreed strategy that is changed without a word is worse than today's portal.
- Suggested fix: Always store the full pasted text with the order and show it on «Kampanjen som bestilt» as «Innlimt tekst». When a field can't be parsed, such as a split period, mark it «Se innlimt tekst», not a default. Highlight every value the system guessed rather than read, e.g. «Foreslått periode – sjekk».
- Screenshot: screenshots/persona-mari-parsed-summary.png

## [P1] Uploading finished ads is hidden behind the third «Endre»
- Where: Ny kampanje → summary → «Materiell og filer» «Endre» → modal, desktop
- What happened: The paste said «Materiell: Ferdige annonser fra byrå», but the summary showed «Materiell: Ikke oppgitt». Uploading took 4 more steps in a modal (Endre → «Jeg har ferdige annonser» → upload → «Lagre endringer»). The first step's «Vedlegg» drop zone takes images too, but those files don't count as ads, so there are two upload places.
- Why it matters: Principle 2 and Mari's worry that "the new form takes longer than pasting". Research B: the habit is "upload finished artwork, let Frantz do the rest".
- Suggested fix: Accept ad files in the first-step drop zone and sort them automatically, so images and video become «Ferdige annonser» and PDF/Word become «Vedlegg». If the paste mentions ready ads, show «Last opp ferdige annonser» inline in the summary, not in a modal.
- Screenshot: screenshots/persona-mari-upload-in-modal.png

## [P1] Every dialogue route on a campaign leads to email, and there are three of them
- Where: kampanje-under-arbeid.html «Be om endring», all campaign pages «Kontakt rådgiver», plus the assistant's «Snakk med en rådgiver», desktop
- What happened: «Be om endring» and «Kontakt rådgiver» both open `mailto:post@frantz.no` drafts. The subject is «[Kampanje #129072] Helsefagarbeider Tromsø», which uses the Frantz ID, not Mari's reference. Nothing is logged in «Kampanjeforløp». The assistant panel is a third route.
- Why it matters: Principle 3, one place per campaign. Research B: two message actions confuse users ("hvorfor er det to…"), and replies "arrive as separate threads" (Whydentify 23.09).
- Suggested fix: Give each campaign one «Skriv til Frantz» action that opens a thread on the campaign and logs to Kampanjeforløp. «Be om endring» should pre-fill that thread, not open a second channel. If email stays for now, put the customer's reference first in the subject.
- Screenshot: screenshots/persona-mari-be-om-endring-mailto.png

## [P2] Finished agency ads get warnings that suggest rework
- Where: «Endre materiell og filer» after upload, desktop
- What happened: The 1200×628 file got «Liggende 1.91:1 · brukes ikke i kanalene dere har valgt», and the list said «Mangler riktig størrelse for Facebook og Instagram (4:5).». Both channels support 1.91:1 link ads.
- Why it matters: Research B: the designer "does not want another tool to build ads in". Warnings make Mari doubt files her client has already approved.
- Suggested fix: Present it as information, «Frantz tilpasser formatene ved behov», and warn only about sizes that really can't be used.
- Screenshot: screenshots/persona-mari-upload-in-modal.png

## [P2] A new order's dates are already in the past (prototype clock)
- Where: Ny kampanje default «Startdato» 05.10.2026, and kampanje-bestilt «Kampanjeforløp», desktop
- What happened: The default period is 05.10–25.10.2026, based on the demo date of 30.09, but the order event is stamped «28.10.2026, 11:00». The «Startdato» help text says Frantz needs 3 working days.
- Why it matters: Task 4, know what is happening. In the 3.11 presentation this reads as a bug, and it hides the period problem above.
- Suggested fix: Use one demo clock for the event log and the date defaults, and default the start date to order date + 3 working days.
- Screenshot: screenshots/persona-mari-parsed-summary.png

## Accessibility and mobile

## [P1] Dashboard campaign rows are focusable table rows, not links
- Where: dashboard.html «Kampanjene dine nå», desktop
- What happened: `<tr tabindex="0" onclick="location.href='campaign.html?id=129041'">`. Enter works, but a screen reader announces a table row with all its cell text and no link role, so Sigrid can't tell it goes anywhere.
- Why it matters: WCAG 4.1.2 (name, role, value). Sigrid's task is to reach the status of an active campaign.
- Suggested fix: Make the campaign title an `<a href>` in the first cell and stretch its click area over the row with CSS. Remove `tabindex` and `onclick` from the `<tr>`.
- Screenshot: screenshots/persona-sigrid-focusable-row.png

## [P1] Account button: visible text doesn't match its accessible name (axe, serious, every page)
- Where: `.topbar__who` on all 8 pages tested
- What happened: Visible text is «KH Kari Hansen», but `aria-label` is «Konto: Kari Hansen». axe reports `label-content-name-mismatch` (serious).
- Why it matters: WCAG 2.5.3 (label in name). Voice-control users say what they see.
- Suggested fix: Put `aria-hidden="true"` on the «KH» avatar and use the label «Kari Hansen, konto», or drop `aria-label` and add visually hidden «konto» after the name.
- Screenshot: none (code-level)

## [P1] On a phone, the report link is behind a collapsed panel and copied with a 32 px icon
- Where: campaign.html?id=129041 at 390 px
- What happened: «Kampanjeoversikt» is collapsed by default, so copying takes an extra tap. The copy button is 32×32 px, right next to a 270×21 px link that opens the report, so a mis-tap leaves the page. «Vis meg rundt» (118×24) and «Alle kampanjer» (109×24) on Hjem are also under 44 px. The task still took 4 taps, well under a minute.
- Why it matters: Ola's conditions are one hand and tap targets ≥44 px. Task 5: show the result to their own client. Research B: share links belong next to the report link.
- Suggested fix: Make the copy buttons 44×44 and make the whole field tap-to-copy. Open «Kampanjeoversikt» by default on active and ended campaigns, or add a «Kopier rapportlenke» button under the status badge. Pad the small text links to 44 px tall.
- Screenshot: screenshots/persona-ola-overview-collapsed.png, screenshots/persona-ola-copy-icon.png

## [P2] Focus is lost after closing the tour and after opening a campaign
- Where: dashboard.html tour (Esc), campaign.html after navigation, desktop keyboard
- What happened: Esc closed the tour, but `document.activeElement` became `<body>`. The same happened after opening a campaign page. Sigrid has to start from the top, and the tour also opened on top of the page for her.
- Why it matters: WCAG 2.4.3 (focus order). Sigrid needs a predictable route from Hjem to status.
- Suggested fix: When the tour closes, return focus to «Vis meg rundt», or to `<h1>` on first load. Don't auto-open the tour when the visit starts from the keyboard.
- Screenshot: screenshots/persona-jonas-tour-covers-cta.png

## [P2] Mobile tab strip opens scrolled sideways with the first tab cut off
- Where: campaign.html at 390 px, tab row
- What happened: The strip scrolls to «Innsikt», so the first tab shows as «ing», and nothing signals there is more to the left. The page itself has no horizontal scroll.
- Why it matters: Ola scans quickly. Hidden tabs look missing.
- Suggested fix: Add an edge fade or scroll padding so part of «Stilling» stays visible. Or, below 640 px, put «Innsikt» first.
- Screenshot: screenshots/persona-ola-overview-collapsed.png

## Works well

1. **Finding a campaign by her own number works.** A search for `WN-4471` returned exactly that campaign. Her reference leads the title in the list, the page header and the breadcrumb (task 2, research B). Screenshot: screenshots/persona-mari-search-own-ref.png
2. **The approval loop is complete.** The email is clear, the link needs no login, «Å åpne lenken godkjenner ingenting» is reassuring, approving takes one click, and the sender's view updates to «Godkjent» with the next step. Approving never places the order (task 3).
3. **The long paste survives into «Tilleggsinformasjon»**, all 1 KB of it. Mari's order took 6 clicks, comfortably under 3 minutes.
4. **The keyboard basics hold.** The skip link is the first stop, every stop has a visible ring, tabs use a roving tabindex, and copy buttons have names like «Kopier rapport uten innlogging» with a «Kopiert.» confirmation. axe found no critical violations.
5. **The phone layout works.** None of the 7 portal pages scrolls sideways at 390 px, the status badge «Aktiv» is visible in the first screen, and Ola finishes in 4 taps.

Counts: P0 1 · P1 8 · P2 7

Verdict: FAIL
