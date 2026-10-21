#!/usr/bin/env python3
"""Rebuild the Life page from assets/img/life and assets/video/life."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FOLDER = ROOT / "assets" / "img" / "life"
VIDEO_FOLDER = ROOT / "assets" / "video" / "life"
GALLERY = FOLDER / "gallery.js"
PAGE = ROOT / "passion.html"
SITE = "https://sachin7332.github.io/portfolio/"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov"}
TITLES = {
    "chandratal": ("Chandratal", "Sachin Diwakar at Chandratal"),
    "mountain": ("In the mountains", "Sachin Diwakar working in the mountains"),
    "jaishlmer": ("Jaisalmer", "Sachin Diwakar in Jaisalmer"),
    "jaisalmer": ("Jaisalmer", "Sachin Diwakar in Jaisalmer"),
    "star-gazzing": ("Star gazing", "Sachin Diwakar under the night sky"),
    "star-gazing": ("Star gazing", "Sachin Diwakar under the night sky"),
    "badmintion": ("Badminton", "Sachin Diwakar playing badminton"),
    "badminton": ("Badminton", "Sachin Diwakar playing badminton"),
}
ORDER = ["chandratal", "mountain", "jaisalmer", "jaishlmer", "star-gazing", "star-gazzing", "badminton", "badmintion"]


def title_for(path):
    key = path.stem.lower()
    if key in TITLES:
        return TITLES[key]
    words = path.stem.replace("_", " ").replace("-", " ").strip()
    title = " ".join(word[:1].upper() + word[1:] for word in words.split()) if words else path.stem
    return title, f"Sachin Diwakar, {title}"


def main():
    images = [p for p in FOLDER.iterdir() if p.suffix.lower() in EXTS and p.is_file()]

    def sort_key(path):
        key = path.stem.lower()
        return (ORDER.index(key) if key in ORDER else len(ORDER), path.name.lower())

    images.sort(key=sort_key)
    items = []
    for path in images:
        title, alt = title_for(path)
        items.append({
            "src": f"assets/img/life/{path.name}",
            "title": title,
            "alt": alt,
        })

    VIDEO_FOLDER.mkdir(parents=True, exist_ok=True)
    videos = sorted(
        [p for p in VIDEO_FOLDER.iterdir() if p.suffix.lower() in VIDEO_EXTS and p.is_file()],
        key=lambda p: p.name.lower(),
    )
    video_items = []
    for path in videos:
        title, alt = title_for(path)
        video_items.append({
            "src": f"assets/video/life/{path.name}",
            "title": title,
            "alt": alt,
        })

    GALLERY.write_text(
        "window.LIFE_GALLERY = " + json.dumps(items, indent=2, ensure_ascii=False) + ";\n"
        "window.LIFE_VIDEOS = " + json.dumps(video_items, indent=2, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )

    urls = ",\n        ".join(f'"{SITE}assets/img/life/{path.name}"' for path in images)
    block = "[\n        " + urls + "\n      ]" if urls else "[]"
    html = PAGE.read_text(encoding="utf-8")
    html, count = re.subn(
        r'"image": \[[\s\S]*?\]',
        '"image": ' + block,
        html,
        count=1,
    )
    if count != 1:
        raise SystemExit("Could not update the image list in passion.html")
    PAGE.write_text(html, encoding="utf-8")
    print(f"{len(items)} photograph(s), {len(video_items)} film(s) on the Life page")


if __name__ == "__main__":
    main()
