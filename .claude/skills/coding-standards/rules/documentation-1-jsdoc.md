---
ruleId: DOC-1
title: Follow the JSDoc style guidelines
---

## [DOC-1] Follow the JSDoc style guidelines

### Reasoning

Per `STYLE.md`, TypeScript already encodes types, so JSDoc must not repeat them. Do not put types in `@param`/`@returns`, do not use `@private`/`@memberof`/`@implements`/`@enum`/`@override`, and use `@returns` (not `@return`). Omit a `@param` line entirely when it would carry no description. Component props are documented with a `/** ... */` block comment above each prop, not `//` comments.

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
    // Whether the button is disabled
    isDisabled: boolean;
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
    /** Whether the button is disabled */
    isDisabled: boolean;
};
```

---

### Review Metadata

Flag ONLY when ANY of these is true:

- A JSDoc `@param`/`@returns` includes a TypeScript type in braces (e.g. `@param {string}`)
- A JSDoc block uses `@return` instead of `@returns`, or uses `@private`/`@memberof`/`@implements`/`@enum`/`@override`
- A `@param` line has a name but no description (it should be omitted)
- A component prop in a `Props` type is documented with a `//` comment or left undocumented when sibling props use `/** */` blocks

**DO NOT flag if:**

- The function is a trivial inline arrow with no JSDoc and self-evident behavior (JSDoc not required)
- The prop is inherited/spread from a shared base type documented elsewhere
- The file is a test or story

**Search Patterns** (hints for reviewers):
- `@param {` / `@returns {` / `@return ` / `@private` / `@memberof`
- `//` comments directly above members of a `...Props` type
