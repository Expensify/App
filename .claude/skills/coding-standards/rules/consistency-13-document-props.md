---
ruleId: CONSISTENCY-13
title: Document component props and Onyx type properties with a JSDoc block comment
---

## [CONSISTENCY-13] Document component props and Onyx type properties with a JSDoc block comment

### Reasoning

Per `contributingGuides/STYLE.md`, a component prop or an `src/types/onyx/**` property is documented with a `/** ... */` block comment above it when there is a non-obvious fact to add: a unit, a default, a boundary condition, null/undefined semantics, ownership, an invariant, or how it differs from a sibling. One whose name and type already say everything there is to say is documented by its name; it needs no comment. This rule enforces the *presence* of documentation where there is a non-obvious fact to document, not on every member unconditionally, and applies equally to a brand new type, to a new member added to an existing, entirely uncommented type, and to a change that deletes an existing member's comment and leaves that fact undocumented. It is the companion to CONSISTENCY-10, which enforces JSDoc *style* and catches the mixed cases (a `//` comment on a member, or an undocumented member sitting next to documented siblings).

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

- The changed code adds, modifies, or removes one or more members' `/** ... */` comments of a component props type/interface (a `type`/`interface` whose name ends in `Props`) or of a type/interface in `src/types/onyx/**` - whether the type declaration itself is new or pre-existing
- **None** of the type's members - old or newly added - has a `/** ... */` block comment above it after the change
- At least one undocumented member - whether it was already undocumented, newly added, or had its comment just deleted by this change - has a non-obvious fact to add (a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling) - a member whose name and type are already self-explanatory needs no comment and does not trigger this rule

**DO NOT flag if:**

- At least one member in the type is already documented with `/** */` (the mixed/undocumented-sibling and `//`-comment cases belong to CONSISTENCY-10, not here - avoid double-flagging)
- The type only re-exports, extends, intersects, or spreads members from a base type documented elsewhere and declares no new members of its own
- The members are inherited from a shared base type
- The file is a test or story

**Search Patterns** (hints for reviewers):
- Added `type ...Props = {` / `interface ...Props {` blocks, or added types/interfaces under `src/types/onyx/**`, whose members have no preceding `/** */`
- A new member added to an existing `...Props` type or an existing `src/types/onyx/**` type, where that type has no `/** */`-documented member at all (old or new)
- A removed `/** ... */` block in the diff (a `-` line) above a member of a `...Props` type or an `src/types/onyx/**` property, where that member had a non-obvious fact to say and no other member in the type stays documented
