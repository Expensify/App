---
ruleId: CONSISTENCY-13
title: Document component props with a JSDoc block comment
---

## [CONSISTENCY-13] Document component props with a JSDoc block comment

### Reasoning

Per `contributingGuides/STYLE.md`, every component prop is documented with a `/** ... */` block comment above it so its purpose is clear at the definition site. This rule enforces the *presence* of that documentation when a new props type is added with no documented props at all. It is the companion to CONSISTENCY-10, which enforces JSDoc *style* and catches the mixed cases (a `//` comment on a prop, or an undocumented prop sitting next to documented siblings). Together they ensure every prop carries a `/** */` block.

### Incorrect

```tsx
type ButtonProps = {
    isDisabled: boolean;
    onPress: () => void;
};
```

### Correct

```tsx
type ButtonProps = {
    /** Whether the button is disabled */
    isDisabled: boolean;

    /** Called when the button is pressed */
    onPress: () => void;
};
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds (or newly introduces the members of) a component props type/interface - a `type`/`interface` whose name ends in `Props`
- It declares one or more of its own props
- **None** of those props has a `/** ... */` block comment above it

**DO NOT flag if:**

- At least one prop in the type is already documented with `/** */` (the mixed/undocumented-sibling and `//`-comment cases belong to CONSISTENCY-10, not here - avoid double-flagging)
- The type only re-exports, extends, intersects, or spreads props from a base type documented elsewhere and declares no new members of its own
- The props are inherited from a shared base type
- The file is a test or story

**Search Patterns** (hints for reviewers):
- Added `type ...Props = {` / `interface ...Props {` blocks whose members have no preceding `/** */`
