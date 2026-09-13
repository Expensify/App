---
ruleId: PERF-12
title: Prevent memory leaks in components and plugins
---

## [PERF-12] Prevent memory leaks in components and plugins

### Reasoning

Failing to clear resources causes memory leaks, leading to increased memory consumption and potential crashes, especially in long-lived components or components that mount/unmount frequently.

### Incorrect

```tsx
function TimerComponent() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTimer();
    }, 1000);
    // Missing cleanup - interval will continue after unmount
  }, []);

  return <Text>Timer</Text>;
}
```

### Correct

```tsx
function TimerComponent() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <Text>Timer</Text>;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A resource (timeout, interval, event listener, subscription, etc.) is created in a component
- The resource is not cleared upon component unmount
- Asynchronous operations are initiated without a corresponding cleanup mechanism

**DO NOT flag if:**

- The resource is cleared properly in a cleanup function (e.g., inside `useEffect` return)
- The resource is not expected to persist beyond the component's lifecycle
- The resource is managed by a library that handles cleanup automatically
- The operation is guaranteed to complete before the component unmounts

**Search Patterns** (hints for reviewers):
- `setInterval`
- `setTimeout`
- `addEventListener`
- `subscribe`
- `useEffect`
