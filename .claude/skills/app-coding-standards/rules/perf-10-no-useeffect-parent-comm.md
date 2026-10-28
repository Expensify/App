---
ruleId: PERF-10
title: Communicate with parent components without useEffect
---

## [PERF-10] Communicate with parent components without useEffect

### Reasoning

Parent-child communication should not use useEffect. Instead, lift the state up to the parent component and pass it down as props. This follows React's unidirectional data flow pattern, eliminates synchronization issues, reduces unnecessary renders, and makes the data flow clearer. Use useEffect only when synchronizing with external systems, not for parent-child communication.

### Incorrect

```tsx
// Avoid: passing data via useEffect
function Child({ onValueChange }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    onValueChange(value);
  }, [value, onValueChange]);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```

### Correct

```tsx
// Lifting state up
function Parent() {
  const [value, setValue] = useState('');
  return <Child value={value} onChange={setValue} />;
}

function Child({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- `useEffect` calls parent callbacks (onValueChange, onChange, etc.)
- The callback is used to pass state to parent
- State could be lifted to the parent instead

**DO NOT flag if:**

- useEffect synchronizes with external systems, not parent components
- Callback performs side effects unrelated to passing state
- Circular state updates would result from lifting state

**Search Patterns** (hints for reviewers):
- `useEffect`
- `onChange`
- `onValueChange`
