"""Crawls every .html file in the repo and flags internal href/src targets
that don't resolve to a real file. Run from anywhere; ROOT is computed from
this script's own location (repo_root/.github/scripts/audit_links.py)."""
import os
import re
import sys
from urllib.parse import urlparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in (".git", ".github")]
    for fn in filenames:
        if fn.endswith(".html"):
            html_files.append(os.path.join(dirpath, fn))

href_re = re.compile(r'href="([^"]+)"')
src_re = re.compile(r'src="([^"]+)"')

broken_internal = []
external_links = set()
total_internal = 0
total_external = 0
total_images = 0
broken_images = []


def resolve(base_dir, url):
    clean = url.split("#")[0].split("?")[0]
    if not clean:
        return None
    if clean.startswith("/"):
        return os.path.normpath(os.path.join(ROOT, clean.lstrip("/")))
    return os.path.normpath(os.path.join(base_dir, clean))


for f in html_files:
    with open(f, "r", encoding="utf-8") as fh:
        content = fh.read()
    base_dir = os.path.dirname(f)

    for m in href_re.finditer(content):
        url = m.group(1)
        if url.startswith("#") or url.startswith("mailto:") or url.startswith("tel:"):
            continue
        if "${" in url:
            # JS template-literal placeholder inside an inline <script>, not a real path
            continue
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https"):
            total_external += 1
            external_links.add(url)
            continue
        total_internal += 1
        resolved = resolve(base_dir, url)
        if resolved is None:
            continue
        if not os.path.exists(resolved):
            broken_internal.append((f, url, resolved))

    for m in src_re.finditer(content):
        url = m.group(1)
        parsed = urlparse(url)
        if parsed.scheme in ("http", "https") or url.startswith("data:"):
            continue
        total_images += 1
        resolved = resolve(base_dir, url)
        if resolved is None:
            continue
        if not os.path.exists(resolved):
            broken_images.append((f, url, resolved))

print(f"HTML files scanned: {len(html_files)}")
print(f"Internal links checked: {total_internal}")
print(f"Image/script src checked: {total_images}")
print(f"External links found: {total_external} ({len(external_links)} unique)")
print()
print(f"=== BROKEN INTERNAL LINKS: {len(broken_internal)} ===")
for f, url, resolved in broken_internal:
    rel_f = os.path.relpath(f, ROOT)
    print(f"  {rel_f}  ->  href=\"{url}\"")

print()
print(f"=== BROKEN IMAGE/SCRIPT SRC: {len(broken_images)} ===")
for f, url, resolved in broken_images:
    rel_f = os.path.relpath(f, ROOT)
    print(f"  {rel_f}  ->  src=\"{url}\"")

if broken_internal or broken_images:
    sys.exit(1)
