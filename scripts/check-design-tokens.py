#!/usr/bin/env python3
"""Check UI colour, typography and content-spacing declarations without external dependencies.

Run from anywhere: python3 scripts/check-design-tokens.py
Raw design values belong in tokens/base.css. CSS inheritance and customer-selected
preview overrides remain valid. Encoded SVG masks describe opacity, not icon colour.
Documentation text and campaign IDs are not style declarations.
"""
from html import unescape
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TOKENS = ROOT / 'tokens/base.css'
FONT_PROPERTIES = r'font(?:-family|-size|-weight)?|line-height|letter-spacing'
SPACING_PROPERTIES = r'(?:padding|margin)(?:-(?:top|bottom|left|right|inline|block)(?:-start|-end)?)?|(?:row-|column-)?gap'
COLOUR_PROPERTIES = r'color|background(?:-color)?|border(?:-[\w-]+)?|outline(?:-color)?|fill|stroke|(?:box|text)-shadow|accent-color|caret-color|stop-color'
DECLARATION = re.compile(r'(?<![\w-])(' + FONT_PROPERTIES + '|' + COLOUR_PROPERTIES + '|' + SPACING_PROPERTIES + r')\s*:\s*([^;{}]+)')
LITERAL_COLOUR = re.compile(r'#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(|(?<![\w-])(?:white|black|red|blue|grey|gray|yellow|green|orange|purple)(?![\w-])', re.I)
INHERITANCE = {'inherit', 'initial', 'unset', 'revert', 'revert-layer', 'normal'}
failures = []
count = 0


def check_styles(path, source, offset=0):
    global count
    # Remove comments and image payloads before inspecting CSS declarations.
    source = re.sub(r'/\*[\s\S]*?\*/', lambda m: '\n' * m[0].count('\n'), source)
    source = re.sub(r'url\(["\']?data:[^\n]+?\)', 'url(mask)', source)
    for match in DECLARATION.finditer(source):
        prop, value = match[1], unescape(match[2]).strip()
        count += 1
        if re.fullmatch(SPACING_PROPERTIES, prop) and any(abs(float(n)) > 1 for n in re.findall(r'(-?\d+(?:\.\d+)?)(?:px|rem)\b', value)):
            issue = 'literal spacing'
        elif LITERAL_COLOUR.search(value):
            issue = 'literal colour'
        elif re.fullmatch(FONT_PROPERTIES, prop) and 'var(' not in value and value not in INHERITANCE:
            issue = 'literal typography'
        else:
            continue
        line = offset + source[:match.start()].count('\n') + 1
        failures.append(f'{path.relative_to(ROOT)}:{line}: {issue}: {prop}: {value}')


paths = sorted(set(ROOT.glob('*.html')) | set((ROOT / 'portal').glob('*.html')) |
               set((ROOT / 'components').rglob('*.css')) | set((ROOT / 'styles').glob('*.css')) |
               set((ROOT / 'components').rglob('*.js')))
for path in paths:
    source = path.read_text()
    if path.suffix == '.css':
        for mask in re.finditer(r'(?:-webkit-)?mask-image:[^;\n]+', source):
            if re.search(r'\)[^\s]+$', mask[0]):
                failures.append(f'{path.relative_to(ROOT)}: malformed SVG mask declaration')
        check_styles(path, source)
        continue
    # Include inline HTML/SVG styles, including templates built by JavaScript.
    for match in re.finditer(r'<style\b[^>]*>([\s\S]*?)</style>', source):
        check_styles(path, match[1], source[:match.start(1)].count('\n'))
    for match in re.finditer(r'\bstyle="([^"]*)"', source):
        check_styles(path, match[1], source[:match.start(1)].count('\n'))
    for match in re.finditer(r'\b(fill|stroke|stop-color|font-size|font-weight|font-family)="([^"]*)"', source):
        prop, value = match[1], match[2]
        # Dynamic template concatenations are resolved by the application.
        if "'" in value or value in {'none', 'currentColor', 'inherit'} or value.startswith('url(') or 'var(' in value:
            continue
        if LITERAL_COLOUR.search(value) or prop.startswith('font-'):
            line = source[:match.start()].count('\n') + 1
            failures.append(f'{path.relative_to(ROOT)}:{line}: literal SVG style: {prop}={value}')
    for match in re.finditer(r'type="color"[^>]*\bvalue="([^"]+)"', source):
        failures.append(f'{path.relative_to(ROOT)}: colour-input default must reference data-color-token')

# Portal text uses only the --type-* roles in tokens/base.css. A bare font-size, or a weight
# other than normal/semibold emphasis, makes a new text style. Brand previews (ads, the
# landing page, e-mails) copy other designs, so their files or lines say `type-exempt`.
ROLE_SOURCES = sorted(set((ROOT / 'portal').glob('*.html')) | set((ROOT / 'components').rglob('*.css')) |
                      {ROOT / 'styles/layout.css', ROOT / 'styles/portal-mobile.css', ROOT / 'styles/reset.css',
                       ROOT / 'styles/portal-login.css'})
EMPHASIS = {'var(--font-weight-normal)', 'var(--font-weight-semibold)', 'var(--font-weight-emphasis)', 'inherit', 'normal'}
role_failures = []
for path in ROLE_SOURCES:
    raw = path.read_text()
    if 'type-exempt: file' in raw:
        continue
    blocks = [(raw, 0)] if path.suffix == '.css' else [
        (m[1], raw[:m.start(1)].count('\n')) for m in re.finditer(r'<style\b[^>]*>([\s\S]*?)</style>', raw)]
    for source, offset in blocks:
        lines = source.split('\n')
        clean = re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m[0]), source)
        for match in re.finditer(r'(?<![\w-])(font-size|font-weight|font)\s*:\s*([^;{}]+)', clean):
            prop, value = match[1], match[2].strip()
            row = clean[:match.start()].count('\n')
            if 'type-exempt' in lines[row]:
                continue
            if prop == 'font' and (re.fullmatch(r'var\(--type-[\w-]+\)', value) or value == 'inherit'):
                continue
            if prop == 'font-size' and value == 'inherit':
                continue
            if prop == 'font-weight' and value in EMPHASIS:
                continue
            role_failures.append(f'{path.relative_to(ROOT)}:{offset + row + 1}: not a type role: {prop}: {value}')
failures += role_failures

# Catch broken references inside the central token graph as well.
base = TOKENS.read_text()
names = set(re.findall(r'(--[\w-]+)\s*:', base))
for ref in set(re.findall(r'var\(\s*(--[\w-]+)', base)) - names:
    failures.append(f'tokens/base.css: undefined token {ref}')
if failures:
    print('\n'.join(failures))
    sys.exit(1)
print(f'PASS: {count} style declarations across {len(paths)} sources; no hard-coded UI colours, typography or content spacing.')
