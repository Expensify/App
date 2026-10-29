---
ruleId: PERF-16
title: Guard initialization logic against double-execution
---

## [PERF-16] Guard initialization logic against double-execution

### Reasoning

React Strict Mode [intentionally double-invokes Effects](https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application) in development to surface missing cleanup. Non-idempotent initialization — whether app-wide (auth tokens, global config) or per-feature (SDK setup, analytics session creation, deep link handler registration) — can break when executed twice. Guarding with a module-level flag or moving initialization outside the component ensures it runs exactly once regardless of rendering mode.

### Incorrect

```tsx
function App() {
    useEffect(() => {
        loadDataFromLocalStorage();
        checkAuthToken();
    }, []);
}
```

### Correct (module-level guard)

```tsx
let didInit = false;

function App() {
    useEffect(() => {
        if (didInit) {
            return;
        }
        didInit = true;

        loadDataFromLocalStorage();
        checkAuthToken();
    }, []);
}
```

### Correct (module-level execution)

```tsx
if (typeof window !== 'undefined') {
    checkAuthToken();
    loadDataFromLocalStorage();
}

function App() {
    // ...
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A `useEffect` with empty dependency array `[]` runs non-idempotent initialization logic
- The logic would cause problems if executed twice (e.g., double API calls, invalidated tokens, duplicate SDK init, duplicate analytics sessions, duplicate deep link registrations)
- There is no guard mechanism (module-level flag or module-level execution)
- This applies at any level — app-wide init, feature screens, or individual components

**DO NOT flag if:**

- A module-level or ref-based guard variable prevents double execution. A proper execution guard follows this pattern: `if (didInit) return; didInit = true;` — it checks a flag AND sets it. Conditional checks on data/props (e.g., `if (!transaction) return`, `if (action !== 'CREATE') return`) are NOT execution guards — they validate preconditions but don't prevent the logic from running again if the same preconditions hold in a second invocation (which happens in React Strict Mode).
- The logic is idempotent (safe to run twice with no side effects)
- NOTE: Navigation calls (e.g., `navigate()`), data deletion (e.g., `removeDraftTransactions()`) and similar mutations are NOT idempotent — running them twice produces different/undesirable results.
- The logic is at module level, outside any component
- The Effect has non-empty dependencies (not one-time init)

**Search Patterns** (hints for reviewers):
- `useEffect`
- `\[\]` (empty dependency array)
