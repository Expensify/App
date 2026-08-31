---
ruleId: CONSISTENCY-10
title: Follow the JSDoc style guidelines
---

## [CONSISTENCY-10] Follow the JSDoc style guidelines

### Reasoning

Per `STYLE.md`, TypeScript already encodes types, so JSDoc must not repeat them. Do not put types in `@param`/`@returns`, do not use `@private`/`@memberof`/`@implements`/`@enum`/`@override`, and use `@returns` (not `@return`). Omit a `@param` line entirely when it would carry no description. Component props and `src/types/onyx/**` properties that need a comment (see CONSISTENCY-13/19) are documented with a `/** ... */` block above them, not `//` comments.

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

type ButtonProps = {
    // Milliseconds before the tooltip auto-dismisses, defaults to 3000
    autoDismissDelay?: number;
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

type ButtonProps = {
    /** Milliseconds before the tooltip auto-dismisses, defaults to 3000 */
    autoDismissDelay?: number;
};
```

---

### Review Metadata

Flag ONLY when ANY of these is true:

- A JSDoc `@param`/`@returns` includes a TypeScript type in braces (e.g. `@param {string}`)
- A JSDoc block uses `@return` instead of `@returns`, or uses `@private`/`@memberof`/`@implements`/`@enum`/`@override`
- A `@param` line has a name but no description (it should be omitted)
- A component prop in a `Props` type, or a property in `src/types/onyx/**`, is documented with a `//` comment instead of `/** ... */`, and the comment adds a real fact (a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling - see CONSISTENCY-19) - the fix is converting it to `/** */`. If the `//` comment adds nothing, the fix is deleting it instead (see CONSISTENCY-19), not converting it
- Such a prop/property is left undocumented while sibling members use `/** */` blocks, AND it has a non-obvious fact to add (a unit, default, boundary condition, null/undefined semantics, ownership, invariant, or distinction from a sibling - see CONSISTENCY-13)

**DO NOT flag if:**

- The function is a trivial inline arrow with no JSDoc and self-evident behavior (JSDoc not required)
- The prop is inherited/spread from a shared base type documented elsewhere
- The file is a test or story
- The undocumented member's name and type are already self-explanatory - it needs no comment even if siblings have one (see CONSISTENCY-13)

**Search Patterns** (hints for reviewers):
- `@param {` / `@returns {` / `@return ` / `@private` / `@memberof`
- `//` comments directly above members of a `...Props` type
