---
ruleId: PERF-6
title: Derive state from props
---

## [PERF-6] Derive state from props

### Reasoning

Computing derived values directly in the component body ensures they're always synchronized with props/state and avoids unnecessary re-renders.

### Incorrect

#### Incorrect (redundant state synced via effect)

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

#### Incorrect (cascading effects — loop hazard)

Chaining effects where one state update triggers another can create infinite loops, especially when a derived value accidentally ends up in a dependency array.

```tsx
function Cart({ subtotal }) {
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTax(subtotal * 0.1);
  }, [subtotal]);

  // total in deps creates: state update → render → effect → state update → ...
  useEffect(() => {
    setTotal(subtotal + tax);
  }, [subtotal, tax, total]);
}
```

```tsx
// Good: no effects, no loop risk
function Cart({ subtotal }) {
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
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
