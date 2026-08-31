---
ruleId: CONSISTENCY-13
title: Document component props and Onyx type properties with a JSDoc block comment
---

## [CONSISTENCY-13] Document component props and Onyx type properties with a JSDoc block comment

### Reasoning

Per `contributingGuides/STYLE.md`, a component prop or an `src/types/onyx/**` property is documented with a `/** ... */` block comment above it when there is a non-obvious fact to add: a unit, a default, a boundary condition, null/undefined semantics, ownership, an invariant, or how it differs from a sibling. One whose name and type already say everything there is to say is documented by its name; it needs no comment. This rule enforces the *presence* of documentation where there is a non-obvious fact to document, not on every member unconditionally. It is the companion to CONSISTENCY-10, which enforces JSDoc *style* and catches the mixed cases (a `//` comment on a member, or an undocumented member sitting next to documented siblings).

ESLint's `jsdoc/require-jsdoc` only requires a comment on the `TSInterfaceDeclaration`/`TSTypeAliasDeclaration` itself for `src/types/onyx/**`; it does not check individual properties there. This rule and CONSISTENCY-10 are what catch an undocumented property that genuinely needs a comment.

### Incorrect

```tsx
type TooltipProps = {
    autoDismissDelay?: number;
    onPress: () => void;
};
```

### Correct

```tsx
type TooltipProps = {
    /** Milliseconds before the tooltip auto-dismisses, defaults to 3000 */
    autoDismissDelay?: number;

    onPress: () => void;
};
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds (or newly introduces the members of) either a component props type/interface (a `type`/`interface` whose name ends in `Props`) or a type/interface in `src/types/onyx/**`
- It declares one or more of its own members
- **None** of those members has a `/** ... */` block comment above it
- At least one of the undocumented members has a non-obvious fact to add (a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling) - a member whose name and type are already self-explanatory needs no comment and does not trigger this rule

**DO NOT flag if:**

- At least one member in the type is already documented with `/** */` (the mixed/undocumented-sibling and `//`-comment cases belong to CONSISTENCY-10, not here - avoid double-flagging)
- The type only re-exports, extends, intersects, or spreads members from a base type documented elsewhere and declares no new members of its own
- The members are inherited from a shared base type
- The file is a test or story

**Search Patterns** (hints for reviewers):
- Added `type ...Props = {` / `interface ...Props {` blocks, or added types/interfaces under `src/types/onyx/**`, whose members have no preceding `/** */`
