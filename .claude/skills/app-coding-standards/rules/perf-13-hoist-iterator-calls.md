---
ruleId: PERF-13
title: Avoid iterator-independent function calls in array methods
---

## [PERF-13] Avoid iterator-independent function calls in array methods

### Reasoning

Function calls inside iteration callbacks that don't use the iterator variable execute redundantly - producing the same result. This creates O(n) overhead that scales with data size. Hoisting these calls outside the loop eliminates redundant computation and improves performance, especially on large datasets like transaction lists or report collections.

### Incorrect

```ts
// getConfig() called on every iteration but doesn't use item
const results = items.map((item) => {
  const config = getConfig();
  return item.value * config.multiplier;
});
```

### Correct

```ts
// Hoist iterator-independent calls outside the loop
const config = getConfig();

const results = items.map((item) => item.value * config.multiplier);
```

```ts
// Function receives iterator or iterator-derived value
const formatted = items.map((item) => formatCurrency(item.amount));
```

```ts
// Index used meaningfully
const indexed = items.map((item, index) => ({ ...item, id: generateId(index) }));
```

---

### Review Metadata

Flag when ALL of these are true:

**For side-effect-free methods** (`.map`, `.reduce`, `.filter`, `.some`, `.every`, `.find`, `.findIndex`, `.flatMap`):
- A function call exists inside the callback
- The function call does NOT receive:
  - The iterator variable directly (e.g., `transform(item)`)
  - A property/value derived from the iterator (e.g., `format(item.name)`)
  - The index parameter when used meaningfully (e.g., `generateId(index)`)
- The function is not a method called ON the iterator or iterator-derived value (e.g., `item.getValue()`)

**For `.forEach`**:
- Same conditions as above, BUT also verify the side effect doesn't depend on iteration context
- If the function call would produce the same effect regardless of which iteration it runs in, flag it

**DO NOT flag if:**

- Function uses iterator, its parts or derived value based on iterator (e.g. `func(item.process())`)
- Function call depends on iterator (e.g. `item.value ?? getDefault()`)
- Function is used when mapping to new entities (e.g. `const thing = { id: createID() }`)
- Above but applied to index instead of iterator

**Search Patterns** (hints for reviewers):
- `\.map\(`
- `\.reduce\(`
- `\.filter\(`
- `\.some\(`
- `\.every\(`
- `\.find\(`
- `\.findIndex\(`
- `\.flatMap\(`
- `\.forEach\(`
