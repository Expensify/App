# Why we do not swap to Oxlint's native React Compiler rules

**Status, 2026-08-25.** The two configs the commands below use (`native.oxlintrc.json` and
`sidecar.oxlintrc.json`) were deleted: `rh/*` no longer exists, and Oxlint 1.79.0 replaced the aggregate
rule this compared against. The commands are kept as a record of how the measurement was run, not as
something to re-run. To run the 12 React Compiler rules in isolation today, use
`npx oxlint -c oxlint-migration/rc-rust-probe.oxlintrc.json --no-ignore <path>`. The three `.tsx` files
here are still live inputs to `npm run oxlint-react-compiler-rust`.

Oxlint 1.79.0 ships native Rust ports of the React Compiler checks. Swapping our Node sidecar (`rh/*`)
for them looks like free speed. This directory is the demo of what it actually costs, and of the fact
that the cause is Oxlint's port rather than anything in our setup.

## The behavior, in two commands

`Counter.tsx` is one component with two real bugs (a ref read during render on line 8, a `setState`
inside an effect on line 12) and one unrelated `// eslint-disable-next-line react-hooks/exhaustive-deps`
on line 18.

```bash
# Oxlint's native Rust rules
npx oxlint -c oxlint-migration/native-vs-sidecar-probe/native.oxlintrc.json \
    oxlint-migration/native-vs-sidecar-probe/Counter.tsx

# The Node sidecar we run in production, i.e. the same rule modules ESLint runs
npx oxlint -c oxlint-migration/native-vs-sidecar-probe/sidecar.oxlintrc.json \
    oxlint-migration/native-vs-sidecar-probe/Counter.tsx
```

Native reports one thing, `react/rule-suppression` on line 18, and neither bug. The sidecar reports both
bugs. Delete that one comment and native reports both bugs too, which is the proof that the rules work
and the comment is what silences them:

```bash
grep -v "eslint-disable-next-line react-hooks/exhaustive-deps" \
    oxlint-migration/native-vs-sidecar-probe/Counter.tsx > /tmp/CounterNoComment.tsx
npx oxlint -c oxlint-migration/native-vs-sidecar-probe/native.oxlintrc.json /tmp/CounterNoComment.tsx
```

## The unit is the function, not the file

`Counter.tsx` cannot tell those apart, because everything in it lives in one component. `TwoComponents.tsx`
can: `Dirty` carries the comment and a bug, `Clean` carries no comment and two bugs.

```bash
npx oxlint -c oxlint-migration/native-vs-sidecar-probe/native.oxlintrc.json \
    oxlint-migration/native-vs-sidecar-probe/TwoComponents.tsx
```

| | Oxlint native | ESLint + eslint-plugin-react-hooks 7.1.1 |
| --- | --- | --- |
| `Dirty`, ref read during render | **not reported** | reported |
| `Clean`, ref read during render | reported | reported |
| `Clean`, `setState` in effect | reported | reported |

So a suppression comment blinds its **enclosing component**, not the whole file. This matches Oxlint's
[rule doc](https://oxc.rs/docs/guide/usage/linter/rules/react/rule-suppression.html) ("the whole function
loses optimization") and `filter_suppressions_that_affect_function` in
`crates/oxc_react_compiler/src/react_compiler/entrypoint/suppression.rs`.

It looks file-wide in this repo constantly, because a component is very often the whole file:
`src/components/Search/index.tsx` is a single `function Search({` from line 128 to past line 1060, and all
3 of its suppression comments and all 8 of its compiler findings sit inside it.

## What the swap costs, measured on the whole repo

Native `react/*` for the 12 twins enabled everywhere, `rh/*` twins off, `--type-aware`, compared as
`(rule, file, line)` against the sidecar we ship:

| rule | sidecar | native | lost | native-only |
| --- | --- | --- | --- | --- |
| `refs` | 148 | 108 | 45 | 5 |
| `set-state-in-effect` | 129 | 69 | 60 | 0 |
| `preserve-manual-memoization` | 13 | 6 | 11 | 4 |
| `immutability` | 6 | 3 | 4 | 1 |
| `static-components` | 2 | 1 | 1 | 0 |
| **total** | **298** | **187** | **121** | **10** |

**121 findings lost across 58 files**, and it breaks parity in both directions: native also reports 10
findings ESLint never shows.

## Proof it is Oxlint's Rust port, not our setup

Everything above runs inside this repo, so it cannot by itself rule out our config, our jsPlugins or our
custom rules. This can. Reproduce from scratch in an empty directory **outside** the repo:

```bash
mkdir /tmp/oxlint-isolation && cd /tmp/oxlint-isolation
npm init -y && npm install oxlint@1.79.0          # 2 packages, no patches, no plugins of ours
cat > .oxlintrc.json <<'JSON'
{"plugins": ["react"], "categories": {},
 "rules": {"react/refs": "error", "react/set-state-in-effect": "error", "react/rule-suppression": "error"}}
JSON
```

Then one file per comment variant, each with the same two real bugs and the comment placed far from both.
Measured 2026-08-21 on Oxlint 1.79.0:

| comment present in the file | Oxlint output |
| --- | --- |
| none | `react/refs`, `react/set-state-in-effect` |
| `// eslint-disable-next-line react-hooks/exhaustive-deps` | `react/rule-suppression` only |
| `// eslint-disable-next-line react-hooks/rules-of-hooks` | `react/rule-suppression` only |
| `// oxlint-disable-next-line react-hooks/exhaustive-deps` | `react/rule-suppression` only |
| `/* eslint-disable react-hooks/exhaustive-deps */` at the top of the file | `react/rule-suppression` only |
| `// eslint-disable-next-line react-hooks/refs` | `react/refs`, `react/set-state-in-effect` |
| `// eslint-disable-next-line no-console` | `react/refs`, `react/set-state-in-effect` |
| `// @ts-expect-error` | `react/refs`, `react/set-state-in-effect` |

Then real ESLint, in the same directory, on the same files, with the same plugin version our sidecar
hosts:

```bash
npm install eslint@9 eslint-plugin-react-hooks@7.1.1
# eslint.config.mjs enabling only react-hooks/refs and react-hooks/set-state-in-effect
```

ESLint reports both bugs in every case. Oxlint reports neither whenever the comment is present. Same
machine, same files, same plugin version, no Expensify config on either side.

The Rust source matches the table exactly. `crates/oxc_linter/src/utils/react_compiler.rs` hardcodes the
trigger list for the whole rule family as `react-hooks/exhaustive-deps`, `react-hooks/rules-of-hooks`,
`react/exhaustive-deps` and `react/rules-of-hooks`, which is why `react-hooks/refs` changes nothing. And
`find_program_suppressions` matches the `oxlint-` spellings as well as the `eslint-` ones, which is why
row 4 behaves like row 2. That last point matters beyond this table: the twin-comment codemod on
`feat/oxlint-fixed` would have armed the bail-out just as effectively as the ESLint comments do, so
translating the comments was never a way out. They have to be gone.

## No knob, but a clean thing to ask for

Every rule in the family is declared `RuleNoConfig` in `apps/oxlint/src-js/package/config.generated.ts`,
so none of them accept options. `options.respectEslintDisableDirectives: false` does not reach it either
(measured: it un-suppresses the plain `react-hooks/exhaustive-deps` rule and the compiler checks stay
silent).

The mechanism does exist in the crate, though. The standalone `transform-react` package exposes
`eslintSuppressionRules`, and `crates/oxc_react_compiler/tests/transform.rs` has a passing test named
`empty_eslint_suppression_rules_disable_bailouts` proving an empty list disables the bail-outs. So the
request to file is **"expose `eslintSuppressionRules` on the linter rules the way the transform package
already does"**, not "please change your suppression policy". Nobody has asked for it: searched across the
oxc tracker open and closed, the web, Reddit, HN, Stack Overflow and CN/JP/KR blogs.
