# frantz-design-system

No-build design system for the Frantz portal redesign. Architecture follows [vokser-ds](https://github.com/sona-shyamsukha/vokser-ds): tokens → semantic → components.

Brand values come from the kampanjeportal POC and `design.md`.

## Browse

```
python3 -m http.server 8080
```

| File | What |
|---|---|
| [style-guide.html](style-guide.html) | Token spec — palette, type, space, rules |
| [component-library.html](component-library.html) | Component catalog — variants + HTML |

Open **http://127.0.0.1:8080/style-guide.html**

## Use

```html
<link rel="stylesheet" href="frantz-ds.css">
<script src="components/js/interactions.js" defer></script>
```

POC class names still work: `btn--kvit`, `card--betjen`, `pill--aktiv`, `advarsel`, `nokkel`, `fakta`.

## Constraints

- Navy = default primary. Amber = one key action per screen. Never white text on amber.
- Radius: 8px controls, 12px panels, 16px cards.
- Montserrat 700 + negative tracking on headings.
- Error: `#B3261E`. Page surface is white.
