"""Adds/refreshes <lastmod> on every <url> in sitemap.xml.
Blog posts use their own visible Posted/Updated date (editorial timeline,
more meaningful than a commit date). Everything else uses that file's most
recent git commit date. Run manually after content changes:
python .github/scripts/generate_sitemap_lastmod.py
"""
import os
import re
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE = "https://www.chrisdoranlaw.com"


def url_to_filepath(url):
    path = url.replace(SITE, "").strip("/")
    if not path:
        return os.path.join(ROOT, "index.html")
    return os.path.join(ROOT, path, "index.html")


def blog_post_date(html):
    date_m = re.search(r"Posted (\d{1,2})/(\d{1,2})/(\d{4})", html)
    update_m = re.search(r"Updated (\d{1,2})/(\d{1,2})/(\d{4})", html)
    m = update_m or date_m
    if not m:
        return None
    month, day, year = m.groups()
    return f"{year}-{int(month):02d}-{int(day):02d}"


def git_commit_date(filepath):
    rel = os.path.relpath(filepath, ROOT)
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cd", "--date=format:%Y-%m-%d", "--", rel],
            cwd=ROOT, capture_output=True, text=True, check=True
        ).stdout.strip()
        return out or None
    except subprocess.CalledProcessError:
        return None


sitemap_path = os.path.join(ROOT, "sitemap.xml")
with open(sitemap_path, "r", encoding="utf-8") as fh:
    content = fh.read()

url_re = re.compile(r"<url><loc>(.*?)</loc>(?:<lastmod>.*?</lastmod>)?</url>")


def replace(m):
    url = m.group(1)
    filepath = url_to_filepath(url)
    lastmod = None
    if not os.path.exists(filepath):
        print(f"WARNING: no file for {url} (expected {filepath})")
        return m.group(0)

    if url.rstrip("/") != f"{SITE}/blog" and "/blog/" in url:
        with open(filepath, "r", encoding="utf-8") as fh:
            html = fh.read()
        lastmod = blog_post_date(html)

    if not lastmod:
        lastmod = git_commit_date(filepath)

    if not lastmod:
        return f"<url><loc>{url}</loc></url>"
    return f"<url><loc>{url}</loc><lastmod>{lastmod}</lastmod></url>"


new_content = url_re.sub(replace, content)

with open(sitemap_path, "w", encoding="utf-8") as fh:
    fh.write(new_content)

count = len(url_re.findall(content))
print(f"Updated lastmod for {count} URLs in sitemap.xml")
