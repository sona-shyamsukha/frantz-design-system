# frantz-design-system

Standalone, no-build design system for the Frantz portal redesign. Tokens → semantic roles → components. This repo is self-contained.

Brand values come from the kampanjeportal POC and `design.md`.

Icons are Lucide (MIT), shipped as CSS masks in `components/icon/`. No npm. No other design-system repo.

## Browse

```
python3 -m http.server 8080
```

| File | What |
|---|---|
| [kom-i-gang.html](kom-i-gang.html) | How to add the design system to your own project |
| [style-guide.html](style-guide.html) | Token spec — palette, type, icons, space, rules |
| [component-library.html](component-library.html) | Component catalog. Each component: what it is, preview, files it needs, technical details, code to copy |
| [portal-redesign.html](portal-redesign.html) | Overview of the campaign portal prototype |
| [portal/login.html](portal/login.html) | Start of the portal. The demo is fixed to 30.09.2026, and the logged-in user is Kari Hansen, Vokser AS |
| [losninger.html](losninger.html) | Every finding from the interviews, with status and a link to where it is shown |

Open **http://127.0.0.1:8080/style-guide.html**

Portal screens live in `portal/`. Shared mock data is in `portal/data/frantz-data.js`.

## Campaign flow

- [Main campaign flow](portal/ny-kampanje-v2.html): selected default for the portal’s campaign buttons and entry points.
- [Previous design — backup for user testing](portal/ny-kampanje.html): retained as an alternative if testing reveals that the main flow is difficult to understand.

## Approval prototype

`Send planen til godkjenning` and `Send annonsene til godkjenning` expand an inline recipient form beside the campaign material. One name and email are required.
Campaign-plan approval is available on the last creation step; material approval is
available on campaign pages and on locally submitted orders with creative material.
The recipient opens `godkjenning.html?request=...` without signing in. Each request
stores an immutable version of the plan and creative, including original uploaded
images, video, custom logos and crop settings. Replies persist and refresh the sender's
view across tabs. Revised plans require a fresh request; ordering remains a separate action.

This is a browser-local demonstration using IndexedDB, with simulated emails and
notifications. Use `Se e-posten` to test the email-to-approval journey in the same
browser and origin. Links cannot deliver saved files to another device. A production
implementation needs server-side storage, access enforcement and email delivery;
the local identifiers and recipient labels do not verify the approver's identity.
Existing example campaigns include all displayed ads in one request, with the same names, channels and media types. Feedback identifies which ad needs changes; there is no subset-selection step. Example previews are labelled as example content. New orders use their actual
submitted creative rather than substituting sample artwork. No request automatically
places an order or publishes a campaign.

## Use

```html
<link rel="stylesheet" href="frantz-ds.css">
<script src="components/js/interactions.js" defer></script>
```

POC class names still work: `btn--kvit`, `card--betjen`, `pill--aktiv`, `advarsel`, `nokkel`, `fakta`.

Datepicker, tooltip, breadcrumb and pagination live in the component library. Datepicker needs `interactions.js`.

```html
<span class="icon-lucide icon-lucide--house" aria-hidden="true"></span>
```

## Constraints

- Navy = default primary. Amber = one key action per screen. Never white text on amber.
- Radius: full pill on buttons. 8px fields, 12px panels, 16px cards.
- Page titles: Montserrat 700. Section headings and labels: 600. Body: 400.
- Error: `#B3261E`. Page surface is white.

## Check design tokens

Run `python3 scripts/check-design-tokens.py` before handing off style changes.
Colour values, typography defaults and shared spacing roles belong in `tokens/base.css`. Components,
page styles, inline examples and generated SVG labels use those variables or inherit.
Content spacing uses the shared roles for card padding, section gaps, form fields and labels.
Customer-selected preview colours and uploaded fonts remain editable; their initial
values come from the tokens. SVG mask payloads only define opacity; icon colours
come from the component CSS.

## Portal responsiveness

`styles/portal-mobile.css` holds shared portal adaptations: phone layouts below 640px,
compact navigation and packages below 860px, and the campaign summary shortcut below
1180px when the order panel moves under the form. Keep package markup shared through
`portal/data/pakker.js`. Check phone widths of 320px and 390px, tablet widths of 768px
and 1024px, and the desktop layout when changing these rules.
