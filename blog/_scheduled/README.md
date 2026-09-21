# Scheduled posts (staging area)

This folder holds finished blog posts that are written but not live yet.
A daily GitHub Action (`.github/workflows/publish-scheduled-posts.yml`)
checks `assets/scheduled-posts.json` every morning and, for anything whose
`publishDate` has arrived, moves it from here into `blog/`, wires it into
`assets/posts.json`, `feed.xml`, and `sitemap.xml`, and commits the result.
GitHub Pages redeploys automatically from that push.

## Adding a post to the queue

1. Build the post the normal way: `blog/_scheduled/<slug>/index.html` plus
   `blog/_scheduled/<slug>/images/`, exactly like a real post (same header,
   footer, meta tags, `<script src="../../assets/common.js" defer>`, etc.,
   with paths written as if it already lived at `blog/<slug>/` — the move
   is a straight directory rename, nothing inside the file changes).
2. Add an entry to `assets/scheduled-posts.json`:

   ```json
   {
     "slug": "the-post-folder-name",
     "title": "Title exactly as it should appear in the blog index and RSS feed",
     "description": "One or two sentence RSS description (usually the meta description).",
     "category": 1,
     "publishDate": "2026-10-03"
   }
   ```

   `category` matches the same numbering as `assets/posts.json`: 0 = Firm &
   Community, 1 = Criminal Defense, 2 = Family Law, 3 = Estate Planning,
   4 = Landlord-Tenant & Small Claims.

3. Commit and push. That's it — the post sits here until its date arrives.

## What the script does *not* do

It doesn't touch the post's own HTML (title, meta description, body,
"Posted" date). Write those correctly up front. The script only moves the
folder and updates the three index files, so the "Posted M/D/YYYY" line
inside the post should match (or be close to) the `publishDate` you set.

## Multiple posts on the same day

Fully supported — the script processes every due entry in one run, not
just one per day. Give two posts the same `publishDate` if you want them
both to go live together.

## Checking on a run

The workflow also has `workflow_dispatch` enabled, so it can be triggered
manually from the Actions tab in GitHub without waiting for the schedule,
useful for testing a new entry.
