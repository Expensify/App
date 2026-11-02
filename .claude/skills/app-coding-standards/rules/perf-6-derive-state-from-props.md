---
ruleId: PERF-6
title: Derive state from props
---

## [PERF-6] Derive state from props

### Reasoning

Computing derived values directly in the component body ensures they're always synchronized with props/state and avoids unnecessary re-renders.

### Incorrect

```tsx
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // Avoid: redundant state and unnecessary Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
}
```

### Correct

```tsx
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // Good: calculated during rendering
  const fullName = firstName + ' ' + lastName;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- `useEffect` updates state based on props or other state
- The value could be computed directly in the component body
- No side effects are involved

**DO NOT flag if:**

- useEffect performs side effects (API calls, subscriptions, etc.)
- The computed value is needed immediately on mount
- Computation depends on timing or external events

**Search Patterns** (hints for reviewers):
- `useEffect`
- `useState`
