# Changes after the live comparison

Working draft for Sona · 27 October 2026 · status reviewed 28 October 2026

We compared the live portal (business.frantz.no) with the redesign on 27 October 2026. We kept only the gaps that users need. This file says what to change, why, where, and how we know it is done.

**Baseline.** Originally written against `codex/campaign-page-review` (`295ac71`). Status below was checked against `main` at `5225c11` on 28 October 2026. Both that review branch and the merged typography worktree have since been removed. Original line numbers and “today” descriptions in the proposal below refer to the earlier baseline.

**Current status — source inspection, not a new browser test or design approval.**

| Change | Status on `main` | Still to resolve |
|---|---|---|
| 1. Email and campaign record | Partly implemented. Campaign history and copyable campaign, report and social-ad links exist in `components/js/campaign-details.js`. | No sent-email record or “Kopier emnet” was found there. The portal inbox and assistant references remain. The full “Lenker og filer” proposal below is not complete. |
| 2. Contact the advisor | Partly implemented. Campaign contact and change-request actions use `mailto:` in `campaign-page.js` and `campaign-details.js`. | They use `post@frantz.no` and `[Kampanje #<id>] <title>`, rather than the proposed named advisor and reference-based subject. Confirm recipient ownership and the shared subject before completing this proposal. |
| 3. Share the report | Implemented in the prototype. The current source includes report sharing and a separate shared report. | Production access control and the policy questions below remain open. The earlier verification record is in `campaign-page-design-review.md`; it was not rerun for this documentation update. |
| 4. Delete a draft | Partly implemented, with a different interaction. An existing draft can be deleted from the order flow after typing its name; the campaign list then offers undo. Data deletion/restoration and focused tests exist. | No delete action exists on campaign-list rows. The inspected deletion path has no owner check or pending-approval revocation. It does not clear the order-flow storage keys. Confirm whether the implemented interaction should replace the original proposal. |
| 5. Stillinger and tracking | Proposed simplification is outstanding. | `connect-detalj.html` still contains audience category, ISCO and ConnectID wording. `connect.html` still offers “Lag en ConnectID uten kampanje”. Choose the intended route before editing. |
| 6. Small clean-up | Outstanding in the inspected source. | The profile language selector, dashboard tour step for `.assist-fab`, and older inbox/email descriptions remain. |

The recommendations and alternatives below are retained for review. A partial implementation does not establish that an option has been approved. Changes 2 and 5 still contain explicit decision points; change 4 also needs reconciliation with the current interaction.

**Local screenshots.** The 40 untracked iteration screenshots were moved to `output/archive/2026-10-28-design-iterations/`, preserving their folder names and contents. A local manifest records their original paths and SHA-256 checksums. These images include superseded experiments and do not establish an approved or current design. The archive is excluded locally from Git; both copies of the one exact duplicate were retained.

**Rules.**

- UI text is in Norwegian.
- Use the current checkout; `.claude/worktrees/streamline-text-styles/` was removed after its work was confirmed merged.
- Treat the remaining detailed changes as proposals, and check them against the current source before implementing.

**Inherited evidence references.** The original draft attributes its findings to 6 customer interviews (`Frantz/2-research/intervjunotater/`) and the advisor interview of 11.09 (`Frantz/2-research/produktet-i-dag/admin-arbeidsflyt.html`). It says two of the 6 customers are from Whydentify, which owns 44.3% of Frantz. These counts, claims and the quotations below were not reverified for this status update; check the original research before client use. Treat the evidence as hints, not proof.

## Original proposed order

1. Talk in email, keep the record on the campaign
2. «Kontakt rådgiver» opens an email to the advisor
3. Share the report (built)
4. Delete a draft
5. Stillinger and tracking code
6. Small clean-up

Change 2 depends on change 1, because both use the same email subject. The other changes do not depend on each other.

---

## 1. Talk in email, keep the record on the campaign

**28 October status:** partly implemented; see the current-status table. The following describes the original proposal, including work still outstanding.

### Background

On live, each campaign has two message features inside the portal:

- **«Kundestøtte»:** a message box with the history of messages for the campaign.
- **«Forespør endringer»:** a form with a title and a text. It goes to the advisor. The user can tick a box to get a copy by email.

Nobody uses them:

- **Frantz staff:** the advisor (11.09) said nobody uses the built-in inbox, because it «krasjer litt» and is «upålitelig». The team reads everything in Gmail.
- **Thomas (P29):** the built-in email function gives no value. His own email is faster.
- **Mikael (P15):** he does not want to go back to the portal to reply. «Det er ingen vits i.»
- **Lise:** after ordering, she does nothing in the portal.

Sona dropped the email inside Frantz on 27.10.2026.

### The real need

Users need to keep track of each campaign:

- **Mikael (P12–P14, serious):** every reply from Frantz is a new email with no history. That is about 10 emails per campaign, and «det blir bare kaos». He cannot search by his own reference number.
- **Lise (P22, serious):** emails from Frantz are not threaded. With four campaigns at once, it gets messy.
- **Øyvind:** wants all talk and history for a campaign in one place.
- **Karoline (P12):** share links only arrive by email. She wants links, banners and confirmations on the campaign.

So users want two things:

1. Talk with Frantz in their own email.
2. One place to find what happened on a campaign.

### Approach: talk in email, the campaign keeps the record

#### 1a. One email thread for each campaign

- **Subject format:** `[<deres referanse> · #<kampanje-ID>] <stilling> <sted>`, for example `[Oppdrag 22 31 · #129041] Sykepleier Oslo`. The prototype already uses this format in the order receipt.
- **Same subject every time.** Every email Frantz sends about the campaign uses this subject: order confirmation, missing material, ads ready, campaign live, final evaluation.
- **Replies stay in the thread.** The user replies in the same thread, and so does Frantz.
- **For Frantz (production):** this is an email template and a habit, not a new system. Check with Frantz that their email setup keeps the subject [GAP].

In the prototype:

| Where | Now | Change |
|---|---|---|
| `portal/ny-kampanje.html`, the receipt (`id="kvittering"`) | «Alt om kampanjen kommer i én e-posttråd med dette emnet: …» | **Keep.** This describes the solution. |
| `portal/ny-kampanje-alternativ.html:934` | Same text | **Keep** |
| `components/js/assistant.js:765` | «Jeg har laget én tråd for kampanjen. Alle svar fra Frantz kommer her, og i samme e-posttråd …» | «Alt om kampanjen kommer i én e-posttråd med emnet: …». Remove «kommer her», because there is no thread in the portal. |
| `components/js/assistant.js:760-761` | Quick reply «Se e-posttråden» | Remove it |

#### 1b. The campaign keeps the record

- **Where:** «Kampanjeforløp» on `portal/campaign.html` and `portal/rapport.html`, plus the history on `portal/kampanje-bestilt.html` and `portal/kampanje-under-arbeid.html`.
- **What:** add an entry each time Frantz sends an email. Each entry has:
  - a `mail` icon and the label «Sendt på e-post»
  - a date
  - one line about what it said
  - Examples: «Bestillingen er mottatt», «Annonsene er klare for godkjenning», «Kampanjen er live», «Sluttevaluering».
- **Not the whole email.** The portal is a record, not an inbox.
- **Under the log, add:** «Svar og spørsmål ligger i e-posttråden [Oppdrag 22 31 · #129041] Sykepleier Oslo.» with the button **«Kopier emnet»**. Users can paste it into their email search. This answers Mikael's search problem (P14).
- **The user's own replies are not shown.** The portal cannot see them in the first version.

#### 1c. «Lenker og filer» on the campaign

- **Where:** the side panel on `portal/campaign.html` and `portal/rapport.html` («Rammer for kampanjen»). Today it has «Kampanjeside og sporing» with «Åpne kampanjesiden» and the tracking code.
- **Rename the section to «Lenker og filer». It contains:**
  - **Kampanjesiden:** «Åpne» and «Kopier lenken»
  - **Rapporten:** «Del rapport» (already built, change 3)
  - **Delelenker til sosiale medier:** one «Kopier» per channel (Karoline P12). Add example links per channel to `portal/data/kampanjer.js`.
  - **Annonsene:** «Last ned alle». Today this button sits in the ads section (`data-last-ned`). Put a copy of the action here.
  - **Sporingskode:** the existing tracking-code block (`piksel.js`)
- **On `kampanje-bestilt.html`:** show only what exists at that point: the tracking code and the submitted material.

#### 1d. Remove the inbox

| What | Change |
|---|---|
| `portal/admin-innboks.html` | Delete. Frantz staff do not use a portal inbox. |
| `components/js/advisor-inbox.js` | Delete. It is used only by `admin-innboks.html`. |
| `component-library.html:1488, 3504, 4923` | Remove the links to `admin-innboks.html`. Remove the component entry if only the advisor inbox uses it. |
| `components/js/assistant.js:951` | Remove the link «Se hvordan rådgiveren ser saken» |
| `portal/epost-visning.html` | **Keep, as a demo outside the portal.** It shows the thread in Kari's own email program, which is the solution in 1a. Remove the button «Rådgiver hos Frantz» (`:75`), because it links to the advisor inbox. Add the label «Demo: slik ser e-posttråden ut i e-posten din». |
| Links to `epost-visning.html` from the portal | «Kontakt rådgiver» on `campaign.html` and `rapport.html` links there today. Change 2 replaces it. Link the demo only from `kampanje-designreview.html` or the README. |
| `portal/dashboard.html:319` (tour) | This step points to the hidden «Spør Frantz» button. Remove the step. |

### Documentation

- In `losninger.html`, keep items 27, 28 and T7 («Én e-posttråd per kampanje», «Oppdragsnummer i emnet», «E-posttråd med fast emne»). They are the solution. Change the text to say the talk happens in the user's own email, and the portal has no inbox.
- In `losninger.html:221`, remove the `innboks` entry. In the MVP list, mark «Innboks for rådgivere» as «Droppet 27.10.2026».
- Add two new items to `losninger.html`: «Kampanjeforløp viser hva Frantz har sendt» and «Lenker og filer på kampanjen».
- In the README, say that the portal has no inbox, and that users talk with Frantz in one email thread per campaign.

### Risks

- It depends on Frantz staff always using the same subject.
- Files sent by email do not appear on the campaign by themselves. Frantz must add them.
- Replies are not visible in the portal. Later, Frantz could connect the mailbox to the campaign. That is a bigger build and is not part of this plan.

### Done when

- No page in the portal opens an inbox. `admin-innboks.html` is gone.
- «Kampanjeforløp» shows the emails Frantz sent, plus «Kopier emnet».
- The campaign pages have a «Lenker og filer» section.
- The receipt, the log and the email from change 2 all use the same subject.

---

## 2. «Kontakt rådgiver» opens an email to the advisor

**28 October status:** email contact exists using a shared address and a campaign-ID subject. The original recipient and subject proposal below is still unresolved; the “In the branch today” table describes `295ac71`.

### Background

**On live today:**

- A pencil icon in the campaign header opens «Forespør endringer»: a title, a description and «Send». It goes to the advisor on the campaign, with an optional copy to the user's email.
- Next to it, «Kundestøtte» shows the message history.

**Problems:**

- Mikael did not understand the two buttons «Opprett ny sak» and «Forespør endringer» (P16). Attachments seem to need a «sak». He wants one action, with attachments (T12).
- Thomas would rather use his own email (P29).

**In the branch today:**

| Page | Button | Opens |
|---|---|---|
| `portal/campaign.html` | «Kontakt rådgiver» (link) | `epost-visning.html` |
| `portal/rapport.html` | «Kontakt rådgiver» (link) | `epost-visning.html` |
| `portal/kampanje-bestilt.html` | «Kontakt rådgiver» (`data-contact-adviser`) | The assistant (`components/js/campaign-page.js:9-12`) |
| `portal/kampanje-under-arbeid.html:103` | «Be om endring», next to «Godkjenn» | The assistant |

The assistant is postponed, so these buttons must not open it.

### Decision for Sona

**Option A (recommended): open the user's own email to the advisor.**

- **Label:** «Kontakt rådgiver» on `campaign.html`, `rapport.html` and `kampanje-bestilt.html`. On `kampanje-under-arbeid.html`, keep «Be om endring», because it sits next to «Godkjenn» and is about the ads.
- **To:** the advisor on the campaign. Add `radgiver: { navn, epost, telefon }` to each campaign in `portal/data/kampanjer.js`. Use an example domain that does not exist, for example `martin.karlsen@frantz.example`.
- **Subject:** the thread subject from change 1a, for example `[Oppdrag 22 31 · #129041] Sykepleier Oslo`. The email lands in the same thread as everything else.
- **Body:**
  - «Kontakt rådgiver»: «Hei Martin,\n\n»
  - «Be om endring»: «Hei Martin,\n\nJeg vil endre dette i annonsene:\n\n»
- **Under the button, as text:** «Martin Karlsen · martin.karlsen@frantz.example · 900 00 000». If the button does nothing (for example in Gmail in the browser), the user can copy the address.
- **Help text:** «Åpner e-posten din. Legg ved filer i e-posten. Svaret kommer i samme tråd.»
- **Code:** in `components/js/campaign-page.js`, replace the assistant call in the `data-contact-adviser` handler with the `mailto` link. Put `data-contact-adviser` on all four buttons, plus `data-kind="endring"` on «Be om endring». Remove `onclick="window.FrantzAssist && FrantzAssist.open()"` from `kampanje-under-arbeid.html:103`.
- **Change this text in `portal/kampanje-bestilt.html`:** «Svar på e-posten fra Frantz hvis du vil endre noe.» becomes «Vil du endre noe? Svar på e-posten fra Frantz, eller trykk «Kontakt rådgiver».»
- **Ask Frantz [GAP]:** does each campaign have one named advisor, or does a team share the work? If a team shares it, use a team address in «To» and the advisor's name in the body.

**Against option A:**

- A `mailto` link needs an email program. That is why the address is also shown as text.
- The email goes to one person. If they are away, it waits.

**Option B: a small form in the portal.**

- One text field and attachments. Frantz sends it as an email into the campaign thread, and the user gets a copy. It shows in «Kampanjeforløp».
- **For:** it works without an email program, and the portal keeps a record.
- **Against:** Frantz must build it, and it is close to the live feature users do not use.

**Option C: only show the advisor's contact details.**

- **For:** simplest.
- **Against:** the user must type the subject and campaign number. That is the old pain.

The assistant (`assistent.html`) stays as a separate demo for later.

### Done when

- No button on the campaign pages opens the assistant.
- Each button opens an email with the right advisor, subject and body.
- The advisor's name, email and phone are visible as text.

---

## 3. Share the report (built)

### Status

Built in commit `295ac71` on `codex/campaign-page-review`. See `planning/campaign-page-design-review.md`.

- **«Del rapport»** on the campaign page opens the panel in `components/js/report-sharing.js`:
  - a link that works without a login
  - «Vis budsjett og kostnader», off by default
  - expiry for the link
  - «Slå av deling»
  - «Forhåndsvis rapport»
- **`portal/delt-rapport.html`** is a read-only report. It has no portal menu, no editing and no approval. It never shows candidate contact details («Kontaktopplysninger følger ikke med»).
- The shared page loads only aggregate example data, with no candidate, account or approval scripts.

### Why we need it

On live, the report link works without a login. Before `295ac71`, the redesign copied a page address that needed a login, so it was worse than live.

- Mikael (agency) sends the report link to his customers.
- Lise says the report is how they prove to the customer what Frantz delivered.
- Jon Alfred (Sortland kommune) sends results and candidates on to the leader who hires.

### Different from the first version of this plan

The first version had a switch «Vis interessenter». The built version never shares candidates. **Keep it that way.** It is safer, and it answers Lise's GDPR concern (P20).

**Open point:** Jon Alfred sends candidates to his leader. Today he can forward the candidate alert email from Frantz. Check with users whether that is enough.

### Still open (from the design review)

- Should agencies hide budget and costs by default? The build hides them.
- Should a final report be frozen when it is issued?
- Check the rules for cost per «Søk» and actual spend with Frantz.
- **Production:** the server must check each link, apply what is visible, expire links and turn links off. The browser storage in the prototype is not access control.

### Done when

Already checked in `295ac71`. Build nothing more unless Sona changes one of the open points.

---

## 4. Delete a draft

**28 October status:** deletion from an opened draft and undo in the campaign list exist. The current flow requires typing the draft name and differs from the proposal below. List-row deletion, owner checks, pending-approval revocation and order-storage cleanup are not implemented in the inspected path. Keep the proposed rules visible until the intended behaviour is decided.

### Why

The redesign saves automatically. Lise lost work on live because there is no autosave (P7), so we added it. The side effect: each time someone starts an order, a draft is made, and the list fills up. Live has a bin icon on draft rows only.

### Rules

- **Only drafts («Kladd») can be deleted.** You cannot delete an ordered campaign. To stop one, the user contacts the advisor (change 2).
- **Only your own drafts.** Show «Slett kladden» only when the person who ordered the campaign (`bestiller`) is the logged-in demo user. With the filter «Alle på <firma>», other people's drafts show without a delete button.
- **A draft that waits for approval needs a warning.** The user may have sent the plan to a leader with «Send planen til godkjenning» (`components/js/approval-store.js`). If so, deleting breaks the leader's link. Warn before you delete, and withdraw the request with `revoke(id)`, so the leader sees that it was withdrawn.

### In the campaign list (`portal/campaigns.html`)

- Today a draft row says «Fortsett kladden», and the whole row opens the draft. Look for `k.status === 'Kladd'` in the row builder.
- **Add a separate button on draft rows: «Slett kladden»,** with the `trash-2` icon.
  - On desktop the text is always visible.
  - On mobile it shows the icon only, with `aria-label="Slett kladden <kampanjenavn>"`.
  - The click must not open the row (`event.stopPropagation()`).
- **Normal draft:** use the same undo pattern as `portal/mine-pakker.html` (`id="pakke-slettet"`).
  - The row disappears at once.
  - A message says: «Kladden «<navn>» er slettet.» with the button **«Angre»**. It stays for 8 seconds.
  - «Angre» puts the row back in the same place.
- **Draft waiting for approval:** open a dialog first.
  - Text: «Kladden venter på godkjenning fra <navn>. Sletter du den, virker ikke lenken de har fått.»
  - Buttons: **«Slett likevel»** (danger) and **«Avbryt»**.
  - After you delete, there is no undo, because the approval request is withdrawn.
- If no rows are left, show the normal empty state.

### In the order flow (`portal/ny-kampanje.html`)

- In the «Din bestilling» box, under «Lagret kl. …», add a link-button: **«Slett kladden»**.
- It opens a dialog:
  - Text: «Slette kladden? Det du har skrevet blir borte.»
  - Buttons: **«Slett kladden»** (danger) and **«Avbryt»**.
  - If an approval request is waiting, use the approval text from the list.
- **After you delete:**
  - Clear the same `localStorage` keys as «Start på nytt» (`LAGER` and `approvalKeyStorage`).
  - Withdraw any waiting approval request.
  - Go to `campaigns.html` and show «Kladden er slettet.» There is no undo here.
- Show the link only when a draft exists: the user has typed something, or the page was opened with `?kladd=`.

### Data (`portal/data/kampanjer.js`)

- Drafts come from two places: the fixed list `LISTE` (for example 129070) and the new ones in `localStorage` (`NYE`).
- **Add `slett(id)`:**
  - A new draft is removed from `NYE`.
  - A fixed draft is added to a new list, `fz-slettede-kladder`.
- **`alle()`** filters out the IDs in that list.
- **Add `angre(id)`,** which reverses `slett`.
- The dashboard («Venter på deg» in `portal/dashboard.html`) uses the same data, so a deleted draft also goes away there.

### Done when

- «Slett kladden» on 129070 removes the row, and the row is still gone after you reload the page.
- «Angre» brings it back.
- The draft is gone from «Venter på deg» on the dashboard.
- Rows for ordered, active or ended campaigns have no delete button.
- Other people's drafts have no delete button.
- A draft with a waiting approval shows the warning, and the leader's link says the request was withdrawn.
- `tests/dashboard.test.cjs` still passes. Add tests for `slett` and `angre`.

---

## 5. Stillinger and tracking code

**28 October status:** the simplification below remains proposed; the technical fields and ConnectID wording are still present.

**What it is on live.** «Connect» is a list of ConnectIDs. Each ConnectID is a measurement setup with:

- a tracking code to put on your own job page
- the fields «Audience category», «ISCO-08», «Verifiseringsmetode», «Project reference», «Link to landingpage», «Application due date» and «Measurement period»

**What it is in the redesign.**

- `portal/connect.html` is called «Stillinger». It lists the jobs that Connect gets from the customer's own system, with ConnectID and campaign.
- `portal/connect-detalj.html` has the same fields as live, plus «Vis sporingskode».

**Research.** Karoline uses Connect only to get the tracking code before she orders (P1, H). The code is hard to find under «Vis oppsett» (P2). Lise says the specialty field looks like an audience, but Frantz uses it to collect data, and the system does not say so (P10, H). Nobody asked for ISCO or a measurement period.

### Decision for Sona

**Option A (recommended): keep «Stillinger», but make it simple.**

- Keep `connect.html` for existing customers who have jobs from their own system. New customers do not see it, as today.
- In `connect-detalj.html`:
  - **Remove** «Målgruppekategori» (`:179`) and «Yrkeskode (ISCO-08)» (`:183`). Frantz fills them from the job title, with the same job list as the order flow (`frantz-data.js`).
  - **Do not add** a measurement period. It follows the campaign dates. Without a campaign, it runs until the application deadline.
  - **Keep** the job link, Stilling, Sted, Arbeidsgiver, Kampanjenavn, Søknadsfrist and the «Meld interesse» switch with «Bekreft kandidaten med».
  - **Move the tracking code up.** Put it in its own box right under the title, not in «Vis …». Heading: «Sporingskode». Text: «Legg koden på stillingssiden deres. Da ser dere besøk og søk i rapporten.» Buttons «Kopier koden» and «Send til den som lager nettsiden» (`mailto`, same as `components/js/piksel.js`).
  - Remove the word «ConnectID» from the page. The title becomes «Stilling: <stilling>». Show the number small: «Nr. 777689».
  - Remove «Vis annonselenker» and «Vis interessenter», and the code that fills them. The user does not need tracking-tag links, and candidates live on the campaign page.
- In `connect.html`, rename the column «ConnectID» to «Nr.». Rename «Lag en ConnectID uten kampanje» to **«Hent sporingskode før bestilling»**. This solves Karoline's case: she gets the code without a full order.

**Option B: remove «Stillinger» from the menu.**

- The tracking code shows only on the campaign page (`piksel.js`, already there) and after you order.
- In `ny-kampanje.html` step 1, add a button «Trenger du sporingskoden nå? Hent den her». It makes a draft and shows the code.
- Jobs from the customer's own system are lost from the menu. «Hent fra Stillinger» in the order flow stays.

Option A is less work and keeps the integration jobs.

### Text in other places (both options)

- `portal/dashboard.html`, the tour step for «Stillinger»: change the text to «Stillinger fra deres eget system. Her henter dere også sporingskoden.»
- `portal/ny-kampanje.html` and `portal/ny-kampanje-alternativ.html`: where the visible text says «ConnectID», write «sporingskode» or «stillingen», depending on what it means. Code comments can stay.

### Done when

- `connect-detalj.html` has no ISCO, no audience category and no «Vis …» lists.
- The tracking code shows at the top with «Kopier koden».
- The word «ConnectID» is not shown to customers anywhere.

---

## 6. Small clean-up

**28 October status:** the language selector and assistant tour step remain. The table below is a proposed checklist; token checks and browser checks were not rerun for this documentation-only update.

| What | Where | Change |
|---|---|---|
| A language choice that does nothing | `portal/min-profil.html:128-129` | Remove it. The portal is in Norwegian only. |
| Hidden «Spør Frantz» in the tour | `portal/dashboard.html`, the step for `.assist-fab` | Removed in change 1d |
| Documentation | `losninger.html`, `README.md` | After each change: status, link and date |
| Stylesheet version | All pages that get new CSS | Bump the shared version, as in commit `d2154c8` |
| Token check | — | Run `python3 scripts/check-design-tokens.py` |

---

## Not doing, on purpose

| Live feature | Why not |
|---|---|
| Channel price after the order | Covered. The order shows the price per channel. The campaign shows kr per «Søk» per channel. |
| Invoice reference per order | Covered by «Tilleggsinformasjon» and «Fakturamottaker» in the order. |
| Audience category / «Adjust speciality» | Covered. The audience comes from the job title, and «Tilleggsinformasjon» asks for «målgruppe». Users did not understand the live field (Lise P10). |
| Favourites (star) | «Mine kampanjer» does the same job. Live favourites confused Lise (P26). |
| Comment per candidate | We have «Håndtert». No user asked for comments. Maybe later. |
| Paused status | No user asked for it. Thomas wants a few plain statuses. |
| More than one job in a campaign | No user asked for it. The need was more than one workplace, and we have that. |
| English | No user asked for it. Mikael complained about mixed languages. |
| Price per extra | Users care about the total. The ordered campaign shows extras and total. |
| Connect list: time filter, visits, on/off | Technical. See change 5. |
| Measurement period | Follows the campaign dates. See change 5. |
| Org number lookup, edit user | No user asked for them. |
| Copy campaign ID, «Medierådgiver» and «Last update» columns | The number is shown and searchable. The advisor is shown on the campaign. |
| Recruiter and orderer roles | No user asked for them. |
| SSB numbers, «potential candidates» | Technical. The estimate shows what users ask for: «Søk». |
| Workplace map | Chips work. Nobody asked for a map. |
| Thumbnail sizes in the media library | No need found. |
| Filter by customer | Covered. The list search also reads the employer. |
