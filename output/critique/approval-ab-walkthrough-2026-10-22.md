# Share for approval: A/B walkthrough, 22 October 2026

**Later decision, 22 October:** Sona confirmed that approval must not pause ordering. B now lets the customer order in every approval state. A matching pending request follows the order; later approval/feedback updates its receipt without amending the order. The observations below describe the earlier A/B walkthrough before this decision.

Local design experiment on the existing checkout. This is a designer/agent walkthrough, not user research or client approval. No real emails, orders or publishing. Start at `/portal/godkjenning-sammenligning.html`.

## Recommendation and tradeoff

Use B's combined request when the customer has prepared the ad themselves. Keep a separate later proof request when Frantz designs the ad. The two approval types still exist, but a finished, unchanged ad is not sent twice.

B makes the request's scope explicit and places its response above the creative, reachable from the creative with a return link. This makes actions easier to find, but also allows answering before inspecting the creative. The walkthrough cannot establish whether people inspect every format. Test that with intended approvers before choosing the final placement.

Keep contextual inline sharing: the customer previously found the modal disconnected. B keeps the recipient fields beside the task, shows the optional message immediately, and removes the nested prototype disclosures. The cost is a taller inline form, particularly on a phone.

## A compared with B: observed tasks

| Task | A observed | B observed |
|---|---|---|
| Prepare the same campaign | Sykepleier, Kristiansand, Sørlandet Helse; Mellom; kr 30 000; 12.10–08.11; library photo `team-vaktrommet.jpg`; suggested copy | Same inputs and creative |
| Share | Name/email required; message and prototype information behind separate disclosures | Name/email and message together; demo tools in one top bar |
| Wait | Ordering disabled without an explanation beside the order action | Named waiting message explains approval or withdrawal; order remains disabled |
| Email | No amount/period/channel summary | kr 30 000, period and channels are visible before opening |
| Recipient review | Ad is shown but explicitly excluded from plan approval; no package/forecast; response after creative | Plan and ad explicitly included; package Mellom and actual forecast 15–20 shown; response before creative; previews retained |
| Approve and order | Reply enables order. Confirmation still offers a separate ad request and shows plan actions in the material section | Reply enables order. Order records who approved plan and ads under Bestillingen. No resend action or second request for the unchanged material |
| Frantz creates the design | A's source retains its two-round model; this separate A route was not replayed in this pass | Plan-only request has no false finished-ad preview; design billed separately is explained. After plan approval and ordering, same campaign identity, budget and period carry into the later material stage |
| Request a plan change | Not repeated in A in this pass | Approver requests Liten instead of Mellom. Sender sees exact comment; revised request shows Liten, kr 18 000, forecast 9–12, and matching channels. Old response cannot be approved again |
| Revise while waiting | Not replayed in A; source had carried disabled footer state from the last step | Found and fixed in B: earlier Next buttons remain enabled, ordering still waits; returning to final step does not restore a duplicate share button |
| Customer approves ads themselves | Existing page's local click only disabled the button; source also offered email OK | Own approval is stored, survives reload, updates heading/checklist, and hides reply/delegation actions |
| Another person approves ads | Existing A journey was inspected with a saved changes-requested state | While delegated request is pending, own reply buttons are disabled. External approval completes the stage without another customer signoff. All three ads and campaign-page preview remain included |
| Customer requests ad changes | Not replayed in A in this pass | Named-ad comment is saved and shown; no approval confirmation or automatic publication |
| Withdraw | Not replayed in A in this pass | Phone-width form sends via Enter. Withdrawal re-enables own material decision; old recipient link hides content and says it was withdrawn |
| Active campaign | Approval trigger visible on current A page | Approval trigger absent for the already-live sample campaign |

The package forecasts above are existing prototype calculations, not verified Frantz performance promises. Sample campaign dates use the portal's existing 30.09.2026 demo clock; request/audit times use the real local time. A/B comparison does not validate pricing rules.

## Coverage of the pasted feedback

- 1.1, 2.2, 6.2: current A already has the revised comment placeholder, hides empty employer/location rows, and loads approval assets at v3. B retains these corrections; B-specific assets use a separate v2.
- 1.2: B explains the wait before sending and at the order action. Keeps A's conditional blocking rule as a hypothesis.
- 1.3: B hides the original trigger after sending, including when returning from an earlier step.
- 1.4: B shows the optional message field; all general prototype instructions and test email links are in Demoverktøy. Sample-creative labels remain visible so example graphics are not mistaken for real produced files.
- 2.1–2.3: email summary, consistent `kr 30 000`, empty-row handling, actual package name/forecast. Additional design charges are explicit on the design route.
- 2.4: one combined request for customer-prepared creative; plan then proof when Frantz creates it. This is B's proposed business rule, not a confirmed requirement.
- 2.5: response above preview; anchor links between review and reply; sent date replaces visible version number. Stored versions remain intact.
- 3.1: supplied-material timeline says Frantz checks the ad and targeting; completed approval is marked completed. Frantz-designed route retains the later proof task.
- 3.2: read-only approval receipt under Bestillingen; no plan resend after ordering.
- 4.1: two main decisions plus a quieter sharing link. Removes email OK as a competing route. Name/email remain required for one external person.
- 4.2: persistent confirmation, planned start and Frantz's next action; replies/delegation hidden after approval. Planned start is not a guarantee of publication.
- 5.1: no approval trigger for unchanged already-live ads. A workflow for creating new ads inside a live campaign is outside this experiment; it is not simulated by approving old ads.
- 6.1: `Send [planen / plan og annonser / annonsene] til godkjenning` follows the request's scope.

## Preliminary judgment

B removes the clearest contradictions in the walkthrough: an apparently finished ad excluded from approval, a repeat request after ordering, and an unexplained disabled order action. The tall inline form and actions above creative still need observation with actual customers/approvers. Do not tell the client that B is proven more natural; describe it as the proposed direction and show the task comparison.

## Open client decisions

1. **Resolved by Sona after the walkthrough:** sharing is optional and must not block ordering. B now follows this decision.
2. Can customer-prepared creative receive final clearance with the plan? B assumes yes. One invited approver remains Sona's chosen prototype scope.
3. May an agency's customer see Frantz's purchase price? B shows it; agency margin/price-hiding is unresolved.
4. Is seven days the right link validity? B inherits seven days; no client rule is established.
5. Is the current price/duration/forecast relationship correct? Existing calculations are reused without inventing a new commercial rule.

## Checks and limits

- Real in-app browser: prepared-material A/B; B design order, budget revision, own and delegated material replies, feedback, withdrawal, reload, same-order identity at later proof stage, active campaign action removal.
- Mobile: 320px iframe form check; required labels and visible controls; keyboard Enter submission; withdrawal. Desktop: actual 1280px browser views. This is not a complete responsive test suite.
- 16 Node checks pass for approval state, originals/snapshots and B's conditional scope/gating rules. B modules and inline page scripts parse. HTML IDs are unique and static local references resolve.
- Design tokens: B CSS uses existing semantic tokens. Global checker retains pre-existing warnings; the copied B campaign page inherits A's 360px summary-layout spacing warning. Do not report the global checker as clean.
- Accessibility: explicit labels, heading structure, status feedback, focus after reply and keyboard submission checked. No screen-reader session or full contrast/zoom audit; no claim of WCAG conformance.
- Brand: existing Frantz typography, navy/amber and shared portal/ad components reused. No new motion.
- A sources are unchanged against `approval-a-baseline.json` captured at the start. B approval/material databases and campaign/draft/order keys are isolated. The A browser walkthrough adds a normal simulated test order; no existing stored data was deleted.
- Server-backed delivery/access, real emails, identity checks, cross-device links and publication remain outside the local prototype. No commit, deployment or client send.

## Follow-up verification: ordering without waiting

After Sona removed the ordering pause, a fresh B campaign was shared while pending. The order action remained enabled, and the order was submitted before any reply. The confirmation retained the pending request. Approval submitted afterward updated Bestillingen to show the approver and answer time without changing the order, and persisted after reload. All 16 related checks pass; A remains preserved. The user's in-progress tab was left intact while this was checked in a separate tab.
