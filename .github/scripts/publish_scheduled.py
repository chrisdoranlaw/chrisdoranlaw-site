"""Promotes staged posts from blog/_scheduled/ whose publishDate has arrived.

Reads assets/scheduled-posts.json, and for every entry due today (UTC):
  1. moves blog/_scheduled/<slug>/ to blog/<slug>/
  2. adds it to assets/posts.json, grouped with its category
  3. adds an <item> to feed.xml and bumps <lastBuildDate>
  4. adds a <url> to sitemap.xml and bumps the /blog entry's <lastmod>
  5. removes the entry from scheduled-posts.json

Entries whose blog/_scheduled/<slug>/ folder is missing are left in the
queue with a warning rather than silently dropped. Run from anywhere; ROOT
is computed from this script's own location
(repo_root/.github/scripts/publish_scheduled.py), matching audit_links.py.

Exits 0 and makes no changes if nothing is due today, so the workflow can
run daily without creating empty commits.
"""
import json
import os
import re
import shutil
import sys
from datetime import date, datetime, timezone
from xml.sax.saxutils import escape as xml_escape

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCHEDULE_FILE = os.path.join(ROOT, "assets", "scheduled-posts.json")
POSTS_FILE = os.path.join(ROOT, "assets", "posts.json")
FEED_FILE = os.path.join(ROOT, "feed.xml")
SITEMAP_FILE = os.path.join(ROOT, "sitemap.xml")
SCHEDULED_DIR = os.path.join(ROOT, "blog", "_scheduled")
BLOG_DIR = os.path.join(ROOT, "blog")

BASE_URL = "https://www.chrisdoranlaw.com"
BLOG_SITEMAP_MARKER = f'<url><loc>{BASE_URL}/blog</loc>'


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def insert_into_posts_json(posts_data, entry, slug):
    """Insert right before the first existing entry of the same category,
    so the post reads as 'newest first' within its category block. Falls
    back to the end of the list if the category has no entries yet."""
    new_row = [entry["title"], slug, entry["category"]]
    for i, row in enumerate(posts_data["posts"]):
        if row[2] == entry["category"]:
            posts_data["posts"].insert(i, new_row)
            return
    posts_data["posts"].append(new_row)


def build_feed_item(entry, slug, pub_date_str):
    return (
        "    <item>\n"
        f"      <title>{xml_escape(entry['title'])}</title>\n"
        f"      <link>{BASE_URL}/blog/{slug}</link>\n"
        f"      <guid>{BASE_URL}/blog/{slug}</guid>\n"
        f"      <pubDate>{pub_date_str}</pubDate>\n"
        f"      <description>{xml_escape(entry['description'])}</description>\n"
        "    </item>\n"
    )


def publish_due_entries():
    if not os.path.exists(SCHEDULE_FILE):
        print("No assets/scheduled-posts.json found; nothing to do.")
        return

    schedule = load_json(SCHEDULE_FILE)
    today = datetime.now(timezone.utc).date()

    due = []
    remaining = []
    for entry in schedule.get("scheduled", []):
        try:
            entry_date = date.fromisoformat(entry["publishDate"])
        except (KeyError, ValueError) as e:
            print(f"WARNING: skipping malformed schedule entry {entry!r}: {e}")
            remaining.append(entry)
            continue
        (due if entry_date <= today else remaining).append(entry)

    if not due:
        print("No posts due today.")
        return

    posts_data = load_json(POSTS_FILE)
    with open(FEED_FILE, encoding="utf-8") as f:
        feed_text = f.read()
    with open(SITEMAP_FILE, encoding="utf-8") as f:
        sitemap_text = f.read()

    pub_date_str = today.strftime("%a, %d %b %Y") + " 12:00:00 +0000"
    published = []

    for entry in due:
        slug = entry["slug"]
        src = os.path.join(SCHEDULED_DIR, slug)
        dst = os.path.join(BLOG_DIR, slug)

        if not os.path.isdir(src):
            print(f"WARNING: '{slug}' is due but blog/_scheduled/{slug}/ doesn't exist; leaving it queued.")
            remaining.append(entry)
            continue
        if os.path.exists(dst):
            print(f"WARNING: blog/{slug}/ already exists; leaving '{slug}' queued rather than overwriting.")
            remaining.append(entry)
            continue

        shutil.move(src, dst)

        insert_into_posts_json(posts_data, entry, slug)

        feed_text = feed_text.replace(
            "    <item>", build_feed_item(entry, slug, pub_date_str) + "    <item>", 1
        )

        sitemap_line = f'  <url><loc>{BASE_URL}/blog/{slug}</loc><lastmod>{today.isoformat()}</lastmod></url>\n'
        marker_idx = sitemap_text.index(BLOG_SITEMAP_MARKER)
        line_end = sitemap_text.index("\n", marker_idx) + 1
        sitemap_text = sitemap_text[:line_end] + sitemap_line + sitemap_text[line_end:]

        published.append(slug)
        print(f"Published {slug}")

    if not published:
        print("Nothing actually published (all due entries were skipped, see warnings above).")
        return

    # Bump feed.xml's own lastBuildDate to now.
    build_date_str = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
    feed_text = re.sub(
        r"<lastBuildDate>.*?</lastBuildDate>",
        f"<lastBuildDate>{build_date_str}</lastBuildDate>",
        feed_text,
        count=1,
    )

    # Bump the /blog entry's own lastmod in sitemap.xml.
    sitemap_text = re.sub(
        re.escape(BLOG_SITEMAP_MARKER) + r"<lastmod>[^<]*</lastmod>",
        f"{BLOG_SITEMAP_MARKER}<lastmod>{today.isoformat()}</lastmod>",
        sitemap_text,
        count=1,
    )

    save_json(POSTS_FILE, posts_data)
    with open(FEED_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(feed_text)
    with open(SITEMAP_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write(sitemap_text)
    save_json(SCHEDULE_FILE, {"scheduled": remaining})

    print(f"Done. Published: {', '.join(published)}")


if __name__ == "__main__":
    publish_due_entries()
    sys.exit(0)
