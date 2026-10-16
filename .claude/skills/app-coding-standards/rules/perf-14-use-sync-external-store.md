---
ruleId: PERF-14
title: Use useSyncExternalStore for external store subscriptions
---

## [PERF-14] Use `useSyncExternalStore` for external store subscriptions

### Reasoning

[`useSyncExternalStore`](https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store) is React's purpose-built hook for reading external store values. It handles concurrent rendering edge cases (tearing), avoids the extra render pass of `useEffect` + `setState`, and makes the subscription contract explicit. Manual subscriptions via `useEffect` are more error-prone and miss these guarantees.

### Incorrect

```tsx
function useOnlineStatus() {
  // Not ideal: Manual store subscription in an Effect
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

### Correct

```tsx
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  // Good: Subscribing to an external store with a built-in Hook
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
    () => navigator.onLine, // How to get the value on the client
    () => true // How to get the value on the server
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A `useEffect` subscribes to an external source (DOM events, third-party store, browser API)
- Inside the listener, at least one `setState` call directly mirrors an external value
  (e.g., `setWidth(window.innerWidth)`, `setOnline(navigator.onLine)`)
- The pattern for that state variable follows: subscribe in setup, unsubscribe in cleanup,
  `setState(externalValue)` in the listener
- Evaluate each state variable independently — if one state variable is a raw mirror of an
  external value, flag it even if the same effect also manages other state for different purposes

**DO NOT flag if:**

- The specific state variable being flagged undergoes transformation, debouncing, or derives
  from computation rather than directly mirroring the external value. Other state variables
  in the same effect that DO directly mirror external values should still be flagged.
- The external API doesn't fit the `subscribe` / `getSnapshot` contract
- The code already uses `useSyncExternalStore`
- The subscription is managed by a library (e.g., Onyx's `useOnyx`)

**Search Patterns** (hints for reviewers):
- `addEventListener`
- `subscribe`
- `useEffect`
- `useState`
