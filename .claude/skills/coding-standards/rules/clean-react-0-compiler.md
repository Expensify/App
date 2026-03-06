---
ruleId: CLEAN-REACT-PATTERNS-0
title: React Compiler compliance
---

## [CLEAN-REACT-PATTERNS-0] React Compiler compliance

### Reasoning

React Compiler is enabled in this codebase (`babel-plugin-react-compiler` runs first in both webpack and metro configs, targeting React 19). It automatically memoizes components and hooks at the AST level — analyzing data flow, tracking dependencies, and inserting fine-grained caching that is more precise than any hand-written `useMemo`, `useCallback`, or `React.memo`.

Manual memoization is therefore:

1. **Redundant** — the compiler already handles it, so the manual wrapper adds zero value
2. **Harmful** — it interferes with the compiler's optimization model, potentially preventing it from applying its own caching strategy or causing double-wrapping
3. **Noisy** — it clutters the codebase with dependency arrays that must be maintained, reviewed, and debugged

The codebase enforces this via:
- **Babel plugin**: `babel-plugin-react-compiler` in `babel.config.js`
- **ESLint processor**: `eslint-plugin-react-compiler-compat` suppresses redundant lint rules when files compile successfully
- **CI compliance check**: `scripts/react-compiler-compliance-check.ts` blocks PRs with manual memoization in new files

Reference: [React Compiler documentation](https://react.dev/learn/react-compiler)

### Incorrect

#### Incorrect (useCallback)

```tsx
function ReportScreen({reportID}: {reportID: string}) {
    const handlePress = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_DETAILS.getRoute(reportID));
    }, [reportID]);

    return <Button onPress={handlePress} />;
}
```

#### Incorrect (useMemo)

```tsx
function PolicyList({policies}: {policies: Policy[]}) {
    const sortedPolicies = useMemo(
        () => policies.sort((a, b) => a.name.localeCompare(b.name)),
        [policies],
    );

    return <FlatList data={sortedPolicies} renderItem={renderItem} />;
}
```

#### Incorrect (React.memo)

```tsx
const Avatar = React.memo(function Avatar({source, size}: AvatarProps) {
    return <Image source={source} style={getAvatarStyle(size)} />;
});
```

### Correct

#### Correct (plain function — compiler memoizes automatically)

```tsx
function ReportScreen({reportID}: {reportID: string}) {
    const handlePress = () => {
        Navigation.navigate(ROUTES.REPORT_DETAILS.getRoute(reportID));
    };

    return <Button onPress={handlePress} />;
}
```

#### Correct (plain expression — compiler memoizes automatically)

```tsx
function PolicyList({policies}: {policies: Policy[]}) {
    const sortedPolicies = policies.sort((a, b) => a.name.localeCompare(b.name));

    return <FlatList data={sortedPolicies} renderItem={renderItem} />;
}
```

#### Correct (plain component — compiler memoizes automatically)

```tsx
function Avatar({source, size}: AvatarProps) {
    return <Image source={source} style={getAvatarStyle(size)} />;
}
```

#### Escape hatch — `"use no memo";`

In rare cases where the compiler produces incorrect output for a specific function, add the `"use no memo";` directive to opt that single function out. This must include a comment explaining why.

```tsx
function ProblematicComponent({data}: Props) {
    "use no memo"; // Compiler mishandles the ref pattern in this component — see [link to issue]
    // ...
}
```

---

### Review Metadata

#### Condition

Flag when ANY of these are true in new or modified code:

1. **`useCallback`** — A function is wrapped in `useCallback`. The compiler automatically memoizes closures based on their captured variables.
2. **`useMemo`** — A value is wrapped in `useMemo`. The compiler automatically caches derived values.
3. **`React.memo`** — A component is wrapped in `React.memo` (or `memo` imported from React). The compiler automatically skips re-rendering components whose props haven't changed.

**Response:** Challenge the author: "React Compiler is enabled — why isn't this compiler-compliant? Remove the manual memoization and restructure the code so the compiler can handle it. If the compiler can't handle this pattern, add `"use no memo";` with a justification."

The goal is to fix the root cause (make code compiler-friendly) rather than slap on manual memoization as a workaround.

**Search Patterns:**
- `useCallback\s*\(` — manual callback memoization
- `useMemo\s*\(` — manual value memoization
- `React\.memo\s*\(` or `memo\s*\(` — manual component memoization
- Import statements: `useCallback`, `useMemo` from `react`

**DO NOT flag if:**
- The code contains `"use no memo";` with a documented justification
- The code is inside `node_modules/`, `patches/`, or test fixtures
- The manual memoization exists in unchanged lines (pre-existing code not touched by the diff)
