"""Embed the screenshots used in report.html as small JPEG data URIs.

The report is often sent as a single file, so images in screenshots/ would not travel with it.
Run from this folder after changing the findings: python3 embed-images.py
"""
import base64
import json
import re
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
REPORT = HERE / 'report.html'
START, END = '<!-- images:start -->', '<!-- images:end -->'
MAX_WIDTH = '900'

html = REPORT.read_text()
names = sorted(set(re.findall(r"img: '([^']+)'", html)))

images = {}
with tempfile.TemporaryDirectory() as tmp:
    for name in names:
        out = Path(tmp) / (Path(name).stem + '.jpg')
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '70',
                        '--resampleWidth', MAX_WIDTH, str(HERE / 'screenshots' / name), '--out', str(out)],
                       check=True, capture_output=True)
        images[name] = 'data:image/jpeg;base64,' + base64.b64encode(out.read_bytes()).decode()

block = f"{START}\n<script>window.IMAGES = {json.dumps(images)};</script>\n{END}"
if START in html:
    html = re.sub(re.escape(START) + '.*?' + re.escape(END), lambda _: block, html, flags=re.S)
else:
    html = html.replace('<script>\n// Who:', block + '\n<script>\n// Who:', 1)
REPORT.write_text(html)
print(f'Embedded {len(images)} images. Report is {REPORT.stat().st_size // 1024} KB.')
