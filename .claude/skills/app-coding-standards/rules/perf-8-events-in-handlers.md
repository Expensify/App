---
ruleId: PERF-8
title: Handle events in event handlers
---

## [PERF-8] Handle events in event handlers

### Reasoning

Event handlers provide immediate response and clearer code flow. useEffect adds unnecessary render cycles and makes the relationship between user action and response less clear.

### Incorrect

```tsx
function BuyButton({ productId, onBuy }) {
  const [isBuying, setIsBuying] = useState(false);

  // Avoid: handling events in useEffect
  useEffect(() => {
    if (isBuying) {
      onBuy();
      showNotification('Item purchased!');
    }
  }, [isBuying, onBuy]);

  return <button onClick={() => setIsBuying(true)}>Buy</button>;
}
```

### Correct

```tsx
function BuyButton({ productId, onBuy }) {
  function handleClick() {
    // Good: handle event directly in event handler
    onBuy();
    showNotification('Item purchased!');
  }

  return <button onClick={handleClick}>Buy</button>;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- `useEffect` responds to user events
- The event handler is available (onClick, onChange, etc.)
- Logic could be moved directly to the event handler

**DO NOT flag if:**

- useEffect performs necessary setup/teardown not tied to events
- Event response depends on component state initialization
- Multiple events need the same handler and useEffect is cleaner

**Search Patterns** (hints for reviewers):
- `useEffect`
- `useState`
