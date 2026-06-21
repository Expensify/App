---
ruleId: PERF-9
title: Avoid useEffect chains
---

## [PERF-9] Avoid useEffect chains

### Reasoning

Chains of effects create complex dependencies, timing issues, and unnecessary renders. Logic should be restructured to avoid interdependent effects.

Chains are wasteful only when the bridge state has no observable render role. If the intermediate state drives UI - conditional rendering, props passed to a rendered child, or gating a subtree - the re-render is the purpose of the state, not waste, and PERF-9 does not apply.

### Incorrect

```tsx
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Avoid: chain of effects
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);

  useEffect(() => {
    setIsValid(fullName.length > 0);
  }, [fullName]);
}
```

### Correct

```tsx
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Good: compute derived values directly
  const fullName = firstName + ' ' + lastName;
  const isValid = firstName.length > 0 && lastName.length > 0;

  return (
    <form>
      <input value={firstName} onChange={e => setFirstName(e.target.value)} />
      <input value={lastName} onChange={e => setLastName(e.target.value)} />
      {isValid && <button>Submit</button>}
    </form>
  );
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Multiple `useEffect` hooks exist
- One effect's state update triggers another effect
- The intermediate state has no render-driving role - it is not referenced in JSX for conditional rendering, prop pass-through to a rendered child, or gating a subtree
- Logic could be combined or computed instead

**DO NOT flag if:**

- The intermediate state is consumed as a render-driving dependency in JSX - e.g., conditional rendering (`{state && <X />}`), prop pass-through to a child the user observes, or gating an entire subtree. In those cases the re-render is the purpose of the state, not waste.
- Effects handle different concerns (e.g., one for setup, one for event listening)
- Effects depend on external events that can't be combined
- Separation of concerns requires multiple effects

**Search Patterns** (hints for reviewers):
- `useEffect`
- `useState`
