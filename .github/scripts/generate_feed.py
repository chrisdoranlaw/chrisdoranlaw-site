"""Regenerates feed.xml (RSS 2.0) from every blog post's own HTML.
Run manually after adding/editing posts: python .github/scripts/generate_feed.py
"""
import os
import re
import glob
from datetime import datetime, timezone
from xml.sax.saxutils import escape

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE = "https://www.chrisdoranlaw.com"

posts = []
for path in sorted(glob.glob(os.path.join(ROOT, "blog", "*", "index.html"))):
    slug = os.path.basename(os.path.dirname(path))
    with open(path, "r", encoding="utf-8") as fh:
        html = fh.read()

    if 'article class="post"' not in html:
        continue

    title_m = re.search(r"<h1 class=\"page-title\">(.*?)</h1>", html, re.S)
    desc_m = re.search(r'<meta name="description" content="(.*?)">', html, re.S)
    date_m = re.search(r"Posted (\d{1,2})/(\d{1,2})/(\d{4})", html)
    canon_m = re.search(r'<link rel="canonical" href="(.*?)">', html)

    if not (title_m and date_m):
        continue

    title = re.sub(r"<.*?>", "", title_m.group(1)).strip()
    desc = desc_m.group(1).strip() if desc_m else ""
    url = canon_m.group(1).strip() if canon_m else f"{SITE}/blog/{slug}"
    month, day, year = date_m.groups()
    pub_date = datetime(int(year), int(month), int(day), 12, 0, 0, tzinfo=timezone.utc)

    posts.append({"title": title, "desc": desc, "url": url, "date": pub_date, "slug": slug})

posts.sort(key=lambda p: p["date"], reverse=True)

items = []
for p in posts:
    items.append(f"""    <item>
      <title>{escape(p['title'])}</title>
      <link>{escape(p['url'])}</link>
      <guid>{escape(p['url'])}</guid>
      <pubDate>{p['date'].strftime('%a, %d %b %Y %H:%M:%S %z')}</pubDate>
      <description>{escape(p['desc'])}</description>
    </item>""")

now = datetime.now(timezone.utc).strftime('%a, %d %b %Y %H:%M:%S %z')
feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Chris Doran Law LLC Blog</title>
    <link>{SITE}/blog</link>
    <description>Legal guidance for North Vernon and Jennings County, Indiana residents on criminal defense, family law, estate planning, and small claims/eviction matters.</description>
    <language>en-us</language>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""

out_path = os.path.join(ROOT, "feed.xml")
with open(out_path, "w", encoding="utf-8") as fh:
    fh.write(feed)

print(f"Wrote {out_path} with {len(posts)} posts.")
