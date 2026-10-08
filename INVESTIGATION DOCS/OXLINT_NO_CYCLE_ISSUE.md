# Prerequisite: fix the 534 circular imports that are currently silent

## Context

While preparing the ESLint to Oxlint migration, a batch of violations surfaced that ESLint does not report
today. `import/no-cycle` is the largest of them by a wide margin: **534 circular imports across 148 files
in `src/`**, all of them real.

The rule has been in our ESLint config for years with `maxDepth: '∞'`, and it reports **0**. ESLint's
resolver never resolves the `@src/...`, `@libs/...` and `@components/...` aliases, so it never builds a
module graph and has nothing to check. Oxlint reads `tsconfig.json`, resolves the aliases, and sees the
graph.

Fixing what the new linter found is a prerequisite for the migration. The day Oxlint becomes a blocking
check, these 534 findings become 534 hard errors, so the cleanup has to land first and on its own schedule.

## Why this one matters more than the rest

A circular import costs us more than a red check.

The 534 findings are not 534 independent problems. They resolve into 6 mutually dependent clusters, and the
largest holds **116 of the 148 files**, including `libs/API`, `libs/Middleware`, `libs/Navigation`,
`libs/actions/Session`, `ReportUtils`, `ReportActionsUtils`, `PolicyUtils` and `OptionsListUtils`. Importing
any single one of those 116 modules drags in all 116, because none of them can finish evaluating without the
others. That inflates the eager module graph on native startup and defeats code splitting on web. We have
not measured how much time that buys back, so treat it as a mechanism rather than a number.

Correctness is the other cost. Inside a cycle, one module evaluates against a partially initialized copy of
another. That is the shape behind the "undefined is not a function" class of startup crash, and it is
sensitive to import order, so it can appear or disappear on a change that looks unrelated.

## How to read the report

Oxlint emits one finding per cyclic import statement, and each finding draws one cycle out of however many
run through that import. Which one it draws is an artifact of the traversal order. Repo-wide the mapping is
exactly one finding per import line, so `libs/actions/Report/index.ts` at 26 findings means 26 of its import
statements each sit on at least one cycle, not that it has 26 cycles to fix.

So a printed cycle path is a symptom, not a work item. Break the cycle it draws and the finding often
survives, now drawing a different cycle through the same import. The first PR shows the scale of this: 457 of
the 534 chains ran through `libs/API/makeRequest.ts -> libs/Middleware/index.ts`, breaking that edge removed
it from all 457, and 0 of the 478 remaining chains mention any `libs/API` or `libs/Middleware` file at any
position. Only **56** findings disappeared. The other 401 import sites had another cycle available and
re-reported that one instead.

The same goes for the count next to a file or an edge. It says how tangled that spot is and nothing about
what fixing it yields.

Totals and cluster membership do hold steady, and they are what to compare runs on. No file's count went up
across that PR, 18 files dropped to zero and stayed there, and 25 surviving files each shed one or two
findings.

## The numbers

| | |
| --- | --- |
| Findings | **534** |
| Files involved | **148**, all under `src/` |
| Mutually dependent clusters | **6**, largest 116 files |
| Import edges inside those clusters | **537** |
| Import edges that must break to reach 0 findings | **54** |
| Shortest and longest cycle | 2 and 39 modules |

Every finding with `file:line:col`, per-file counts, full paths for the 88 shortest cycles, and the full edge
list: **[OXLINT_NO_CYCLE_FINDINGS.md](OXLINT_NO_CYCLE_FINDINGS.md)**. Machine-readable:
`oxlint-no-cycle-findings.json`.

The 54 comes from a greedy feedback-arc-set over the value-import graph, so it is an upper bound and the
true minimum may be lower. Removing all 54 leaves the graph acyclic, confirmed by a
strongly-connected-components pass over the result. Only value imports count, so an `import type` edge never
forms a cycle, and converting an import to type-only is often the cheapest way to break an edge.

## Order of work

Eight PRs, sequenced so each one moves the total. Each row comes from removing that PR's edges on top of
every row above it.

| # | Scope | Edges | Files in cycles after |
| --- | --- | --- | --- |
| 1 | `libs/API` and `libs/Middleware` middleware registration | 2 | 130 |
| 2 | Four independent small clusters: `Text`/`EmojiUtils`, `GPSDraftDetailsUtils`, accounting context, MFA scenarios | 4 | 113 |
| 3 | `libs/Network` queues and `libs/Request` | 4 | 98 |
| 4 | `actions/IOU` internal mesh and `SearchUIUtils` | 10 | 82 |
| 5 | `PolicyUtils`, `OptionsListUtils`, `TransactionUtils`, `actions/connections` | 8 | 76 |
| 6 | `actions/Session`, `actions/Link`, `LoginUtils` and the remaining action modules | 12 | 68 |
| 7 | `ReportUtils` stops importing action modules | 4 | 40 |
| 8 | The util layer stops importing `ReportUtils` | 10 | **0** |

Full edge list per PR, with source line numbers and imported symbols:
**[OXLINT_NO_CYCLE_ROAD_TO_ZERO.md](OXLINT_NO_CYCLE_ROAD_TO_ZERO.md)**.

The order is load-bearing. Running 7 and 8 first gives 98, 98, then 92, so two PRs land with nothing to
show. `ReportUtils` sits inside the mesh, and clearing its edges pays off only once the IOU, policy and
session edges are gone.

PR 1 is merged as [#99670](https://github.com/Expensify/App/pull/99670). It moved the 13 `addMiddleware`
calls out of `makeRequest.ts` into a module the composition root imports, which was 3 files edited plus 1
new file and no test changes. Across the whole repo `import/no-cycle` is the only Oxlint rule whose count
moved.

PRs 2 and 3 are the natural follow-ups: four independent one-edge fixes, then a self-contained subsystem
where the cycle is queue wiring rather than domain logic. PRs 4 through 8 are the 98-file mesh, and those
are real refactoring. All 44 of their edges share one shape: a util reaches into an action module for one or
two helpers, or an action reaches into a sibling action for one. Each needs its own review.

## How the list was produced

`.oxlintrc.json` on the migration branch already has `import/no-cycle: error`, so the whole list comes out of
a normal run:

```bash
npx oxlint . -f json | jq '[.diagnostics[] | select(.code == "import(no-cycle)")] | length'
# 534
```

That is the full type-aware run, roughly 82 s over 8532 files. For iterating on a fix, the rule on its own
takes a few seconds, because `import/no-cycle` is native Rust and needs neither `typeAware` nor any JS
plugin:

```bash
cat > /tmp/no-cycle.json <<'JSON'
{
    "plugins": ["import"],
    "categories": {"correctness": "off"},
    "rules": {"import/no-cycle": "error"},
    "ignorePatterns": ["**/node_modules/**", "**/dist/**", "Mobile-Expensify/**", "src/libs/SearchParser/*.js"]
}
JSON

# human-readable, draws the cycle path under each finding
npx oxlint . -c /tmp/no-cycle.json

# machine-readable
npx oxlint . -c /tmp/no-cycle.json -f json > oxlint-no-cycle-findings.json
```

3.4 s, and the same 534. Oxlint 1.79.0.

Skip `-A all -D import/no-cycle`. It reads like a shortcut, but `-A all` leaves rules the config switches on
intact, so that run still emits all 4469 findings and you filter afterwards either way.

## Definition of done

- A clean Oxlint run reports 0 `import/no-cycle` findings.
- No `eslint-disable` or `oxlint-disable` comment is added for `import/no-cycle` anywhere. A suppressed cycle
  is still a cycle and still carries both costs above.
- `import/no-cycle` stays at `error` in `.oxlintrc.json`, so the guard is live the moment Oxlint lands in CI.

## Non-goals

- Fixing ESLint's resolver so its own copy of the rule stops being inert. Oxlint covers the rule and ESLint
  is on its way out.
- Any restructuring beyond breaking the 54 edges. If an edge cannot be broken without a wider refactor, say
  so on that PR and split it out rather than growing the scope here.
