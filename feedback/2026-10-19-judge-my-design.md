# Judge my design – round 2 (19 Oct 2026)

I have never seen this product before. I walked it as a **new customer** (`dashboard.html?bruker=ny`), at phone width, with the demo «Lenke og tekst». I also looked at Hjem as an existing customer.

Peter's points from 16 Oct are mostly done: «Ny kampanje» sits top right on every page, «Lim inn bestillingen» is gone, «Bestill» only appears on the last button, and «Hva er en kampanje?» explains the word.

---

## 1. Hjem (new customer)

**What I saw:** There are three ways to start: the top button «Ny kampanje», the big banner «Lag første kampanje», and «Start nå» in Kom i gang. Do I need all three?
**Why it matters:** They go to the same place, so it is not dangerous. But the banner brings back the "big hero on Hjem only" that Peter asked you to remove.
**What to change:** Keep the banner only for new customers with zero campaigns. Remove «Start nå» from the checklist row, or make the row itself the link.
**Tag:** `test it`

## 2. Ny kampanje, step 1 «Stillingen»

**What I saw:** After «Fyll ut skjemaet», I landed straight in step 2. I never saw what Frantz read from my text.
**Why it matters:** The user does not get the moment "Frantz understood me". They also miss that Frantz picked things for them (see point 4).
**What to change:** Stay on step 1 and show the result «Stemmer det? Rett det som ikke stemmer.» first. Let the user press «Neste» themselves.
**Tag:** `test it`

## 3. Ny kampanje, step 2 «Kampanjen» – packages

**What I saw:** «Bruk en av pakkene dine». I am a new customer. Which packages are "mine"? I never made any.
**Why it matters:** Liten / Mellom / Stor look like Frantz's own price list, not my saved setups. The page «Lagrede pakker» says «Bare du ser pakkene dine», which makes it more confusing.
**What to change:** Decide what a package is. Either Frantz's standard offer («Frantz-pakker»), or my own saved setups («Mine oppsett»). For a new customer with no saved setups, show the standard ones and call them that.
**Tag:** `test it`

**What I saw:** «Liten – kr 15 000 for 3 uker». Below it, «Periode» still says 4 weeks and lets me pick 6 weeks.
**Why it matters:** Do I get 6 weeks for kr 15 000? That is a deal the system did not mean to give. The text below also still says «Med kr 15 000 over 4 uker på LinkedIn og Meta», but Liten has no LinkedIn.
**What to change:** When a package is picked, lock or hide «Periode», or show the new price when the period changes. Update the forecast text from the chosen package.
**Tag:** `no-brainer`

**What I saw:** The three packages only differ by channels and weeks. Why pick Mellom over Liten?
**Why it matters:** The user buys "Søk", not channels. The value is not shown.
**What to change:** Add the forecast to each package: «ca. 9–12 trykker «Søk»». Mark one as «Mest valgt».
**Tag:** `test it`

**What I saw:** After I clicked «Bruk en av pakkene dine», both choice cards looked almost selected.
**What to change:** Make only one card look selected. Use the same selected style as the radio packages.
**Tag:** `no-brainer`

## 4. Ny kampanje – the kr 8 000 nobody asked for

**What I saw:** Step 2 says budget kr 15 000. The footer says «Din bestilling kr 23 000». Why?
**Why it matters:** The demo text contains the word «rådgivning», so the form silently ticked «Strategisk rådgivning + kr 8 000» in step 3. The user has not even seen step 3. This is an accidental dark pattern. A careful buyer stops here.
**What to change:** Never tick a paid extra from free text ([ny-kampanje.html:911](../portal/ny-kampanje.html)). Suggest it instead: «Dere nevnte rådgivning. Vil dere legge til Strategisk rådgivning (+ kr 8 000)?». Free extras can still be ticked.
**Tag:** `no-brainer`

**What I saw:** In the order sheet, «Tillegg + kr 8 000» does not say what it is.
**What to change:** Show the name: «Strategisk rådgivning + kr 8 000».
**Tag:** `no-brainer`

## 5. Ny kampanje, step 3 «Annonsen»

**What I saw:** «Lag annonsen her (Gratis)», «Legg til design av materiell (Fra kr 2 180 / time)» and the add-on «Tekstproduksjon (Inkludert)». Who writes the text? What is the difference?
**Why it matters:** Two doors to the same room. «Frantz har laget et forslag» already sounds like Frantz wrote the text. So why tick «Tekstproduksjon»? And if it is included, what happens if I do not tick it?
**What to change:** Remove «Tekstproduksjon» as a checkbox. Say it once under the materiell choice: «Frantz skriver teksten. Det er inkludert.»
**Tag:** `test it`

**What I saw:** «Fra kr 2 180 / time» with no end.
**Why it matters:** An open hourly price feels like a blank cheque.
**What to change:** Give a normal range: «Vanligvis 2–4 timer (ca. kr 4 400–8 700). Dere får prisen før vi starter.» [GAP]
**Tag:** `test it`

**What I saw:** Step 4 says «En rådgiver i Frantz går gjennom bestillingen». Step 3 sells «Strategisk rådgivning – en rådgiver går gjennom målgruppe, kanaler og budsjett» for kr 8 000.
**Why it matters:** What do I get for kr 8 000 that I do not get for free?
**What to change:** Say the difference in one line: «Gratis: vi sjekker bestillingen. Rådgivning: et 30-minutters møte før start.» [GAP]
**Tag:** `test it`

## 6. Ny kampanje, step 4 «Se over og bestill»

**What I saw:** On phone, the total is only in the footer. «Materiell: Eget materiell» shows, but I never chose it. It was the default.
**What to change:** Show «Totalsum kr 23 000» as the last row in the review, above «Kommentar». Make sure defaults the user did not touch are visible as defaults, or ask the user to pick.
**Tag:** `test it`

**What I saw:** «Bestill kampanjen». How do I feel at the click? Is it binding? Can I cancel? When do I pay?
**What to change:** Add one line under the button: «Ingenting publiseres før dere har godkjent annonsene. Dere kan avbestille frem til da.» [GAP]
**Tag:** `test it`

## 7. Kampanjer (new customer)

**What I saw:** «Ingen kampanjer ennå». But I just started a draft (Kampanje #129075, «Lagres av seg selv»). Where is it?
**Why it matters:** The user thinks the draft is lost. Hjem shows drafts for existing users, but Kampanjer does not.
**What to change:** Show drafts in Kampanjer with the badge «Kladd» and the button «Fortsett».
**Tag:** `no-brainer`

**What I saw:** «Kampanjene **du** har bestilt» and «Opprett **deres** første kampanje» on the same card.
**What to change:** Pick one. The rest of the portal uses «dere».
**Tag:** `no-brainer`

---

## How to work on the "test it" points

- Do not break the current version. Keep it as variant A.
- Build variant B the way you think is best.
- Do the task yourself in both. Write down what felt natural.
- Then you can tell Frantz: "I tested both, and B is more natural because…".

## Questions for the client

- [GAP] Are Liten / Mellom / Stor Frantz's standard offer, or setups each user saves?
- [GAP] What does a package cost if the user changes the period?
- [GAP] What is in «Strategisk rådgivning» that the free review does not cover?
- [GAP] How many design hours does a normal campaign need?
- [GAP] When is an order binding? Until when can a customer cancel? When is the invoice sent?

## Close

- What works well: the fixed «Ny kampanje» button, the reading of free text into a form, the live forecast in «Søk», and «Hva er en kampanje?» on Hjem.
- This is a gut reaction from someone without your context. Test it, do not just obey it.
