---
name: coding-standards
description: Provides coding standards for React Native — performance patterns, consistency rules, and clean React architecture. Use when writing, modifying, or reviewing code.
alwaysApply: true
---

# Expensify Coding Standards

Coding standards for the Expensify App. Each standard is a standalone file in `rules/` with reasoning, examples, and applicability conditions.

## Categories

| Category | Prefix | Focus |
|----------|--------|-------|
| Performance | `PERF-*` | Render optimization, memo patterns, useEffect hygiene, data selection |
| Consistency | `CONSISTENCY-*` | Platform checks, magic values, unused props, ESLint discipline |
| Clean React Patterns | `CLEAN-REACT-PATTERNS-*` | Composition, component ownership, state structure |

## Quick Reference

### Performance
- [PERF-1](rules/perf-1-no-spread-in-renderitem.md) — No spread in renderItem
- [PERF-2](rules/perf-2-early-return.md) — Return early before expensive work
- [PERF-3](rules/perf-3-onyx-list-item-provider.md) — Use OnyxListItemProvider in renderItem
- [PERF-5](rules/perf-5-shallow-comparison.md) — Shallow over deep comparisons
- [PERF-6](rules/perf-6-derive-state-from-props.md) — Derive state from props
- [PERF-7](rules/perf-7-reset-via-key-prop.md) — Reset via key prop
- [PERF-8](rules/perf-8-events-in-handlers.md) — Handle events in handlers
- [PERF-9](rules/perf-9-no-useeffect-chains.md) — No useEffect chains
- [PERF-10](rules/perf-10-no-useeffect-parent-comm.md) — No useEffect parent communication
- [PERF-11](rules/perf-11-optimize-data-selection.md) — Optimize data selection
- [PERF-12](rules/perf-12-prevent-memory-leaks.md) — Prevent memory leaks
- [PERF-13](rules/perf-13-hoist-iterator-calls.md) — Hoist iterator-independent calls
- [PERF-14](rules/perf-14-use-sync-external-store.md) — Use useSyncExternalStore
- [PERF-15](rules/perf-15-cleanup-async-effects.md) — Clean up async Effects
- [PERF-16](rules/perf-16-guard-double-init.md) — Guard double initialization

### Consistency
- [CONSISTENCY-1](rules/consistency-1-no-platform-checks.md) — No platform-specific checks in components
- [CONSISTENCY-2](rules/consistency-2-no-magic-values.md) — No magic numbers/strings
- [CONSISTENCY-3](rules/consistency-3-no-code-duplication.md) — No code duplication
- [CONSISTENCY-4](rules/consistency-4-no-unused-props.md) — No unused props
- [CONSISTENCY-5](rules/consistency-5-justify-eslint-disable.md) — Justify ESLint disables
- [CONSISTENCY-6](rules/consistency-6-proper-error-handling.md) — Proper error handling

### Clean React Patterns
- [CLEAN-REACT-PATTERNS-1](rules/clean-react-1-composition-over-config.md) — Composition over configuration
- [CLEAN-REACT-PATTERNS-2](rules/clean-react-2-own-behavior.md) — Components own their behavior
- [CLEAN-REACT-PATTERNS-3](rules/clean-react-3-context-free-contracts.md) — Context-free component contracts
- [CLEAN-REACT-PATTERNS-4](rules/clean-react-4-no-side-effect-spaghetti.md) — No side-effect spaghetti
- [CLEAN-REACT-PATTERNS-5](rules/clean-react-5-narrow-state.md) — Keep state narrow

## Usage

**During development**: When writing or modifying `src/` files, consult the relevant standard files for detailed conditions, examples, and exceptions.

**During review**: The code-inline-reviewer agent loads all standards from this directory. See `.claude/agents/code-inline-reviewer.md`.
