# Judge my design: share for approval

22 Oct 2026. Branch `layout-og-pakker`, uncommitted changes.

I have never seen this product before. I play a new customer: Kari at a recruitment agency, plus her leader who gets the link.
I did not know who the pages are mainly for, so I assume **both new and existing customers**.

I walked: Opprett kampanje (step 1–4) → send plan for approval → e-mail → approval page → approve → order → Kampanje bestilt → Kampanje under arbeid → Aktiv kampanje.

---

## 1. Opprett kampanje, step 4 «Se over og bestill» (`portal/ny-kampanje.html`)

**1.1 Two ways to ask for approval**
- **What I saw:** The comment field still says «… eller om kunden skal godkjenne annonsen». Right below is a real approval button. Which one do I use?
- **Why it matters:** If I write it in the comment, Frantz waits for something the system does not track.
- **What to change:** Placeholder: «Noe mer Frantz bør vite. F.eks. hvem dere vil nå.»
- **Tag:** `no-brainer`

**1.2 «Bestill kampanjen» turns off with no reason**
- **What I saw:** After I sent the request, the order button went grey. No text says why. The section was framed as optional («Trenger noen andre å se over først?»).
- **Why it matters:** I think the page is broken. I do not know I must wait, or that «Trekk tilbake» unlocks it.
- **What to change:** Show a line under the button: «Venter på svar fra Test Leder. Du kan bestille når planen er godkjent, eller trekke tilbake forespørselen.» Also ask: should approval block ordering at all? (See client questions.)
- **Tag:** `test it`

**1.3 Two send buttons at once**
- **What I saw:** After sending, «Send planen til godkjenning» stays. The status card also has «Send ny forespørsel». What is the difference?
- **Why it matters:** I may send two requests to the same leader.
- **What to change:** Hide the first button once a request exists. Keep only the status card with its own actions.
- **Tag:** `test it`

**1.4 The form opens inline, with prototype notes**
- **What I saw:** The form expands under its button. It has three more toggles: «Legg til en melding», «Om prototypen», «Test i prototypen».
- **Why it matters:** This is the expanding-panel pattern you want to avoid. The prototype notes also show in a client demo.
- **What to change:** Show the message field always (it is one field). Move all prototype notes to one place, for example the demo bar at the top.
- **Tag:** `test it`

## 2. E-mail and approval page (`portal/godkjenning.html`)

**2.1 The e-mail has no price**
- **What I saw:** «Kari Hansen ber deg godkjenne kampanjeplanen». No amount, no period.
- **Why it matters:** The leader decides on money. They must click before they know whether it is a 2-second yes.
- **What to change:** Add one line: «30 000 kr eks. mva · 05.10–25.10 · Meta, LinkedIn, Nettsteder og aviser».
- **Tag:** `test it`

**2.2 «Arbeidsgiver: Ikke oppgitt»**
- **What I saw:** An empty row in the plan the leader approves.
- **Why it matters:** It looks unfinished. A client stops there in a demo.
- **What to change:** Hide empty rows. Fix the dummy data so the employer is filled in.
- **Tag:** `no-brainer`

**2.3 The most useful number is missing**
- **What I saw:** Budget and channels, but no package name and no «Forventet «Søk» 14–18».
- **Why it matters:** The leader asks «what do we get for 30 000?». The portal knows the answer but does not tell them.
- **What to change:** Add «Pakke: Mellom» and «Forventet «Søk»: 14–18» to the plan box.
- **Tag:** `test it`

**2.4 The leader is asked twice**
- **What I saw:** The ad is shown «til orientering». «Ferdige annonser godkjennes i en egen runde før publisering.» But the ad looks finished. I uploaded it myself.
- **Why it matters:** The leader thinks they approved the ad. Then a second e-mail comes. Why two rounds?
- **What to change:** When the customer brings finished material, approve plan and ad in one request. Keep two rounds only when Frantz makes the ads.
- **Tag:** `test it`

**2.5 The answer is at the very bottom**
- **What I saw:** «Godkjenn kampanjeplanen» comes after a long ad preview. The page also says «Versjon 1», and «30 000 kr» where the portal says «kr 30 000».
- **Why it matters:** The main action is below two screens of scrolling. «Versjon» is an internal word for a first-time visitor.
- **What to change:** Put the total and the two answer buttons right under the plan box, above the ad. Replace «Versjon 1» with «Sendt 22.10 kl. 09.06». Use one price format.
- **Tag:** `test it`

## 3. Kampanje bestilt (`portal/kampanje-bestilt.html`)

**3.1 The timeline tells a different story**
- **What I saw:** I uploaded my own ad. The timeline says «Frantz lager annonsene» and «Du ser annonsene før de publiseres».
- **Why it matters:** I wonder if my upload got lost.
- **What to change:** When material is uploaded: «Frantz sjekker annonsen og setter opp målrettingen.»
- **Tag:** `test it`

**3.2 The plan approval sits under «Annonse og materiell»**
- **What I saw:** The plan card is inside the ad section. It still offers «Send ny forespørsel» for a plan that is already ordered.
- **Why it matters:** What does a new request do now? Change the order?
- **What to change:** Move it to «Bestillingen» as one row: «Godkjent av Test Leder 22.10 kl. 09.06». Remove the resend button after ordering.
- **Tag:** `test it`

## 4. Kampanje under arbeid (`portal/kampanje-under-arbeid.html`)

**4.1 Three ways to approve the ads**
- **What I saw:** «Godkjenn annonsene», «Send annonsene til godkjenning», and «svare OK på e-posten». Which one counts?
- **Why it matters:** If my leader and I both answer, who wins?
- **What to change:** Keep «Godkjenn annonsene» and «Be om endring» as buttons. Make sharing a link under them: «Skal noen andre godkjenne? Send dem en lenke.»
- **Tag:** `test it`

**4.2 A weak «done» moment**
- **What I saw:** After the click, the button goes grey. Small text: «Materiellet er godkjent. Frantz følger opp publisering i et eget steg.» The old text said the start date.
- **Why it matters:** «Materiellet» and «eget steg» do not tell me when it goes live. The other buttons stay active.
- **What to change:** «Takk! Annonsene er godkjent. Kampanjen starter 05.10.» Hide the other buttons.
- **Tag:** `test it`

## 5. Aktiv kampanje (`portal/campaign.html`)

**5.1 Approve ads that are already live?**
- **What I saw:** «Send annonsene til godkjenning» in the header of a running campaign, next to «Kopier rapportlenke».
- **Why it matters:** The ads are already out. What does approval change now?
- **What to change:** Show it only when there are new ads that are not yet approved.
- **Tag:** `test it`

## 6. Across all pages

**6.1 Four names for one action**
- «Del for godkjenning», «Send planen til godkjenning», «Send annonsene til godkjenning», «Del annonsemateriellet for godkjenning». Pick one pattern: «Send [ting] til godkjenning».
- **Tag:** `no-brainer`

**6.2 The browser shows the old styles**
- `components/del-godkjenning/approval.css` changed (dialog → inline), but every page still loads `?v=1`. My browser kept the old file. The «Send forespørsel» button sat on top of its text.
- Change to `?v=2` in all five pages before you show it. Do the same for the `approval-*.js` files.
- **Tag:** `no-brainer`

---

## How to work on the «test it» points

- Do not break the current version. Keep it as variant A.
- Build variant B the way you think is best.
- Do the task yourself in both. Write down what felt natural.
- Then you can tell the client: «I tested both, and B is more natural because…».

## Questions for the client

- `[GAP]` Must the plan be approved before Kari can order? Or is approval only a nice-to-have?
- `[GAP]` Who approves the ads: Kari, her leader or her customer, or all of them? Is one round enough when the customer sends finished ads?
- `[GAP]` When an agency sends the plan to its own customer, may that customer see Frantz's price? The agency may add its own margin.
- `[GAP]` How long is the link valid? The page says 7 days (until 29.10). The old text said 14 days.
- `[GAP]` Does the period change the package price? «Mellom» costs kr 30 000 for both 3 and 6 weeks, but the forecast goes from 14–18 to 17–24 «Søk».

## Close

- **Works well:** The plan is frozen as a version and resets when Kari changes something. The sender sees the answer at once. The approver page says plainly that approval does not place the order, and no login is needed.
- This is a gut reaction from someone without your context. Test it, do not just obey it.
