---
ruleId: UI-4
title: Reuse an existing style or StyleUtils helper instead of adding a new one
---

## [UI-4] Reuse an existing style or StyleUtils helper instead of adding a new one

### Reasoning

Per `STYLING.md`, styles belong to the shared style system. Before a new entry is added to `src/styles`, the equivalent usually already exists - either as a utility style (spacing, flex, text) or as a `StyleUtils` function in `src/styles/utils/index.ts` (e.g. `StyleUtils.getBackgroundAndBorderStyle(theme.componentBG)`). A duplicate style is invisible to the next contributor, drifts from the original when one copy is updated, and bypasses theming when it hardcodes what a helper derives.

### Incorrect

```ts
// src/styles/index.ts
const styles = {
    myCardWrapper: {
        backgroundColor: theme.componentBG,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 8,
    },
};
```

### Correct

```tsx
function Card() {
    return <View style={[StyleUtils.getBackgroundAndBorderStyle(theme.componentBG), styles.p2]} />;
}
```

---

### Review Metadata

Flag ONLY when ALL of these are true:

- The changed code adds a new named style to `src/styles` (or a local style object built in a component)
- An equivalent already exists in `src/styles`, or the same shape can be produced by an existing `StyleUtils` function
- The new style is a plain composition of existing utility styles (spacing, flex, colors) rather than something genuinely new

**DO NOT flag if:**

- No existing style or `StyleUtils` helper produces the same result, and the new style is genuinely novel
- The style is a one-off override required by a third-party component's API
- The new entry is itself a `StyleUtils` function intended for reuse
- The code is a test or story

**Search Patterns** (hints for reviewers):
- added keys in `src/styles/index.ts` / `src/styles/utils/`
- `backgroundColor:` and `borderColor:` set together (usually `getBackgroundAndBorderStyle`)
- `padding:` / `margin:` / `flex:` numeric literals in a new style object
