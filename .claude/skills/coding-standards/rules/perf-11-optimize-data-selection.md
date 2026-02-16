---
ruleId: PERF-11
title: Optimize data selection and handling
---

## [PERF-11] Optimize data selection and handling

### Reasoning

Using broad data structures or performing unnecessary data operations causes excessive re-renders and degrades performance. Selecting specific fields and avoiding redundant operations reduces render cycles and improves efficiency.

### Incorrect

```tsx
function UserProfile({ userId }) {
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`);
  // Component re-renders when any user field changes, even unused ones
  return <Text>{user?.name}</Text>;
}
```

### Correct

```tsx
function UserProfile({ userId }) {
  const [user] = useOnyx(`${ONYXKEYS.USER}${userId}`, {
    selector: (user) => ({
      name: user?.name,
      avatar: user?.avatar,
    }),
  });
  return <Text>{user?.name}</Text>;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A component uses a broad data structure (e.g., entire object) without selecting specific fields
- This causes unnecessary re-renders when unrelated fields change
- OR unnecessary data filtering/fetching is performed (excluding necessary data, fetching already available data)

**DO NOT flag if:**

- Specific fields are already being selected or the data structure is static
- The filtering is necessary for correct functionality
- The fetched data is required and cannot be derived from existing data
- The function requires the entire object for valid operations

**Search Patterns** (hints for reviewers):
- `useOnyx`
- `selector`
- `\.filter\(`
- `\.map\(`
