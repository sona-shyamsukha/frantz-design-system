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
| [style-guide.html](style-guide.html) | Token spec — palette, type, icons, space, rules |
| [component-library.html](component-library.html) | Component catalog — variants + HTML |

Open **http://127.0.0.1:8080/style-guide.html**

## Use

```html
<link rel="stylesheet" href="frantz-ds.css">
<script src="components/js/interactions.js" defer></script>
```

POC class names still work: `btn--kvit`, `card--betjen`, `pill--aktiv`, `advarsel`, `nokkel`, `fakta`.

```html
<span class="icon-lucide icon-lucide--house" aria-hidden="true"></span>
```

## Constraints

- Navy = default primary. Amber = one key action per screen. Never white text on amber.
- Radius: 8px controls, 12px panels, 16px cards.
- Montserrat 700 + negative tracking on headings.
- Error: `#B3261E`. Page surface is white.
