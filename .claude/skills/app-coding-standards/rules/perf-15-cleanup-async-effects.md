---
ruleId: PERF-15
title: Clean up async Effects to prevent race conditions
---

## [PERF-15] Clean up async Effects to prevent race conditions

### Reasoning

When an Effect's dependencies change, the previous async operation [may still be in flight](https://react.dev/learn/you-might-not-need-an-effect#fetching-data). Without cleanup, a slow earlier response can overwrite the result of a faster later response, showing stale data. This is especially dangerous for search inputs and navigation where dependencies change rapidly.

### Incorrect

```tsx
useEffect(() => {
    fetchResults(query).then((json) => {
        setResults(json);
    });
}, [query]);
```

### Correct (ignore flag)

```tsx
useEffect(() => {
    let ignore = false;

    fetchResults(query).then((json) => {
        if (!ignore) {
            setResults(json);
        }
    });

    return () => {
        ignore = true;
    };
}, [query]);
```

### Correct (AbortController)

```tsx
useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/search?q=${query}`, {signal: controller.signal})
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch((e) => {
            if (e.name !== 'AbortError') {
                setError(e);
            }
        });

    return () => controller.abort();
}, [query]);
```

---

### Review Metadata

Flag when EITHER of these is true:

**Case 1 — Missing cleanup:**
- A `useEffect` performs async work (fetch, promise chain, async/await)
- The async callback performs side effects (setState, navigation, data mutations, deletions)
- There is no cleanup mechanism to discard stale responses (no `ignore` flag, no `AbortController`, no cancellation token)

**Case 2 — Suppressed dependency lint:**
- A `useEffect` performs async work and triggers side effects (setState, navigation, mutations)
- The dependency array has an `eslint-disable` comment suppressing `react-hooks/exhaustive-deps`
- This hides a dependency that could change and cause a race condition

**DO NOT flag if:**

- The Effect includes an `ignore`/`cancelled` boolean checked before `setState`
- The Effect uses `AbortController` to cancel the request on cleanup
- The async operation is truly fire-and-forget (no setState, no navigation, no mutations, just logging or analytics that are safe to complete after unmount)
- The dependency array is empty `[]` with no suppressed lint, AND the async callback only performs idempotent/safe operations (no navigation, no destructive mutations that could fire after unmount)
- Data fetching is handled by a library/framework (e.g., Onyx, React Query)

**Search Patterns** (hints for reviewers):
- `useEffect`
- `fetch\(`
- `async`
- `await`
- `\.then\(`
- `setState`
- `eslint-disable`
