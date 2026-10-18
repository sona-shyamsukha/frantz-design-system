# Peter's feedback on the portal redesign

Meeting: "App Redesigndiskusjon og Kampanjeflyt", Friday 16 October 2026 (Jamie).
Peter is "Speaker 0" in the transcript.

Peter said himself: these are fast gut reactions, not demands. "Ikke ta det jeg sier som et krav." Treat each point as a question to test, not a ruling. Only point 1 he called a no-brainer.

His main lesson: the sketches answer what **existing users** asked for. They do not yet answer what a **new customer** needs to feel safe enough to click. Existing customers keep Frantz alive. New customers make it grow.

---

## 1. "Ny kampanje" should sit in the same place on every page

**What Peter saw**
- Hjem has a big hero banner "Start en ny kampanje". Every other page has a small button.
- The main action is always the same. So it should always be in the same place.
- He called this "no brainer".

**What to change**
- Put a fixed "Ny kampanje" primary button in the top bar, top right, left of the notifications bell. Same spot on every page.
- Remove the big hero banner from [dashboard.html](../portal/dashboard.html) (the `.hero` section, around line 163).
- Let Hjem show what is going on: active campaigns, stats, tasks that wait for me, drafts.
- Keep the user-test finding visible: new users could not find how to start a campaign. A fixed top-right button solves that on every page, not only on Hjem.
- Update the guided tour step that points at `.hero .btn--accent` (dashboard.html, around line 273).

## 2. Remove "Lim inn bestillingen"

**What Peter saw**
- He could not tell the difference between "Lim inn bestillingen" and "Ny kampanje". Which one should I click? What do I miss if I pick the wrong one?

**What to change**
- Remove the "Lim inn bestillingen" button from the Hjem hero ([dashboard.html](../portal/dashboard.html), line 171). You agreed in the meeting.
- If the paste-an-email idea stays, make it one option inside Ny kampanje, next to "lim inn lenke" and "fyll ut selv". Not a second door from the outside.

## 3. Does a new customer understand "kampanje"?

**What Peter saw**
- He asked: what am I actually buying? Is "kampanje" an internal word?
- A new user may think "I want to advertise" and look for "annonse", not "kampanje".
- You only have interview data from existing users. You do not know what new users think.

**What to change**
- Keep the word "kampanje". Peter did not ask to rename it.
- Add one plain sentence where the word first appears (Ny kampanje start and the Kampanjer empty state). Example: "En kampanje er én stillingsannonse som vises i flere kanaler samtidig."
- Put "test the word 'kampanje' with 2–3 people who have never used Frantz" on the test list. [GAP: no new users interviewed yet.]

## 4. Do not use "Bestill" before the user has ordered

**What Peter saw**
- On Connect, each row says "Bestill" / "Bestill kampanje". But the click only opens the Ny kampanje form. The real order is at the bottom of that form.
- "Bestill" feels like you already put it in the cart. That is scary, for example if the budget is not approved yet. People hesitate.
- Online shops say "Legg i handlekurven", not "Kjøp", for this reason.
- Ny kampanje and "Bestill from Connect" lead to the same form. Where the data comes from (API, email, Word file) does not matter. The process is the same.

**What to change**
- Rename the Connect button to "Opprett kampanje" (or test "Lag kampanje"). Only the last button in the form says "Bestill kampanje".
  - [connect.html](../portal/connect.html): the `'Bestill kampanje'` row label.
  - [connect-detalj.html](../portal/connect-detalj.html): `bestill-topp`, `bestill-bunn`, "Bestill kampanje i stedet", and the helper text "Bestill en, så starter målingen…".
  - [dashboard.html](../portal/dashboard.html): tour text "Bestill rett fra stillingen."
- Check every button with this question: "How does the user feel at the moment of the click? How do I make them feel safe?"

## 5. Fold Connect into Ny kampanje

**What Peter saw**
- "Connect" is an internal word. New users do not know what it is, how to turn it on, or how the list got filled.
- Connect and Kampanjer look like two separate worlds, but they are linked: a Connect job becomes an active campaign. That hidden link causes confusion.
- He asked: why do you need a separate Connect step? Could it be a choice inside Ny kampanje?

**What to change**
- In Ny kampanje, add a first choice: "Hent fra Connect" (a dropdown or list of imported jobs that have no campaign yet). When picked, the form fills in. The user can still edit every field.
- Show this choice only to customers who have Connect. Others never see it.
- Treat Connect and manual input as equal options. You do not know the user's intent.
- The dropdown shows only jobs **without** a campaign. Jobs with a campaign already live in Kampanjer.
- Keep the Connect list page for now, but test if it is still needed. Most of its data also shows on other pages.
- For a customer with no Connect: show an empty state that says what Connect does and how to get it (today: by email). [GAP: confirm with Frantz how a customer becomes an API customer.]
- Try a clearer label that a new user understands. Keep "Connect" visible for existing users. Example: "Stillinger fra deres system (Connect)".

**How Peter wants you to work on this**
- Do not break the current version. Keep it as variant A.
- Build variant B the way you think is best. Try dropdown, checkbox, or a first step.
- Do the task yourself in each variant. Write down what felt natural.
- Then you have an argument for Frantz. "I tested both. B is more natural because…" You are not caught without an answer when they push back.

## 6. Make packages understandable to a new customer

**What Peter saw**
- "Pakke 1, 2, 3" says nothing to a new customer. Why pick Pakke 2? Why is Pakke 3 more expensive but has fewer channels than Pakke 2?
- A package must say what value you get: bigger reach, longer period, more channels?
- Price and period must be linked. Four weeks cannot cost the same as two weeks. If period is free, the user "makes a deal" by picking 6 weeks with Pakke 1.
- Without this, new customers will do what existing ones told you: "I'd rather send it by email, then it's done right."
- He used Netflix plans as a model: small / medium / large, with a clear list of what you get and what you miss in each.

**What to change**
- Show each package as a card with: a name that says the size (Liten / Mellom / Stor, or a short name that says what it is), what you get, the expected effect, and the price.
- Show what the smaller package does **not** include, so a downgrade is an informed choice.
- Give each package a default period (for example 4 weeks). The user then only picks a start date. If they change the period, the price changes and the card says so.
- Fix the dummy data in [data/pakker.js](../portal/data/pakker.js) so it makes sense: a bigger package should never have fewer channels for more money. Add `periode` and a short `beskrivelse` to each package.
- Remember: firms name their own packages in Innstillinger. Give them fields for description and period, and show those in Ny kampanje.
- [GAP: ask Frantz how price, period and reach are linked today. Can a 6-week campaign run on less money per week?]

## 7. Materiell, help and add-ons: no hidden costs

**What Peter saw**
- Fewer choices = easier.
- "Vi vil ha hjelp" vs "Jeg har ferdig materiell" is easy to misread.
- If the user clicks "Vi vil ha hjelp" and Tilleggsprodukter is just below the fold, they think the add-ons are what they now must pay for. He called this a dark pattern, even if it is not meant as one.
- Add-ons themselves are fine. Like the extras when you buy a plane ticket: easy to ignore.

**What to change**
- Show the cost of help right on the "Vi vil ha hjelp" choice ("Frantz lager materiellet. Fra kr 2 180 / time.").
- Put clear space and a separate heading between Materiell and Tilleggsprodukter. Add a line: "Valgfritt. Ikke en del av hjelp med materiell."
- Check with the window at laptop height that the two parts never look like one block.
- Files: the Materiell and Tilleggsprodukter parts of [ny-kampanje.html](../portal/ny-kampanje.html) (around line 452) and `TILLEGG` in [data/pakker.js](../portal/data/pakker.js).

## 8. Rapporter vs Kampanjer

**What Peter saw**
- Rapporter only shows ended campaigns. A user who wants a report on an **active** campaign goes to Rapporter, finds it empty, and learns to never go there again.
- Why can I export PDF in both places, but get different things?
- Hjem shows stats (aktive nå, trykk, søk, interessenter) that the Kampanjer list does not show.
- Think of shops: "Kjøpshistorikk" holds everything, also orders still on their way. Frantz should follow the patterns people know from other sites.

**What to change** (pick one, test, and argue for it)
- Option A (your idea in the meeting): remove Rapporter. Put all stats, graphs and the PDF export inside each campaign in Kampanjer. Add key stats per row in the Kampanjer list.
- Option B: keep Rapporter, but show **all** campaigns there, active and ended, with a status filter. Active ones show "så langt"-numbers.
- Whichever you pick: if a page only shows some items, say so on the page.
- Peter said: "Ikke endre på dette nå". Think it through from the user's side first.
- Files: [rapporter.html](../portal/rapporter.html), [campaigns.html](../portal/campaigns.html), [rapport.html](../portal/rapport.html).

---

## Decisions (Sona, 18 October 2026)

- **Two user flows.** Same pages with a switch: `?bruker=ny` shows the new-user flow, the default is the existing user. Link both flows from the portal/pages section.
  - New user: no Connect anywhere, empty states, explanation of "kampanje".
  - Existing user: Connect on, as today.
- **1. Ny kampanje button.** Fixed in the top bar, top right, on every page. Remove the Hjem banner.
- **2. Lim inn bestillingen.** Remove it from Hjem. Do not add it anywhere else.
- **3. Kampanje explanation.** Shown in the new-user flow.
- **4. Connect button.** "Bestill kampanje" becomes "Opprett kampanje". Only the last form button says "Bestill".
- **5. Connect in Ny kampanje.** First-step choice cards: "Hent fra Connect" / "Lim inn lenke" / "Fyll ut selv". The Connect card shows only for existing users with Connect. Keep the Connect page in the menu as variant A.
- **6. Packages.** Each package has a fixed period. To change the period, the user picks "Fyll ut selv". Dummy data: Liten / Mellom / Stor, each with what you get, what you miss, period and price. Innstillinger gets fields for description and period.
- **7. Materiell and add-ons.** Use the same voice everywhere ("jeg" or "vi", pick the most logical one for users), or neutral text such as "Legg til design av materiell". Separate add-ons from the help choice so they do not look like its cost.
- **8. Rapporter.** Remove it from the menu. Each campaign holds its stats, graphs and PDF. Add key stats to each row in the Kampanjer list.

## Before you show Frantz the next version

- [ ] Write down, per page: "As a new customer, what do I expect here? What am I unsure about? How does the page answer it?"
- [ ] Balance: who is this page most for, new or existing users? Say it out loud.
- [ ] For each big change, keep the old variant and have a reason ready.
- [ ] Ask Frantz: how does someone become a Connect customer? How are price, period and reach linked?
- [ ] Plan a short test with 2–3 people who have never seen Frantz.

## Other things from the meeting (not design)

- Magnus said yes to you working on the Vokser website. Lars Martin and Håvard agreed to be interviewed. You are waiting for a reply.
- Peter gave you access to his private GitHub repo that builds on your website work. Reuse any part you like.
