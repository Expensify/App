---
ruleId: UI-3
title: Do not use inline style objects
---

## [UI-3] Do not use inline style objects

### Reasoning

Per `STYLING.md`, inline style object literals (`style={{ ... }}`) are not allowed. Styles must come from the shared `styles`/`StyleUtils` helpers, passed as a style or an array of styles. Inline objects create a new object every render (breaking memoization), bypass theming, and duplicate values that belong in the style system.

### Incorrect

```tsx
function Card() {
    return <View style={{padding: 8, backgroundColor: theme.componentBG}} />;
}
```

### Correct

```tsx
function Card() {
    return <View style={[styles.p2, styles.componentBG]} />;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed JSX passes an inline object literal to a style-typed prop - `style={{ ... }}` or any `*Style` prop such as `contentContainerStyle={{ ... }}`
- An equivalent exists in `styles`/`StyleUtils`, or the values are static and belong in the style system

**DO NOT flag if:**

- The style references a value that genuinely must be computed at render time and has no `StyleUtils` helper (e.g. a measured dynamic dimension) - prefer a `StyleUtils` function, but a justified dynamic style is acceptable
- The prop is a non-style object prop (e.g. `hitSlop={{top: 8}}`)
- The object is an animated style from reanimated
- The code is a test or story

**Search Patterns** (hints for reviewers):
- `style={{`
- `Style={{` (e.g. `contentContainerStyle={{`)
