# Design review with Frantz and the changes after it (20 Oct 2026)

A handover note. It says what Tore and Kenneth decided, what is changed in the prototype, what Sona liked and did not like, and what is still open.

Nothing in this list is committed yet. The branch is `layout-og-pakker`.

---

## 1. The meeting: «Designgjennomgang», 20.10.2026

**Who:** Sona (Vokser), Tore V. Hjerde and Kenneth Nordland Johansen (Frantz).
**Source:** Jamie notes and transcript of the meeting.

**What they decided**
- **AI stays small at first.** It fills in the form from a link or text, and that is all. No full assistant yet.
- **One ad builder.** Autopublish and «own material» become one view. It must work for:
  - API customers with a ready setup (for example Teknisk Ukeblad),
  - agencies that upload finished ads (for example Hyr and Whydentify),
  - users who upload only a picture, or ask Frantz to design it.
- **Finished ads skip the look settings.** A long title gets smaller by itself; no manual font size.
- **«Del for godkjenning» is a free-standing feature.** One link, no login. It works in every status, also after Frantz has made the material. The user picks what to approve: plan, ads, campaign page.
- **Packages:** customers can make their own. A package has no fixed period. Frantz spreads the budget over the period. The form gives advice on minimum budget per channel.
- **Media library** gets no work in this phase.
- **Chat in the portal** is too big for the launch.
- **Report page:** keep the day-by-day numbers (Kenneth).
- **Offer calculator:** each offer gets its own ID link (Kenneth). A list of old offers is still open.

**Tasks from the meeting**
- Sona: send the artifact link, book next meeting, interview Elisabeth and Trine (Jobb Norge) one by one. Done.
- Tore: send a few examples of finished ads. Not received yet.
- Next meeting: Tuesday 27.10.2026 at 12:00.

---

## 2. What is changed in the prototype

### Opprett kampanje (`portal/ny-kampanje.html`)
- **Title** is «Opprett kampanje» (was «Ny kampanje»). The top-bar button still says «Ny kampanje».
- **Step 1:** «Endre» on the stilling (in the order card or on «Se over») goes to the filled-in «Stillingen». «Fortell oss om stillingen» shrinks to one line with «Endre».
- **Step 2:** «Bruk en pakke» / «Sett opp selv» is a plain radio row. With a package, a line says that Frantz spreads the budget over the period.
- **Step 3 «Annonsen»:**
  - Frantz has already made the ad from the job ad and the brand. The user only checks it.
  - **Bilde:** Frantz's picture, «Last opp» or «Velg et annet». Only after an upload: the switch «Bildet er en ferdig annonse, med tekst og logo».
  - **Tekst:** headline on the picture and text above the ad.
  - **«Flere valg»** (closed): button, sender, logo and colours (background and text, brand colours plus «+» for any colour).
  - **Switch at the bottom:** «La Frantz designe annonsen i stedet (fra kr 2 180 / time)». It hides the builder.
  - On a wide screen the preview sits beside the controls and stays in view.
- **Step 4 «Se over og bestill»:** the overview, then «Tilleggsprodukter», comment, invoice, and «Trenger noen andre å godkjenne først?» (Del for godkjenning).
- **Order card «Din bestilling»** is on the right on desktop, as before. «Tilbake» and «Neste» sit right under each step.
- **Phone:** the card is hidden. A solid row at the bottom shows the total, «Tilbake» (arrow) and «Neste».

### Lagrede pakker (`portal/mine-pakker.html`, `portal/data/pakker.js`)
- Form order: name, budget, channels. No period.
- **Minimums per channel** from Tore's mail «Maks min kanaler» (13.10.2026): Meta 6 000, LinkedIn 3 000, Snapchat 5 000, TikTok 5 000, Nettsteder og aviser 8 000 (= BidTheatre, [ANTAGELSE]). Max values are stored but not used.
- A warning box shows **only** when the budget is under the minimum, with «Bruk kr X».
- **Delete** with a bin button on each card, and «Angre».

### Del for godkjenning
- New shared parts: `components/js/del-godkjenning.js` and `components/del-godkjenning/componentDelGodkjenning.css`.
- On `kampanje-under-arbeid.html` and `campaign.html`: pick what to approve, add the approver's name and e-mail, make a link. The link does not change the status.
- `godkjenning.html` shows only the parts that were picked, and has a new section for the campaign page.

### Other
- The floating «Spør Frantz» button is hidden on all pages (`fab.hidden = true` in `components/js/assistant-widget.js`). The assistant still opens from «Be om endring» and the Assistent page.

---

## 3. What Sona liked and did not like (use this for the next changes)

- **Too much at once is the main problem.** Ask fewer questions. Hide what has a good default. Ask a question only when it matters (for example «ferdig annonse?» only after an upload).
- **No big choice cards** for simple choices. They take too much space.
- **No pill or segmented tabs** inside the form. They look odd. Use normal radio buttons or switches.
- **No panels that slide in or expand over the buttons.** No full-width fixed footer on desktop.
- **Keep the order card on the right on desktop.**
- **Keep step names as they are** («Annonsen»). Change only what is asked.
- **Even spacing** between all sections in a step.
- She likes Headley's «Opprett kampanje» and «Tilpass annonser» (picture and text side by side).

---

## 4. Still open

1. **Tore's ad examples** are not here yet. Use them to check the ad builder.
2. **Meta minimum:** the meeting said kr 8 000, Tore's list says kr 6 000. The prototype uses 6 000.
3. **«Nettsteder og aviser» = BidTheatre?** Confirm with Tore.
4. **One picture for all channels:** the builder now uses one picture for every channel. Check with Frantz that this is enough.
5. **Brand colours** in the ad builder are the Frantz design system colours. They should come from each customer's brand settings.
6. **Lost from the old order box on phone:** the campaign number and «Lagret kl. …» do not show on phone.
7. **Autopublish as the starter package** (Tore): how to show it now that packages have no period.
8. **Old offers list** in the offer calculator.
9. **Consent** for the list of interested candidates: who gives it, and where.
10. **Delete the internal «Løsninger» check page** before the client sees the design.

---

## 5. Headley (Thomas Mowatt, interview 23.09.2026), short

- Headley makes all ads in their own ad generator and only uploads the files (also video) to Frantz.
- Thomas wants an API, so orders go straight from Headley to Frantz.
- Video matters: they want to compare picture ads and video ads.
- In the builder, a video upload shows only its file name. It does not play in the preview yet.
