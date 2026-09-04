---
ruleId: CONSISTENCY-10
title: Follow the JSDoc style guidelines and document props only where there is something to say
---

## [CONSISTENCY-10] Follow the JSDoc style guidelines and document props only where there is something to say

### Reasoning

Per `contributingGuides/STYLE.md`, TypeScript already encodes types, so JSDoc must not repeat them. Do not put types in `@param`/`@returns`, do not use `@private`/`@memberof`/`@implements`/`@enum`/`@override`, and use `@returns` (not `@return`). Omit a `@param` line entirely when it would carry no description.

The same principle applies to component props and `src/types/onyx/**` properties. A member is documented with a `/** ... */` block comment above it (never a `//` comment) when there is a non-obvious fact to add: a unit, a default, a boundary condition, null/undefined semantics, ownership, an invariant, or how it differs from a sibling. A member whose name and type make it self-explanatory needs no comment, and a comment that only restates the de-camelCased name or the type adds nothing and buries the comments that do say something. So this rule cuts both ways: an undocumented member with a non-obvious fact is missing a comment, and a comment with no fact in it should be deleted rather than padded. An undocumented self-explanatory member next to documented non-obvious ones is the normal, expected shape of a type.

ESLint's `jsdoc/require-jsdoc` only requires a comment on the `TSInterfaceDeclaration`/`TSTypeAliasDeclaration` itself for `src/types/onyx/**`; it does not check individual properties there. This rule is what catches an undocumented property that genuinely needs a comment.

### Incorrect

```tsx
/**
 * @param {string} reportID - the report id
 * @param {boolean} isArchived
 * @return {string}
 */
function getReportName(reportID: string, isArchived: boolean): string {
    // ...
}

type TooltipProps = {
    // Milliseconds before the tooltip auto-dismisses, defaults to 3000
    autoDismissDelay?: number;

    /** Icon width */
    iconWidth: number;

    /** Whether the tooltip is visible */
    isVisible: boolean;

    // No comment, but the unit and default are non-obvious
    maxWidth?: number;
};
```

### Correct

```tsx
/**
 * @param reportID - the report id
 * @returns the human-readable report name
 */
function getReportName(reportID: string, isArchived: boolean): string {
    // ...
}

type TooltipProps = {
    /** Milliseconds before the tooltip auto-dismisses, defaults to 3000 */
    autoDismissDelay?: number;

    /** Width in px */
    iconWidth: number;

    isVisible: boolean;

    /** In px, defaults to the window width */
    maxWidth?: number;
};
```

Also flags a PR that deletes a member's comment and leaves a non-obvious fact undocumented:

```tsx
type TooltipProps = {
-   /** Milliseconds before the tooltip auto-dismisses, defaults to 3000 */
    autoDismissDelay?: number;
};
```

---

### Review Metadata

A "type" below means any object member group with its own set of properties: a top-level `type`/`interface`, or a nested/anonymous inline object literal type (e.g. `settings: { ... }`) inside one. Each nesting level is judged on its own members; a documented outer property does not shield an undocumented member of its own nested object literal. "Member" below means a component prop in a `...Props` type or a property of a type in `src/types/onyx/**`. Only members this PR itself added, modified, or whose comment this PR added, modified, or removed are in scope; untouched pre-existing members are not.

Flag ONLY when ANY of these is true:

- A JSDoc `@param`/`@returns` includes a TypeScript type in braces (e.g. `@param {string}`)
- A JSDoc block uses `@return` instead of `@returns`, or uses `@private`/`@memberof`/`@implements`/`@enum`/`@override`
- A `@param` line has a name but no description (it should be omitted)
- A member is documented with a `//` comment instead of `/** ... */`. Convert it to `/** ... */` if it adds a real fact (a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling); delete it instead if it adds nothing
- A member that this PR added, modified, or stripped the comment from is left undocumented AND has a non-obvious fact to add (a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling)
- A `/** ... */` comment this PR added or modified says only what the de-camelCased member name and its type already say (e.g. "Whether X" / "Is X" / "Has X" restating a boolean name, "The `<name>`" or "`<Name>` of/for the `<owner>`", a bare noun phrase equal to the name, or an echo of the type word like "Style", "Callback", "ID") and names none of a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling. Rewrite it to state the fact if the member has one; delete it if it does not

**DO NOT flag if:**

- The function is a trivial inline arrow with no JSDoc and self-evident behavior (JSDoc not required)
- The undocumented member's name and type are already self-explanatory; it needs no comment even if siblings have one
- The comment names a unit, default value, boundary condition, null/undefined semantics, ownership/lifetime, an invariant, or how the member differs from another member (e.g. "Distinct from `containerStyle`, which styles the outer wrapper")
- The member is inherited/spread from a shared base type documented elsewhere, or the type only re-exports, extends, intersects, or spreads members from such a base type and declares no new members of its own
- The member and its comment are untouched by the change
- The file is a test or story

**Search Patterns** (hints for reviewers):
- `@param {` / `@returns {` / `@return ` / `@private` / `@memberof`
- `//` comments directly above members of a `...Props` type, or above properties in `src/types/onyx/**`
- Added or modified members of a `...Props` type or an `src/types/onyx/**` type with no preceding `/** */`
- Added or modified `/** ... */` comments directly above such members
- A removed `/** ... */` block in the diff (a `-` line) above such a member
