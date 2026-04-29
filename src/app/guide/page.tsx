'use client';

import React, { useState } from 'react';
import { ArrowLeft, Terminal, FolderPlus, Copy, Check, BookOpen, Layers, Beaker, ChevronDown, ChevronRight } from 'lucide-react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/* ── Code Block with copy button ── */
function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block relative group my-4 overflow-x-auto">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition opacity-0 group-hover:opacity-100"
        title="Copy"
      >
        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      </button>
      <pre className="p-5 text-[13px] leading-relaxed text-zinc-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ── Collapsible Section ── */
function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition"
      >
        <span className="text-cyan-400">{icon}</span>
        <span className="text-lg font-semibold text-white flex-1">{title}</span>
        {open ? <ChevronDown size={18} className="text-zinc-500" /> : <ChevronRight size={18} className="text-zinc-500" />}
      </button>
      {open && <div className="px-5 pb-6 border-t border-zinc-800/40 pt-4">{children}</div>}
    </div>
  );
}

/* ── Difficulty Table ── */
function DifficultyTable() {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-2 px-3 text-zinc-400 font-medium">Level</th>
            <th className="text-left py-2 px-3 text-zinc-400 font-medium">Agent Receives</th>
            <th className="text-left py-2 px-3 text-zinc-400 font-medium">Difficulty</th>
          </tr>
        </thead>
        <tbody className="text-zinc-300">
          <tr className="border-b border-zinc-800/50">
            <td className="py-2.5 px-3"><code className="text-cyan-400">L1</code></td>
            <td className="py-2.5 px-3">Task README only</td>
            <td className="py-2.5 px-3"><span className="text-red-400">Hardest</span> — agent plans from scratch</td>
          </tr>
          <tr className="border-b border-zinc-800/50">
            <td className="py-2.5 px-3"><code className="text-cyan-400">L2</code></td>
            <td className="py-2.5 px-3">README + approach.md</td>
            <td className="py-2.5 px-3"><span className="text-yellow-400">Medium</span> — approach is given</td>
          </tr>
          <tr>
            <td className="py-2.5 px-3"><code className="text-cyan-400">L3</code></td>
            <td className="py-2.5 px-3">README + approach.md + design.md</td>
            <td className="py-2.5 px-3"><span className="text-emerald-400">Easiest</span> — full design is given</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Page ── */
export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'evaluate' | 'new-task'>('evaluate');

  return (
    <div className="min-h-screen grid-bg">
      {/* ── Header ── */}
      <header className="border-b border-zinc-800/40">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <a
            href={`${BASE_PATH}/`}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Home
          </a>
          <span className="text-zinc-700">/</span>
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-cyan-400" /> Guide
          </h1>
        </div>
      </header>

      {/* ── Tab Switcher ── */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex gap-2 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/40 w-fit">
          <button
            onClick={() => setActiveTab('evaluate')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'evaluate'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Terminal size={16} /> Evaluate a Task
          </button>
          <button
            onClick={() => setActiveTab('new-task')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'new-task'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FolderPlus size={16} /> Add a New Task
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'evaluate' ? <EvaluateContent /> : <NewTaskContent />}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/40 mt-8">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-[11px] text-zinc-600">
          &copy; {new Date().getFullYear()} imaging-101 Team
        </div>
      </footer>
    </div>
  );
}

/* ===================================================================
   TAB 1: Evaluate a Task
   =================================================================== */
function EvaluateContent() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Intro */}
      <div className="glass-card p-6">
        <p className="text-zinc-300 text-sm leading-relaxed">
          imaging-101 evaluates coding agents on scientific imaging tasks using three modes:
          <strong className="text-white"> Function</strong> (unit test pass rate per module),
          <strong className="text-white"> End-to-End</strong> (full pipeline reconstruction quality),
          and <strong className="text-white"> Plan</strong> (LLM-as-judge scoring).
        </p>
      </div>

      {/* Prerequisites */}
      <Section title="Prerequisites" icon={<Layers size={18} />} defaultOpen={true}>
        <p className="text-sm text-zinc-400 mb-3">Clone the repo and install the harness (only <code className="text-cyan-400">requests</code> is required):</p>
        <CodeBlock code={`git clone https://github.com/HeSunPU/imaging-101.git
cd imaging-101
pip install -r evaluation_harness/requirements.txt`} />

        <p className="text-sm text-zinc-400 mt-4 mb-3">Configure your LLM API credentials. Either set environment variables:</p>
        <CodeBlock code={`export API_KEY="your-api-key"
export BASE_URL="https://api.openai.com/v1"
export MODEL="gpt-4o"`} />

        <p className="text-sm text-zinc-400 mt-4 mb-3">Or edit <code className="text-cyan-400">config_llm.yaml</code>:</p>
        <CodeBlock code={`"your-model-name":
    api_type: "openai"
    base_url: "https://your-api-gateway/v1"
    api_key: "your-api-key"
    temperature: 0.2`} lang="yaml" />
      </Section>

      {/* Function Mode */}
      <Section title="Function-Mode Evaluation" icon={<Beaker size={18} />} defaultOpen={true}>
        <p className="text-sm text-zinc-400 mb-3">
          Tests whether an agent can implement <strong className="text-zinc-200">individual modules</strong> (e.g., <code className="text-cyan-400">physics_model.py</code>,
          <code className="text-cyan-400"> preprocessing.py</code>, <code className="text-cyan-400">solvers.py</code>) given the task description and plan.
        </p>

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Evaluate a single module</h4>
        <CodeBlock code={`python -m evaluation_harness run \\
    --task eht_black_hole_original \\
    --mode function \\
    --target-function physics_model \\
    --model $MODEL \\
    --base-url $BASE_URL \\
    --api-key $API_KEY \\
    --framework react \\
    --max-iterations 20 \\
    --timeout 600 \\
    --output results/function_mode \\
    -v`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Evaluate all modules of a task</h4>
        <CodeBlock code={`for module in physics_model preprocessing solvers; do
    python -m evaluation_harness run \\
        --task ct_sparse_view \\
        --mode function \\
        --target-function $module \\
        --model $MODEL \\
        --base-url $BASE_URL \\
        --api-key $API_KEY \\
        --framework react \\
        --max-iterations 20 \\
        --timeout 600 \\
        --output results/function_mode \\
        -v
done`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Generate summary</h4>
        <CodeBlock code={`python -m evaluation_harness summarize \\
    --dir results/function_mode/ct_sparse_view/your-model_20260401`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Re-score without LLM calls</h4>
        <p className="text-sm text-zinc-400 mb-2">Re-run pytest on previously generated code (e.g., after fixing environment issues):</p>
        <CodeBlock code={`python scripts/rescore_existing.py`} />

        <div className="metric-highlight mt-5">
          <h4 className="text-sm font-semibold text-white mb-2">Output structure</h4>
          <CodeBlock code={`results/function_mode/<task>/<model>_<date>/
├── physics_model/
│   ├── result.json              # {"tests_passed": 11, "tests_total": 11, ...}
│   └── src/physics_model.py     # Generated code
├── preprocessing/
│   ├── result.json
│   └── src/preprocessing.py
├── solvers/
│   ├── result.json
│   └── src/solvers.py
└── summary.json                 # Aggregated metrics`} />
        </div>
      </Section>

      {/* End-to-End Mode */}
      <Section title="End-to-End Evaluation" icon={<Layers size={18} />}>
        <p className="text-sm text-zinc-400 mb-3">
          Tests whether an agent can <strong className="text-zinc-200">implement the full imaging pipeline</strong> from scratch,
          producing a reconstruction from raw data.
        </p>

        <h4 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">Difficulty levels</h4>
        <DifficultyTable />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Run with built-in agent</h4>
        <CodeBlock code={`python -m evaluation_harness run \\
    --task eht_black_hole_original \\
    --mode end_to_end \\
    --model $MODEL \\
    --base-url $BASE_URL \\
    --api-key $API_KEY \\
    --framework react \\
    --level L1 \\
    --max-iterations 50 \\
    --timeout 1200 \\
    --output results/end_to_end \\
    -v`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Run with multi-agent pipeline</h4>
        <CodeBlock code={`python -m evaluation_harness run \\
    --task eht_black_hole_original \\
    --mode end_to_end \\
    --framework multi_agent \\
    --level L1 \\
    --model $MODEL \\
    --base-url $BASE_URL \\
    --api-key $API_KEY \\
    --max-iterations 50 \\
    --output results/end_to_end/multi_agent \\
    -v`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Third-party agent (Claude Code, Cursor, etc.)</h4>
        <CodeBlock code={`# Step 1: Prepare sandbox workspace
python -m evaluation_harness prepare \\
    --task eht_black_hole_original \\
    --level L1

# Step 2: Run your agent in the prepared workspace
# The workspace contains a .prompt.md file — paste it into your agent.
# The agent should produce output/reconstruction.npy

# Step 3: Collect and score results
python -m evaluation_harness collect \\
    --task eht_black_hole_original \\
    --workspace-dir ~/workspaces/eht_black_hole_original_L1/ \\
    --agent-name claude_code \\
    --output results/end_to_end/copilot`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Compute reconstruction metrics</h4>
        <CodeBlock code={`# From a workspace
python scripts/compute_metrics.py \\
    --workspace /path/to/workspace \\
    --task eht_black_hole_original

# Compare against reference methods
python scripts/compute_metrics.py \\
    --workspace /path/to/workspace \\
    --task eht_black_hole_original \\
    --compare-reference --json`} />

        <div className="metric-highlight mt-5">
          <h4 className="text-sm font-semibold text-white mb-2">Metrics</h4>
          <ul className="text-sm text-zinc-300 space-y-1.5 list-none">
            <li><strong className="text-cyan-400">NCC</strong> (Normalized Cross-Correlation): higher is better, 1.0 = perfect match</li>
            <li><strong className="text-cyan-400">NRMSE</strong> (Normalized Root Mean Square Error): lower is better, 0.0 = perfect match</li>
          </ul>
        </div>
      </Section>

      {/* Plan Mode */}
      <Section title="Plan-Mode Evaluation" icon={<BookOpen size={18} />}>
        <p className="text-sm text-zinc-400 mb-3">
          Tests an agent&apos;s <strong className="text-zinc-200">planning ability</strong> without code implementation, using LLM-as-judge
          pairwise comparison and rubric scoring against reference plans.
        </p>
        <CodeBlock code={`python -m evaluation_harness run \\
    --task eht_black_hole_original \\
    --mode plan \\
    --model $MODEL \\
    --base-url $BASE_URL \\
    --api-key $API_KEY \\
    --framework react \\
    --output results/plan \\
    -v`} />
      </Section>

      {/* CLI Reference */}
      <Section title="CLI Quick Reference" icon={<Terminal size={18} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">What you want</th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">Command</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300 font-mono text-xs">
              <tr className="border-b border-zinc-800/50">
                <td className="py-2.5 px-3 font-sans text-sm">Evaluate one module</td>
                <td className="py-2.5 px-3"><code>python -m evaluation_harness run --task TASK --mode function --target-function MODULE ...</code></td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2.5 px-3 font-sans text-sm">Full pipeline</td>
                <td className="py-2.5 px-3"><code>python -m evaluation_harness run --task TASK --mode end_to_end --level L1 ...</code></td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2.5 px-3 font-sans text-sm">Prepare for external agent</td>
                <td className="py-2.5 px-3"><code>python -m evaluation_harness prepare --task TASK --level L1</code></td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2.5 px-3 font-sans text-sm">Score external agent</td>
                <td className="py-2.5 px-3"><code>python -m evaluation_harness collect --task TASK --workspace-dir DIR --agent-name NAME</code></td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2.5 px-3 font-sans text-sm">Compute NCC/NRMSE</td>
                <td className="py-2.5 px-3"><code>python scripts/compute_metrics.py --workspace DIR --task TASK</code></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-sm">Re-score existing code</td>
                <td className="py-2.5 px-3"><code>python scripts/rescore_existing.py</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* ===================================================================
   TAB 2: Add a New Task
   =================================================================== */
function NewTaskContent() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Intro */}
      <div className="glass-card p-6">
        <p className="text-zinc-300 text-sm leading-relaxed">
          Each task represents a <strong className="text-white">computational imaging inverse problem</strong>: given observed data <em>y</em>,
          recover the underlying signal <em>x</em> using a known forward model <em>A</em>.
          Follow these steps to add your own task to the benchmark.
        </p>
      </div>

      {/* Step 1: Directory Structure */}
      <Section title="Step 1 — Create Directory Structure" icon={<FolderPlus size={18} />} defaultOpen={true}>
        <CodeBlock code={`mkdir -p tasks/your_task_name/{data,plan,src,evaluation/{tests,fixtures,reference_outputs},notebooks}`} />
        <p className="text-sm text-zinc-400 mt-3 mb-2">This creates:</p>
        <CodeBlock code={`tasks/your_task_name/
├── README.md                  # Problem definition
├── requirements.txt           # Python dependencies
├── main.py                    # Pipeline entry point
├── data/
│   ├── raw_data.npz           # Observation data
│   └── meta_data.json         # Imaging parameters
├── plan/
│   ├── approach.md            # Solution methodology (L2 hint)
│   └── design.md              # Code architecture + function signatures (L3 hint)
├── src/
│   ├── preprocessing.py       # Raw data → processed observations
│   ├── physics_model.py       # Forward model: x → y
│   ├── solvers.py             # Inverse solver: y → x_hat
│   └── visualization.py       # Plotting utilities
├── evaluation/
│   ├── reference_outputs/     # Ground truth, metrics, checkpoints
│   ├── fixtures/              # Per-function test data
│   └── tests/                 # Unit tests
└── notebooks/
    └── your_task_name.ipynb   # Tutorial notebook`} />
      </Section>

      {/* Step 2: README */}
      <Section title="Step 2 — Write the README" icon={<BookOpen size={18} />}>
        <p className="text-sm text-zinc-400 mb-3">
          The README is the <strong className="text-zinc-200">primary document an agent reads</strong>.
          Do NOT include implementation code or function signatures — keep method hints conceptual.
        </p>
        <CodeBlock code={`# Your Task Name

One-line summary of the imaging problem.

- **Domain**: Medicine / Astronomy / Biology / Physics / Chemistry / Earth Science
- **Keywords**: comma-separated technical keywords
- **Difficulty**: Easy / Medium / Hard

## Background
2-3 paragraphs explaining the physics and motivation. Include key equations.

## Problem Description
What the agent must implement: given inputs, produce outputs.
Define the forward model mathematically.

## Data Description
### Input
- \`data/raw_data.npz\`: describe each array and its shape/dtype
- \`data/meta_data.json\`: describe each parameter

### Output
- \`output/reconstruction.npy\`: expected output shape and meaning

## Method Hints
Conceptual guidance (not implementation details):
- Which algorithm family to use
- Key regularization approaches
- Important numerical considerations

## References
1. Author et al. (Year) Title. Journal.`} lang="markdown" />
      </Section>

      {/* Step 3: Source Code */}
      <Section title="Step 3 — Implement Source Code" icon={<Terminal size={18} />}>
        <p className="text-sm text-zinc-400 mb-3">Implement the core modules following this pattern:</p>

        <h4 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">src/physics_model.py — Forward model A: x → y</h4>
        <CodeBlock code={`def forward(x, meta_data):
    """Apply forward model.
    Args:
        x: Image/signal to transform, shape (N, N)
        meta_data: dict from meta_data.json
    Returns:
        y: Measurements, shape (M,)
    """
    ...

def adjoint(y, meta_data):
    """Apply adjoint operator A^H."""
    ...`} lang="python" />

        <h4 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">src/solvers.py — Reconstruction algorithm</h4>
        <CodeBlock code={`def reconstruct(observations, forward_op, adjoint_op, meta_data, **kwargs):
    """Run reconstruction algorithm.
    Returns:
        reconstruction: np.ndarray, the recovered image/signal
    """
    ...`} lang="python" />

        <h4 className="text-sm font-semibold text-zinc-200 mt-4 mb-2">main.py — Pipeline entry point</h4>
        <CodeBlock code={`import matplotlib
matplotlib.use('Agg')  # Only set backend in main.py, never in src/

from src.preprocessing import load_and_preprocess
from src.physics_model import forward, adjoint
from src.solvers import reconstruct
from src.visualization import plot_results

def main():
    # 1. Load data
    # 2. Preprocess
    # 3. Reconstruct
    # 4. Save output/reconstruction.npy
    # 5. Visualize
    ...

if __name__ == "__main__":
    main()`} lang="python" />
      </Section>

      {/* Step 4: Tests & Reference Outputs */}
      <Section title="Step 4 — Generate Tests & Reference Outputs" icon={<Beaker size={18} />}>
        <p className="text-sm text-zinc-400 mb-3">Run the pipeline and save all outputs:</p>
        <CodeBlock code={`cd tasks/your_task_name
pip install -r requirements.txt
python main.py`} />

        <p className="text-sm text-zinc-400 mt-4 mb-2">Generate test fixtures (input-output pairs for each function):</p>
        <CodeBlock code={`import numpy as np
from src.physics_model import forward, adjoint

# Small test case
x_test = np.random.randn(16, 16)
y_test = forward(x_test, meta_data)
np.savez('evaluation/fixtures/physics_model.npz',
         x_input=x_test, y_expected=y_test, meta_data=meta_data)`} lang="python" />

        <p className="text-sm text-zinc-400 mt-4 mb-2">Write unit tests in <code className="text-cyan-400">evaluation/tests/test_physics_model.py</code>:</p>
        <CodeBlock code={`import numpy as np
import pytest
from pathlib import Path

FIXTURES = Path(__file__).parent.parent / "fixtures"

class TestForwardModel:
    @pytest.fixture(autouse=True)
    def setup(self):
        data = np.load(FIXTURES / "physics_model.npz", allow_pickle=True)
        self.x_input = data["x_input"]
        self.y_expected = data["y_expected"]

    def test_forward_shape(self):
        from src.physics_model import forward
        y = forward(self.x_input, self.meta_data)
        assert y.shape == self.y_expected.shape

    def test_forward_values(self):
        from src.physics_model import forward
        y = forward(self.x_input, self.meta_data)
        np.testing.assert_allclose(y, self.y_expected, rtol=1e-5)`} lang="python" />
      </Section>

      {/* Step 5: Verify */}
      <Section title="Step 5 — Verify & Evaluate" icon={<Layers size={18} />}>
        <p className="text-sm text-zinc-400 mb-3">All of these must succeed:</p>
        <CodeBlock code={`cd tasks/your_task_name

python main.py                              # Pipeline runs
python -m pytest evaluation/tests/ -v       # All tests pass
jupyter nbconvert --execute notebooks/*.ipynb  # Notebook runs`} />

        <h4 className="text-sm font-semibold text-zinc-200 mt-5 mb-2">Run the benchmark on your new task</h4>
        <CodeBlock code={`# Function-mode: test if an agent can implement each module
python -m evaluation_harness run \\
    --task your_task_name \\
    --mode function \\
    --target-function physics_model \\
    --model $MODEL \\
    --base-url $BASE_URL \\
    --api-key $API_KEY \\
    --framework react \\
    --output results/function_mode \\
    -v

# End-to-end: test if an agent can build the full pipeline
python -m evaluation_harness run \\
    --task your_task_name \\
    --mode end_to_end \\
    --level L1 \\
    --model $MODEL \\
    --base-url $BASE_URL \\
    --api-key $API_KEY \\
    --framework react \\
    --output results/end_to_end \\
    -v`} />

        <div className="metric-highlight mt-5">
          <h4 className="text-sm font-semibold text-white mb-2">Checklist</h4>
          <ul className="text-sm text-zinc-300 space-y-1 list-none">
            {[
              'README.md, main.py, requirements.txt',
              'data/raw_data.npz, data/meta_data.json',
              'plan/approach.md, plan/design.md',
              'src/physics_model.py, src/preprocessing.py, src/solvers.py',
              'evaluation/reference_outputs/ with ground_truth and metrics',
              'evaluation/tests/test_*.py (at least one)',
              'notebooks/your_task_name.ipynb',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">&#x25A2;</span> <code className="text-xs">{item}</code>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Common Pitfalls */}
      <Section title="Common Pitfalls" icon={<ChevronRight size={18} />}>
        <ul className="text-sm text-zinc-300 space-y-3 list-none">
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5 shrink-0">&#x2717;</span>
            <span><strong className="text-zinc-200">Solver parameters in meta_data.json</strong> — Only include imaging/physics parameters, not algorithm hyperparameters.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5 shrink-0">&#x2717;</span>
            <span><strong className="text-zinc-200">Information leakage</strong> — Don&apos;t reference packages published after the original paper.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5 shrink-0">&#x2717;</span>
            <span><strong className="text-zinc-200">matplotlib.use(&apos;Agg&apos;) in src/</strong> — Only call this in main.py, never in library code (breaks notebooks).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5 shrink-0">&#x2717;</span>
            <span><strong className="text-zinc-200">Coordinate convention mismatch</strong> — Ensure generate_data.py and physics_model.py use the same pixel convention.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-400 mt-0.5 shrink-0">&#x2717;</span>
            <span><strong className="text-zinc-200">Cross-task imports</strong> — Each task must be fully self-contained.</span>
          </li>
        </ul>
      </Section>
    </div>
  );
}
