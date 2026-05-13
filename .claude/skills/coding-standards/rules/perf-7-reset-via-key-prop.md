---
ruleId: PERF-7
title: Control component resets via key prop
---

## [PERF-7] Control component resets via key prop

### Reasoning

Using `key` prop for full resets is more React-idiomatic. When a prop changes and you need to reset all component state, the `key` prop causes React to unmount and remount the component, automatically resetting all state without needing useEffect.

### Incorrect

```tsx
function ProfilePage({ userId }) {
  return <ProfileView userId={userId} />;
}

function ProfileView({ userId }) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setComment(''); // Reset when userId changes
    setRating(0);
  }, [userId]);
}
```

### Correct

```tsx
function ProfilePage({ userId }) {
  return <ProfileView key={userId} userId={userId} />;
}

function ProfileView({ userId }) {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  // Component resets when userId changes due to key prop
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- `useEffect` resets all or most component state when a prop changes
- The component could be reset using the `key` prop instead
- No side effects other than state reset are needed

**DO NOT flag if:**

- useEffect performs other side effects besides state reset
- Only partial state needs to be reset
- Key changes would cause unintended side effects

**Search Patterns** (hints for reviewers):
- `useEffect`
- `useState`
