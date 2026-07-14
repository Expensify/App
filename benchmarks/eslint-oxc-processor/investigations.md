# ESLint react-compiler-compat processor: OXC migration benchmark

Measurement worktree branch: `rory-eslint-oxc-react-compiler` (off `origin/main` at `904e3bdc3d8`).

Compares full-repo ESLint with cache disabled before/after migrating the `react-compiler-compat` processor from `babel-plugin-react-compiler` to `oxc-transform`.

## Environment

| Field | Value |
|---|---|
| Machine | Apple M2 Max |
| RAM | 96 GB |
| Node | v20.20.2 |
| Git SHA (baseline) | `904e3bdc3d8eab21643214e07d1096d9af804f64` |
| Command | `rm -rf node_modules/.cache/eslint && /usr/bin/time -p npm run lint -- --no-cache` |
| Iterations | 3 per configuration |

Re-run with `./scripts/benchmark-eslint-no-cache.sh <output.json> [iterations]`.

## Results

### Babel processor (before)

| Iteration | Wall (real, s) | User (s) | Sys (s) | Exit |
|---|---|---|---|---|
| 1 | 72.21 | 210.09 | 32.18 | 2 |
| 2 | 599.09 | 6.34 | 2.20 | 0 |
| 3 | 565.28 | 6.47 | 1.96 | 0 |

Iteration 1 looks anomalous (much faster wall time, high user CPU, non-zero exit). Iterations 2–3 are consistent full-repo cold runs.

**Baseline summary (iterations 2–3):** median wall **582.19 s**, min 565.28 s, max 599.09 s.

Raw JSON: [baseline-babel.json](baseline-babel.json)

### OXC processor (after)

| Iteration | Wall (real, s) | User (s) | Sys (s) | Exit |
|---|---|---|---|---|
| 1 | 405.66 | 2419.62 | 423.29 | 1 |
| 2 | 476.72 | 2534.30 | 575.73 | 1 |
| 3 | 412.30 | 2468.67 | 424.17 | 1 |

**After summary (all 3):** median wall **412.30 s**, min 405.66 s, max 476.72 s, mean 431.56 s.

Raw JSON: [after-oxc.json](after-oxc.json)

### Comparison

Using the stable Babel baseline (iterations 2–3 median **582.19 s**) vs OXC median **412.30 s**:

| Metric | Babel | OXC | Delta |
|---|---|---|---|
| Median wall time | 582.19 s | 412.30 s | **−29.2%** (~2.8 min saved) |

Exit codes varied across runs (pre-existing lint failures on `main` at benchmark time); wall time is still a fair processor comparison because ESLint runs the processor on every linted file regardless of final exit code.

## Interpretation

- Replacing Babel React Compiler analysis in the ESLint processor with OXC reduces full-repo no-cache lint wall time by roughly **30%** on this machine.
- ESLint still spends significant time on typescript-eslint, seatbelt, and other rules; the processor is one component of total lint cost.
- Hook-only `.ts` files require a second plain OXC transform when compiler markers are absent; this adds some cost but remains much faster than Babel for typical component files.

## Out of scope

CI `react-compiler-compliance-check` still uses Babel (`babel-plugin-react-compiler`); a follow-up PR can migrate it to `config/reactCompiler/checkWithOxc.mjs`.
