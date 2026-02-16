---
ruleId: PERF-1
title: No spread in list item's renderItem
---

## [PERF-1] No spread in list item's renderItem

### Reasoning

`renderItem` functions execute for every visible list item on each render. Creating new objects with spread operators forces React to treat each item as changed, preventing reconciliation optimizations and causing unnecessary re-renders of child components.

### Incorrect

```tsx
<Component
  item={{
      shouldAnimateInHighlight: isItemHighlighted,
      isSelected: selected,
      ...item,
  }}
/>
```

### Correct

```tsx
<Component
  item={item}
  isSelected={isSelected}
  shouldAnimateInHighlight={isItemHighlighted}
/>
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- Code is inside a renderItem function (function passed to FlatList, SectionList, etc.)
- A spread operator (...) is used on an object
- That object is being passed as a prop to a component
- The spread creates a NEW object literal inline

**DO NOT flag if:**

- Spread is used outside renderItem
- Spread is on an array
- Object is created once outside renderItem and reused
- Spread is used to clone for local manipulation (not passed as prop)

**Search Patterns** (hints for reviewers):
- `renderItem`
- `\.\.\.` (spread operator)
