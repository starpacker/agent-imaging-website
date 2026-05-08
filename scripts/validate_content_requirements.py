#!/usr/bin/env python3
"""Validate the Imaging-101 website content requirements.

This script intentionally checks the generated public data and key React files
instead of relying on implementation details. It is meant to run from the
website repository root.
"""

from __future__ import annotations

import base64
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TASKS_ROOT = ROOT.parent / "tasks"
TASKS_DB = ROOT / "public" / "data" / "tasks_db.json"
PAGE = ROOT / "src" / "app" / "page.tsx"
HERO = ROOT / "src" / "components" / "HeroSection.tsx"
TASK_MODAL = ROOT / "src" / "components" / "TaskModal.tsx"
GITHUB_CONTENTS = "https://api.github.com/repos/HeSunPU/imaging-101/contents/tasks"


def fail(message: str) -> None:
    raise AssertionError(message)


def load_db() -> dict:
    if not TASKS_DB.exists():
        fail(f"Missing {TASKS_DB}")
    return json.loads(TASKS_DB.read_text(encoding="utf-8"))


def assert_section_order() -> None:
    page_text = PAGE.read_text(encoding="utf-8")
    explore_idx = page_text.find('id="explore-tasks"')
    leaderboard_idx = page_text.find("<Leaderboard />")
    if explore_idx < 0:
        fail('page.tsx must expose an "explore-tasks" anchor before the leaderboard')
    if leaderboard_idx < 0:
        fail("page.tsx must render the Leaderboard component")
    if explore_idx > leaderboard_idx:
        fail("Explore Tasks must render before Leaderboard")

    hero_text = HERO.read_text(encoding="utf-8")
    explore_href = hero_text.find('href="#explore-tasks"')
    leaderboard_href = hero_text.find('href="#leaderboard"')
    if explore_href < 0 or leaderboard_href < 0:
        fail("Hero navigation must link to #explore-tasks and #leaderboard")
    if explore_href > leaderboard_href:
        fail("Hero navigation must list Explore Tasks before Leaderboard")


def assert_featured_examples(db: dict) -> None:
    featured = db.get("featured_examples")
    if not isinstance(featured, list):
        fail("tasks_db.json must define featured_examples")
    domains = set(db["domains"].keys())
    seen_domains = set()
    seen_tasks = set()
    for item in featured:
        domain = item.get("domain")
        task_name = item.get("task_name")
        reason = item.get("classic_reason", "").strip()
        if domain not in domains:
            fail(f"Featured example has unknown domain: {domain}")
        if domain in seen_domains:
            fail(f"Domain {domain} has more than one featured example")
        seen_domains.add(domain)
        matching_tasks = [
            task for task in db["tasks"].values() if task.get("name") == task_name
        ]
        if len(matching_tasks) != 1:
            fail(f"Featured task {task_name!r} must exist exactly once")
        if matching_tasks[0].get("domain") != domain:
            fail(f"Featured task {task_name!r} is not in domain {domain}")
        if len(reason) < 40:
            fail(f"Featured task {task_name!r} needs a concrete classic_reason")
        if task_name in seen_tasks:
            fail(f"Featured task {task_name!r} is duplicated")
        seen_tasks.add(task_name)
    if seen_domains != domains:
        fail(f"Featured examples must cover every domain exactly once: {domains - seen_domains}")


def assert_readmes(db: dict) -> None:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    for key, task in db["tasks"].items():
        task_name = task["name"]
        actual = task.get("readme_markdown", "").replace("\r\n", "\n")
        if not actual.strip():
            fail(f"{key} {task_name}: readme_markdown is empty")

        if token:
            url = f"{GITHUB_CONTENTS}/{task_name}/README.md?ref=main"
            request = Request(
                url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "User-Agent": "imaging-101-content-validator",
                },
            )
            with urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            expected = base64.b64decode(payload["content"]).decode("utf-8").replace("\r\n", "\n")
            if actual != expected:
                fail(f"{key} {task_name}: readme_markdown must equal full README.md content")

        readme_url = task.get("readme_url", "")
        expected_url = (
            "https://github.com/HeSunPU/imaging-101/blob/main/"
            f"tasks/{task_name}/README.md"
        )
        if readme_url != expected_url:
            fail(f"{key} {task_name}: README URL mismatch")


def assert_overview_images(db: dict) -> None:
    for key, task in db["tasks"].items():
        task_name = task["name"]
        image = task.get("overview_image")
        if not isinstance(image, dict):
            fail(f"{key} {task_name}: missing overview_image")
        rel_path = image.get("path", "").lstrip("/")
        if not rel_path:
            fail(f"{key} {task_name}: overview_image.path is empty")
        image_path = ROOT / "public" / rel_path
        if not image_path.exists():
            fail(f"{key} {task_name}: overview image does not exist: {rel_path}")
        if image_path.suffix.lower() != ".png":
            fail(f"{key} {task_name}: overview image must be a PNG")
        source = image.get("source", "").strip()
        if not source:
            fail(f"{key} {task_name}: overview_image.source must describe notebook cell/source")
        with Image.open(image_path) as im:
            width, height = im.size
        if width < 120 or height < 120:
            fail(f"{key} {task_name}: overview image is too small: {width}x{height}")
        ratio = width / height
        # Seismic and other Earth-science reconstructions are often naturally
        # wide cross-sections, so keep this check limited to extreme shapes.
        if ratio < 0.25 or ratio > 5.0:
            fail(f"{key} {task_name}: overview image ratio is unexpectedly extreme: {width}x{height}")


def assert_modal_renders_readme() -> None:
    text = TASK_MODAL.read_text(encoding="utf-8")
    if "readme_markdown" not in text:
        fail("TaskModal must render task.readme_markdown in the Overview tab")
    if "data-overview-readme-panel" not in text:
        fail("TaskModal must mark the left Overview README panel")
    if "data-overview-image-panel" not in text:
        fail("TaskModal must mark the right Overview image panel")
    if "whitespace-pre-wrap" not in text:
        fail("TaskModal must preserve raw README.md text in the left panel")

    readme_idx = text.find("data-overview-readme-panel")
    image_idx = text.find("data-overview-image-panel")
    if readme_idx > image_idx:
        fail("Overview README panel must appear before the final image panel")
    readme_panel = text[readme_idx:image_idx]
    for forbidden in ("task.references", "paper_link", "source_github", "githubLink", "nbLink"):
        if forbidden in readme_panel:
            fail(f"Overview README panel must contain only README.md content, found {forbidden}")


def main() -> None:
    db = load_db()
    assert_section_order()
    assert_featured_examples(db)
    assert_readmes(db)
    assert_overview_images(db)
    assert_modal_renders_readme()
    print("All content requirements passed.")


if __name__ == "__main__":
    main()
