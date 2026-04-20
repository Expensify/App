---
ruleId: CLEAN-REACT-PATTERNS-0
title: React Compiler compliance
---

## [CLEAN-REACT-PATTERNS-0] React Compiler compliance

### Reasoning

React Compiler is enabled in this codebase (`babel-plugin-react-compiler` runs first in both webpack and metro configs). It automatically memoizes components and hooks at the AST level — analyzing data flow, tracking dependencies, and inserting fine-grained caching that is more precise than any hand-written `useMemo`, `useCallback`, or `React.memo`.

Manual memoization is therefore:

1. **Redundant** — the compiler already handles it, so the manual wrapper adds zero value
2. **Harmful** — it interferes with the compiler's optimization model, potentially preventing it from applying its own caching strategy or causing double-wrapping
3. **Noisy** — it clutters the codebase with dependency arrays that must be maintained, reviewed, and debugged

The codebase enforces this via:
- **Babel plugin**: `babel-plugin-react-compiler` in `babel.config.js`
- **ESLint processor**: `eslint-plugin-react-compiler-compat` suppresses redundant lint rules when files compile successfully
- **CI compliance check**: `scripts/react-compiler-compliance-check.ts` enforces that new components/hooks compile and that existing compiled files don't regress

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

---

### Review Metadata

#### Verification

Before flagging, verify that the file actually compiles with React Compiler:

```bash
check-compiler.sh <filepath>
```

**IMPORTANT:** Run `check-compiler.sh` exactly as shown above - by name only, without an absolute path or `bash` prefix. The script is already on `$PATH`.

If the output contains **"Failed to compile"** for the file under review, the rule **does not apply** — the author may have no alternative to manual memoization until the compilation issue is resolved.

#### Condition

The verification step above is a prerequisite. Only flag when the file compiles successfully AND any of these are true in new or modified code:

1. **`useCallback`** — A function is wrapped in `useCallback`. The compiler automatically memoizes closures based on their captured variables.
2. **`useMemo`** — A value is wrapped in `useMemo`. The compiler automatically caches derived values.
3. **`React.memo`** — A component is wrapped in `React.memo` (or `memo` imported from React). The compiler automatically skips re-rendering components whose props haven't changed.

**Response:** Challenge the author: "React Compiler is enabled — remove the manual memoization and restructure the code so the compiler can handle it."

The goal is to fix the root cause (make code compiler-friendly) rather than slap on manual memoization as a workaround.

**Search Patterns:**
- `useCallback\s*\(` — manual callback memoization
- `useMemo\s*\(` — manual value memoization
- `React\.memo\s*\(` or `memo\s*\(` — manual component memoization
- Import statements: `useCallback`, `useMemo` from `react`

**DO NOT flag if:**
- The file does not compile with React Compiler (verified by the compliance check in the Verification section above)
- The code is inside `node_modules/`, `patches/`, or test fixtures
- The manual memoization exists in unchanged lines (pre-existing code not touched by the diff)
