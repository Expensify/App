---
ruleId: PERF-3
title: Use OnyxListItemProvider hooks instead of useOnyx in renderItem
---

## [PERF-3] Use OnyxListItemProvider hooks instead of useOnyx in renderItem

### Reasoning

Individual `useOnyx` calls in renderItem create separate subscriptions for each list item, causing memory overhead and update cascades. `OnyxListItemProvider` hooks provide optimized data access patterns specifically designed for list rendering performance.

### Incorrect

```tsx
const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
```

### Correct

```tsx
const personalDetails = usePersonalDetails();
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Code is inside a renderItem function
- A `useOnyx` hook is being called
- A dedicated hook exists in OnyxListItemProvider for that data

**DO NOT flag if:**

- Component is not inside renderItem
- No OnyxListItemProvider hook exists for the data
- Data structure is custom and requires raw Onyx access

**Search Patterns** (hints for reviewers):
- `useOnyx`
- `renderItem`
