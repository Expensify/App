---
ruleId: CONSISTENCY-19
title: Prop and Onyx property comments must add information
---

## [CONSISTENCY-19] Prop and Onyx property comments must add information

### Reasoning

Per `contributingGuides/STYLE.md`, a prop's `/** ... */` comment exists to carry facts the name and type cannot. Concretely, one of: a unit, a default, a boundary condition (inclusive/exclusive, min/max), null/undefined semantics, ownership or lifetime, an invariant, or how a prop differs from a sibling. A comment that only restates the de-camelCased name (or the type) adds nothing, and when every prop carries one of these it buries the comments that actually say something. If a prop has nothing non-obvious to say, it is already documented by its name; delete the comment instead of padding it.

This rule only judges the *content* of a comment that exists. Whether a prop with no comment at all should get one is CONSISTENCY-13's job, not this rule's.

### Incorrect

```tsx
type ComponentProps = {
    /** Icon width */
    iconWidth: number;

    /** Title of the modal */
    title: string;

    /** Whether the modal is visible */
    isVisible: boolean;
};
```

### Correct

```tsx
type ComponentProps = {
    /** Width in px */
    iconWidth: number;

    title: string;

    isVisible: boolean;
};
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds or modifies a `/** ... */` comment on a component prop or an `src/types/onyx/**` property
- The comment says only what the de-camelCased prop name and its type already say (e.g. "Whether X" / "Is X" / "Has X" restating a boolean name, "The `<name>`" or "`<Name>` of/for the `<owner>`", a bare noun phrase equal to the name, or an echo of the type word like "Style", "Callback", "ID")
- None of a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling prop is present in the comment

**DO NOT flag if:**

- The comment names a unit, default value, boundary condition, null/undefined semantics, ownership/lifetime, an invariant, or how the prop differs from another prop (e.g. "Distinct from `containerStyle`, which styles the outer wrapper")
- The prop is inherited/spread from a shared base type documented elsewhere
- The file is a test or story
- The comment is untouched by the change (only newly added or modified comments are in scope)

**Search Patterns** (hints for reviewers):
- Newly added/modified `/** ... */` comments directly above a prop in a `...Props` type or an `src/types/onyx/**` property
