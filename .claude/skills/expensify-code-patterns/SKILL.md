---
name: expensify-code-patterns
description: >
  Expensify React Native code patterns for performance, consistency, and clean architecture.
  Use when writing React components, using Onyx/useOnyx, implementing list rendering (FlatList, renderItem),
  working with useEffect, or reviewing code. Covers memoization, state management, composition patterns.
---

# Expensify Code Patterns

Patterns for writing performant, maintainable React Native code in the Expensify App.
These rules serve both as development guidance and as the basis for automated code review.

## Pattern Index

| Category | Rules | Documentation |
|----------|-------|---------------|
| **Performance** | PERF-1 to PERF-13 | [PERFORMANCE.md](references/PERFORMANCE.md) |
| **Consistency** | CONSISTENCY-1 to CONSISTENCY-6 | [CONSISTENCY.md](references/CONSISTENCY.md) |
| **Components** | PATTERNS-1 to PATTERNS-5 | [COMPONENTS.md](references/COMPONENTS.md) |
| **Onyx** | Selectors, providers, subscriptions | [ONYX.md](references/ONYX.md) |

## Rule Summary

### Performance (PERF-1 to PERF-13)
Optimize rendering, reduce re-renders, prevent memory leaks.
→ [Full documentation](references/PERFORMANCE.md)

### Consistency (CONSISTENCY-1 to CONSISTENCY-6)
Platform handling, magic numbers, duplication, unused props, ESLint justification, error handling.
→ [Full documentation](references/CONSISTENCY.md)

### Components (PATTERNS-1 to PATTERNS-5)
Composition, ownership, contracts, effect organization, state structure.
→ [Full documentation](references/COMPONENTS.md)

### Onyx Patterns
Selectors, subscriptions, list item providers.
→ [Full documentation](references/ONYX.md)
