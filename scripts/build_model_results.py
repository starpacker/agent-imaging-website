"""
Parse function_mode_success_summary.md + _summary.json + tasks_db.json
to produce public/data/model_results.json for website visualizations.
"""
import json, re, pathlib

SCRIPT_DIR = pathlib.Path(__file__).parent
WEBSITE_ROOT = SCRIPT_DIR.parent
REPO_ROOT = pathlib.Path(r"C:\Users\30670\Desktop\eny\imaging-101")

FUNC_SUMMARY = REPO_ROOT / "results" / "audit" / "function_mode_success_summary.md"
E2E_SUMMARY = REPO_ROOT / "results" / "end_to_end" / "claude_code" / "_summary.json"
TASKS_DB = WEBSITE_ROOT / "public" / "data" / "tasks_db.json"
OUTPUT = WEBSITE_ROOT / "public" / "data" / "model_results.json"

# ── Task → domain mapping ──
def load_task_domain_map(tasks_db_path):
    with open(tasks_db_path, encoding="utf-8") as f:
        db = json.load(f)
    task_to_domain = {}
    for domain_key, domain_data in db["domains"].items():
        for task_id in domain_data["task_ids"]:
            padded = f"task_{str(task_id).zfill(2)}"
            task_info = db["tasks"].get(padded)
            if task_info:
                task_to_domain[task_info["name"]] = {
                    "domain": domain_key,
                    "domain_name": domain_data["name_en"],
                }
    return task_to_domain

# ── Parse subtask details string ──
def parse_subtask_details(details_str):
    """Parse 'physics_model 11/11 PASS, preprocessing 16/16 PASS, ...'"""
    result = {}
    for match in re.finditer(r'(\w+)\s+(\d+)/(\d+)\s+(PASS|FAIL|0/0)', details_str):
        name = match.group(1)
        passed = int(match.group(2))
        total = int(match.group(3))
        status = match.group(4)
        if total == 0:
            continue  # skip 0/0
        result[name] = {
            "passed": passed,
            "total": total,
            "status": "pass" if status == "PASS" else "fail",
            "score": f"{passed}/{total}",
        }
    return result

# ── Parse function_mode_success_summary.md ──
def parse_function_mode(md_path):
    with open(md_path, encoding="utf-8") as f:
        content = f.read()

    # Split by model sections
    model_sections = re.split(r'^## (.+)$', content, flags=re.MULTILINE)
    # model_sections[0] is header, then alternating [model_name, content, ...]

    models = {}
    for i in range(1, len(model_sections), 2):
        model_name = model_sections[i].strip()
        section = model_sections[i + 1]

        tasks = {}
        # Parse table rows: | # | Task | Score | Subtask Details |
        for row in re.finditer(
            r'\|\s*\d+\s*\|\s*(\S+)\s*\|\s*(\d+/\d+)\s*\|\s*(.+?)\s*\|',
            section,
        ):
            task_name = row.group(1)
            score = row.group(2)
            details_str = row.group(3)
            subtasks = parse_subtask_details(details_str)

            # Determine overall status
            all_pass = all(s["status"] == "pass" for s in subtasks.values())

            # Extract the 3 canonical subtasks
            pre = subtasks.get("preprocessing", {})
            phys = subtasks.get("physics_model", {})
            solv = subtasks.get("solvers", {})

            tasks[task_name] = {
                "score": score,
                "overall": "pass" if all_pass else "fail",
                "preprocessing": pre.get("status", "n/a"),
                "physics_model": phys.get("status", "n/a"),
                "solvers": solv.get("status", "n/a"),
                "preprocessing_score": pre.get("score", ""),
                "physics_model_score": phys.get("score", ""),
                "solvers_score": solv.get("score", ""),
            }

        # Parse 0/0 tasks
        for m in re.finditer(r'^- (\S+):', section, re.MULTILINE):
            task_name = m.group(1)
            if task_name not in tasks:
                tasks[task_name] = {
                    "score": "0/0",
                    "overall": "n/a",
                    "preprocessing": "n/a",
                    "physics_model": "n/a",
                    "solvers": "n/a",
                    "preprocessing_score": "",
                    "physics_model_score": "",
                    "solvers_score": "",
                }

        models[model_name] = tasks

    return models

# ── Parse E2E Claude Code results ──
def parse_e2e(e2e_path):
    with open(e2e_path, encoding="utf-8") as f:
        data = json.load(f)

    results = {}
    for row in data["rows"]:
        task = row["task"]
        ncc = row.get("ncc")
        if ncc is None:
            verdict = "n/a"
        elif ncc >= 0.9:
            verdict = "pass"
        elif ncc >= 0.7:
            verdict = "partial"
        else:
            verdict = "fail"

        # If duplicate (retry), keep best NCC
        if task in results:
            if ncc is not None and (results[task]["ncc"] is None or ncc > results[task]["ncc"]):
                pass  # overwrite below
            else:
                continue

        results[task] = {
            "ncc": round(ncc, 4) if ncc is not None else None,
            "nrmse": round(row["nrmse"], 4) if row.get("nrmse") is not None else None,
            "psnr": round(row["psnr"], 2) if row.get("psnr") is not None else None,
            "ssim": round(row["ssim"], 4) if row.get("ssim") is not None else None,
            "verdict": verdict,
        }
    return results

# ── Compute domain radar data ──
def compute_domain_radar(func_models, task_domain_map):
    """For each model and domain, compute % of tasks fully passed."""
    domains = {}  # domain_key -> { model -> pct }

    # Collect all tasks per domain that have function mode data
    domain_tasks = {}  # domain_key -> set of task names
    for task_name, info in task_domain_map.items():
        domain_tasks.setdefault(info["domain"], set()).add(task_name)

    for domain_key, task_set in sorted(domain_tasks.items()):
        domain_name = next(
            (v["domain_name"] for v in task_domain_map.values() if v["domain"] == domain_key),
            domain_key,
        )
        domain_entry = {"domain_name": domain_name}

        for model_name, model_tasks in func_models.items():
            total = 0
            passed = 0
            for task_name in task_set:
                if task_name in model_tasks and model_tasks[task_name]["overall"] != "n/a":
                    total += 1
                    if model_tasks[task_name]["overall"] == "pass":
                        passed += 1
            pct = round(passed / total * 100, 1) if total > 0 else 0
            domain_entry[model_name] = pct

        domains[domain_key] = domain_entry

    return domains

# ── Main ──
def main():
    print("Loading task-domain mapping...")
    task_domain_map = load_task_domain_map(TASKS_DB)
    print(f"  {len(task_domain_map)} tasks mapped to domains")

    print("Parsing function mode results...")
    func_models = parse_function_mode(FUNC_SUMMARY)
    for m, tasks in func_models.items():
        print(f"  {m}: {len(tasks)} tasks")

    print("Parsing E2E Claude Code results...")
    e2e = parse_e2e(E2E_SUMMARY)
    print(f"  {len(e2e)} tasks")

    print("Computing domain radar...")
    radar = compute_domain_radar(func_models, task_domain_map)
    for dk, dv in radar.items():
        print(f"  Domain {dk} ({dv['domain_name']})")

    # Build final output
    model_names = list(func_models.keys())

    # Restructure function_mode: task -> { model -> result }
    all_tasks = set()
    for tasks in func_models.values():
        all_tasks.update(tasks.keys())

    function_mode = {}
    for task_name in sorted(all_tasks):
        task_entry = {}
        for model_name in model_names:
            if task_name in func_models[model_name]:
                task_entry[model_name] = func_models[model_name][task_name]
            else:
                task_entry[model_name] = {
                    "score": "",
                    "overall": "n/a",
                    "preprocessing": "n/a",
                    "physics_model": "n/a",
                    "solvers": "n/a",
                }
        # Add domain info
        if task_name in task_domain_map:
            task_entry["_domain"] = task_domain_map[task_name]["domain"]
            task_entry["_domain_name"] = task_domain_map[task_name]["domain_name"]
        function_mode[task_name] = task_entry

    output = {
        "models": model_names,
        "function_mode": function_mode,
        "e2e_claude_code": e2e,
        "domain_radar": radar,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\nWritten to {OUTPUT}")
    print(f"  {len(function_mode)} tasks in function_mode")
    print(f"  {len(e2e)} tasks in e2e_claude_code")
    print(f"  {len(radar)} domains in domain_radar")

if __name__ == "__main__":
    main()
