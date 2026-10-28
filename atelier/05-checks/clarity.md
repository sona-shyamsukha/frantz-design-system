# Clarity check — Frantz portal (baseline, 28.10.2026)

Lens: Jonas, a new customer (got access after a sales meeting, no campaigns, does not know Autopublish, Tailored or Frantz AI). Each screen got the 5-second test on the fold (mobile 390 and desktop 1440), then a full-page scan. Ny kampanje was also walked live at `ny-kampanje.html?bruker=ny` with the demos «Bare lenke» and «Lenke og tekst».

Status of the 19.10 judge-my-design points, checked live: the paid extra is no longer ticked from free text («Dere nevnte dette i teksten. Kryss av hvis dere vil ha det.»). A total now shows («Totalt eks. mva.»). The step form and packages-in-step-2 are gone, replaced by a one-page summary. Still open: «du» and «deres» are mixed on the empty Kampanjer card (finding 12).

## 5-second test summary

| Screen | What is this? | Main action? | What happens next? |
|---|---|---|---|
| Login | Clear | Clear | Clear |
| Hjem (ny) | Clear («Her bestiller dere stillingsannonser…») | Hesitant: the tour covers the banner CTA | Partly: "Frantz fills in the rest" |
| Ny kampanje | Clear | Clear («Fyll ut skjemaet») | Partial: nothing about price, review or what comes after |
| Kampanjeliste | Clear | Clear | Clear |
| Bestilt | Clear | Hesitant: «Kontakt rådgiver» or the amber sporingskode box | Clear («Du får en e-post når de er klare til godkjenning») |
| Under arbeid | Clear | Clear («Godkjenn annonsene») | Partial |
| Aktiv / Avsluttet rapport | Clear | Partial: no obvious "share with client" action | n/a |

---

## [P1] A new customer who pastes only a link still has to pick budget and channels alone
- Where: Ny kampanje, the summary after «Fyll ut skjemaet», demo «Bare lenke», desktop and mobile
- What happened: Hjem and the tour promise «Lim inn en lenke til stillingen, så fyller Frantz ut resten». With only a link, the summary shows «Budsjett – Mangler» and «Kanaler – Mangler», the total reads «Ikke beregnet», and «Bestill kampanjen» is blocked with «Fyll inn budsjett og kanaler før du fortsetter.» The only help, «Bruk anbefalt», is hidden inside the «Endre kampanjen» editor. That editor shows five channels with «fra kr» prices and asks Jonas to choose.
- Why it matters: Principle 1, "Let Frantz choose". Research A: «Category and job-title pickers force guessing» (Hyr 07.10, Whydentify 24.09). Jonas «Knows nothing about Autopublish, Tailored or Frantz AI» and worries about «committing money without knowing what happens next». The promise on Hjem is broken at the first real step.
- Suggested fix: When budget or channels are missing, prefill Frantz's recommendation in the summary and label it: «Frantz foreslår: kr 12 000, Meta og Nettsteder og aviser, 3 uker. Endre hvis dere vil.» Keep «Mangler» only if the recommendation cannot be made. Change the Hjem text to match what really happens.
- Screenshot: screenshots/ny-kampanje-desktop-full.png (start state). The summary state was checked live and is not in the screenshot set.

## [P1] Nothing at the order button says Frantz reviews before anything is published
- Where: Ny kampanje, «Prisoversikt» and the buttons «Send planen til godkjenning» / «Bestill kampanjen», desktop and mobile
- What happened: The only line near the button is «Oppstart avklares med Frantz. Materiell kan ettersendes og må være klart og godkjent før publisering.» It does not say who approves (Frantz? the customer?), that a person at Frantz checks the order, when the order is binding, or when the invoice comes. Hjem («Dere ser dem før noe publiseres») and Bestilt («Frantz går gjennom bestillingen») say it, but not at the moment of commitment.
- Why it matters: Jonas's success criterion is «knows Frantz reviews before publishing». Research B: approval happens before launch, «Nei, ikke etter at den er gått live» (designer, 23.10). The 19.10 review raised the same question («Is it binding? Can I cancel? When do I pay?»). It is still open.
- Suggested fix: Put three short lines directly above the button: «1. En rådgiver i Frantz går gjennom bestillingen. 2. Dere godkjenner annonsene før noe publiseres. 3. Faktura kommer når kampanjen starter.» [GAP: confirm cancel and invoice rules with Frantz.]
- Screenshot: no screenshot of the summary state (checked live).

## [P1] What the customer gets for the money is not shown before ordering
- Where: Ny kampanje, «Prisoversikt», desktop and mobile
- What happened: The price is clear («Kampanjebudsjett kr 15 000», «Totalt eks. mva. kr 15 000»). But there is no forecast of results in the summary. The earlier «ca. X trykker «Søk»» forecast is gone. The editor only says «Estimat for kampanjeperioden, ikke garanterte resultater» without showing an estimate in the summary.
- Why it matters: Principle 4, "Numbers with meaning". Research A: the low-frequency buyer wants «web-shop transparency: channels, live price, preview» (municipal HR, 28.09). Hjem promises «Hva når dere for budsjettet?» but sends people to a separate calculator.
- Suggested fix: Add one line under the total: «Forventet: ca. 15–25 trykk på «Søk» på 4 uker (anslag).» Link «Hvordan regner vi?» to the Tilbudskalkulator.
- Screenshot: none (checked live).

## [P1] The report funnel has no benchmark, so small numbers look like failure
- Where: Avsluttet rapport and Aktiv, «Resultater» funnel and the top tiles, desktop and mobile
- What happened: The funnel goes «Visninger 50 200» → «Klikk 760, 1,5 % av forrige steg» → … → «Trykket «Søk» 18, 4,9 % av forrige steg». A non-marketer cannot tell if 1,5 % or kr 1 730 per «Søk» is good or bad. The site table and the map have «Hva betyr dette?», but the funnel, the most technical part, does not. The first step's huge curve makes every later step look like nothing.
- Why it matters: Principle 4. Research: «Report loved by the partner, too technical for non-marketers» and «Numbers need context: benchmarks» (Whydentify 24.09, recruitment specialist 28.09). Task 5: show the result to their own client.
- Suggested fix: Add a benchmark line to each tile and step: «Typisk for sykepleier-stillinger: 1,0–1,8 %». Add «Hva betyr dette?» under the funnel with one sentence per step. Start the funnel visual at «Klikk», or use a log scale, so the steps that matter are readable. [GAP: benchmark data from Frantz.]
- Screenshot: screenshots/avsluttet-rapport-desktop-full.png, screenshots/aktiv-desktop-full.png

## [P1] The onboarding tour covers the main CTA on Hjem and says different things on mobile and desktop
- Where: Hjem (ny), fold, desktop and mobile
- What happened: On desktop the tour popover sits on top of the banner button «Lag første kampanje», so the main action on the page is hidden behind a tooltip about a different button. Desktop says «1 AV 4» and mobile says «1 AV 3». The mobile text repeats itself: «Knappen ligger her på alle sider. … Knappen «Ny kampanje» ligger øverst, ved siden av menyen.» Its body also mentions «velg en pakke» (in Kom i gang) while the form has no package step.
- Why it matters: The 5-second test answer to "what is the one main thing to do?" becomes hesitant. Research A: «No clear first action today» (Headley, 23.09).
- Suggested fix: Point step 1 at the banner button for new customers (or start the tour only after a click on «Vis meg rundt»). Use the same number of steps on all viewports. Remove the repeated sentence on mobile. Change «og velg en pakke» to «og se over forslaget».
- Screenshot: screenshots/hjem-ny-desktop-fold.png, screenshots/hjem-ny-mobile-fold.png

## [P1] «Sporingskode» is asked of a new customer with no explanation of what it is
- Where: Bestilt, amber box «Legg sporingskoden på stillingssiden», desktop and mobile. Also a top-level nav item «Sporingskode».
- What happened: Right after ordering, the most coloured element on the page is «Dette gjenstår hos dere før kampanjen starter.» It does not say what a sporingskode does, who on their side should do it, or what happens if they skip it. For Jonas it looks like a technical blocker.
- Why it matters: Principle 5, "Plain Norwegian". Jonas «Knows: nothing». Research A: names and terms the user does not know «block understanding, even for experienced users» (Hyr, 07.10).
- Suggested fix: Rewrite: «Be den som drifter nettsiden deres legge inn en kort kode. Da kan vi telle hvor mange som søker. Uten den ser dere bare klikk.» Add «Send til nettansvarlig» as the button.
- Screenshot: screenshots/bestilt-desktop-full.png

## [P2] The auto-made campaign name looks like an internal ID
- Where: Ny kampanje summary, «Kampanjenavn/deres referansekode: Oppdrag 22 45», and Kampanjeliste («Oppdrag 22 52 … #129070»)
- What happened: Jonas never typed «Oppdrag 22 45». It looks like a Frantz code, which is exactly what the label says it is not («deres referansekode»). In the list, «Oppdrag 22 52» sits above «#129070», which gives two IDs and no job title as the name.
- Why it matters: Principle 5: no internal IDs the user does not know. Research B: users find campaigns «by their own ID» (coordinator 23.10).
- Suggested fix: When the user gave no reference, name the campaign from the job: «Sykepleier Kristiansand». Show the field as empty with the hint «Deres eget nummer (valgfritt)».
- Screenshot: screenshots/kampanjeliste-desktop-fold.png

## [P2] «Bruk lagret pakke» is shown to a customer who has no saved packages
- Where: Ny kampanje, «Endre kampanjen» editor; side nav «Lagrede pakker»
- What happened: «Bruk lagret pakke (valgfritt)» and «En pakke fyller ut budsjett og kanaler» appear for `bruker=ny`, who has never saved anything.
- Why it matters: Same confusion as the 19.10 review point 3 («Which packages are "mine"?»). It adds a choice that Jonas cannot use.
- Suggested fix: Hide the package picker until the customer has at least one saved package, or show Frantz's standard packages under the name «Frantz anbefaler».
- Screenshot: none (checked live).

## [P2] Two order buttons; the approval route is not explained
- Where: Ny kampanje, «Send planen til godkjenning» (secondary) next to «Bestill kampanjen» (amber)
- What happened: Without a line of help, Jonas cannot tell whether he must send to approval first, or whether «Bestill» skips his manager.
- Why it matters: Task 3, get approval from a manager or end client. Research: the persona Hanne «Must get the manager to approve price and ad first».
- Suggested fix: Add one line under the secondary button: «Sender en lenke til sjefen eller kunden. Dere bestiller etter at de har godkjent.»
- Screenshot: none (checked live).

## [P2] Bestilt shows two competing actions and links that do not work yet
- Where: Bestilt, desktop
- What happened: The blue box has «Kontakt rådgiver» and the amber box has «Se sporingskoden», so there are two highlighted boxes. The sidebar already lists «Rapport uten innlogging» with a copyable link for a campaign that has not started. «Kampanjeforløp: Ingen endringer er registrert ennå» is the biggest card and is empty.
- Why it matters: Task 4, know what is happening with an order. One visual priority per section.
- Suggested fix: Merge the status into one card with a next-steps list (1. Frantz går gjennom, 2. Dere godkjenner annonsene – ca. dato, 3. Kampanjen starter 07.10). Hide the report link until the campaign is live. Hide «Kampanjeforløp» while it is empty.
- Screenshot: screenshots/bestilt-desktop-full.png

## [P2] Report terms that only a marketer knows
- Where: Aktiv and Avsluttet, «Besøk på kampanjesiden», «Kampanjeside», «Begynte å lese», «Meldte interesse … telles separat»
- What happened: «Kampanjeside» (Frantz's landing page) is never explained, and the user may think it is their own job ad. «Meldte interesse» is defined only as «telles separat».
- Why it matters: Principle 5 and research: report «too technical for non-marketers» (Whydentify 24.09).
- Suggested fix: Explain once at first use: «Kampanjesiden er siden Frantz lager for stillingen. Derfra trykker kandidaten «Søk».» «Meldte interesse: kandidater som la igjen kontaktinfo uten å søke.»
- Screenshot: screenshots/aktiv-desktop-full.png

## [P2] «du» and «dere» are mixed on the same screen
- Where: Kampanjer empty state (`?bruker=ny`), Ny kampanje editor, Bestilt
- What happened: «Kampanjene du har bestilt» above «Opprett deres første kampanje». «Perioden velger du separat» and «før du fortsetter» in a form that otherwise says «dere». Bestilt: «Du får en e-post». This was raised on 19.10 and is still open.
- Why it matters: Principle 5. Small, but it reads as unfinished to a new customer.
- Suggested fix: Use «dere» everywhere in the customer portal.
- Screenshot: screenshots/kampanjeliste-desktop-fold.png

## [P2] The approval note on Under arbeid does not say what approving does
- Where: Under arbeid, under «Godkjenn annonsene / Be om endring / Send videre til godkjenning»
- What happened: «Godkjenningen gjelder annonsene. Frantz følger opp publisering etterpå.» It does not say when the ads go live after approval, or that the user can still change things.
- Why it matters: Jonas worries about «what happens next». Task 4.
- Suggested fix: «Når dere godkjenner, publiserer Frantz annonsene fra 05.10. Vil dere endre noe, trykk «Be om endring».»
- Screenshot: screenshots/under-arbeid-desktop-full.png

---

## Works well
- The Hjem «Kom i gang» checklist tells the whole story in four plain steps, including «Frantz lager annonsene. Dere ser dem før noe publiseres.» This is the clearest statement of the review promise in the portal.
- «Hva er en kampanje?» explains the core word without product names. No «Autopublish», «Tailored» or «Frantz AI» appears anywhere a new customer sees.
- The 19.10 dark pattern is fixed: paid extras are suggested («Dere nevnte dette i teksten. Kryss av hvis dere vil ha det.»), never ticked. «Totalt eks. mva.» is visible before ordering.
- The report uses «Trykket «Søk»» instead of CTR or conversions, explains what it counts, and the adviser note («Meta har gitt flest klikk på «Søk». Frantz har flyttet mer av budsjettet dit.») is the kind of meaning non-marketers asked for.
- Bestilt says plainly what happens next: «Frantz går gjennom bestillingen og klargjør annonsene. Du får en e-post når de er klare til godkjenning.»

Verdict: FAIL
