---
ruleId: CONSISTENCY-4
title: Eliminate unused and redundant props
---

## [CONSISTENCY-4] Eliminate unused and redundant props

### Reasoning

Unused props increase component complexity and maintenance overhead. Simplifying component interfaces improves code clarity and makes the component API easier to understand.

### Incorrect

```tsx
type ButtonProps = {
  title: string;
  onPress: () => void;
  unusedProp: string; // Never used in component
  anotherUnused: number; // Never used in component
};

function Button({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

### Correct

```tsx
type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

function Button({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- A component defines props that are not referenced in its implementation
- The prop is not conditionally used or part of a larger interface
- The prop is not prepared for future use or part of an ongoing refactor

**DO NOT flag if:**

- Props are conditionally used or part of a larger interface
- Props are prepared for future use or part of an ongoing refactor
- The prop is necessary for functionality or future extensibility
- The prop is redundant but serves a distinct purpose (e.g., backward compatibility)

**Search Patterns** (hints for reviewers):
- `type.*Props`
- `interface.*Props`
