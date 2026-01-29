# ESLint Rules Conflicting with React Compiler

This document tracks ESLint rules that conflict with React Compiler best practices. When trusting React Compiler to handle optimizations, we want to write straightforward, readable code without manual memoization. However, some existing ESLint rules were designed for a pre-Compiler world and now conflict with this approach.

## Strategy Options

For each rule, we have several potential strategies:
1. **Disable the rule** - If the rule is purely optimization-focused and React Compiler handles it
2. **Conditional disable** - Create custom ESLint plugin to disable rule only in compiled components
3. **Selective re-memoization** - Add back `useMemo`/`useCallback` only where the rule flags an issue
4. **Update the rule** - Modify the rule to be Compiler-aware

---

## Conflicting Rules

### 1. `rulesdir/no-inline-useOnyx-selector`

**Why it conflicts:**
This rule requires selectors to be extracted and wrapped in `useCallback`, but React Compiler should handle selector stability automatically.

**Example:**
```tsx
// ❌ Rule violation (but good for React Compiler)
const [policy] = useOnyx(ONYXKEYS.POLICY, {
    selector: (policies) => policies?.someFilter,
});

// ✅ Rule passes (but unnecessary with React Compiler)
const selector = useCallback((policies) => policies?.someFilter, []);
const [policy] = useOnyx(ONYXKEYS.POLICY, {selector});
```

**Recommended Strategy:** 
- Option 2: Conditional disable in compiled components
- The selector stability is important for Onyx performance, but React Compiler can handle it

**Files affected:**
- `useIsPaidPolicyAdmin.ts`
- `useCardFeedsForDisplay.ts`
- Many others using inline selectors

---

### 2. `react/jsx-no-constructed-context-values`

**Why it conflicts:**
This rule requires Context values to be memoized, but React Compiler automatically memoizes object literals when appropriate.

**Example:**
```tsx
// ❌ Rule violation (but good for React Compiler)
const value = {
    expandedRHPProgress,
    wideRHPRouteKeys,
    showWideRHPVersion,
    // ... more properties
};
return <WideRHPContext.Provider value={value}>{children}</WideRHPContext.Provider>;

// ✅ Rule passes (but unnecessary with React Compiler)
const value = useMemo(() => ({
    expandedRHPProgress,
    wideRHPRouteKeys,
    showWideRHPVersion,
}), [expandedRHPProgress, wideRHPRouteKeys, showWideRHPVersion]);
return <WideRHPContext.Provider value={value}>{children}</WideRHPContext.Provider>;
```

**Recommended Strategy:**
- Option 2: Conditional disable in compiled components
- Context value stability is important to prevent rerenders, but Compiler handles it

**Files affected:**
- `WideRHPContextProvider/index.tsx`
- Any component providing context

---

### 3. `react-compiler/react-compiler` (potential)

**Why it might conflict:**
The React Compiler ESLint plugin might have its own rules about what to memoize, which could conflict with our "trust the compiler" approach.

**Recommended Strategy:**
- Review React Compiler's own ESLint rules
- Configure to align with "remove manual memoization" philosophy

**Status:** To be investigated

---

### 4. `react-hooks/exhaustive-deps` (for arrays, objects, and functions)

**Why it conflicts:**
When we remove `useMemo`/`useCallback`, arrays, objects, and functions created inline will be new instances on every render. When used as dependencies in hooks, ESLint warns they'll change every render and suggests wrapping them.

**Example 1 - Array dependencies:**
```tsx
// ❌ Rule violation (but good for React Compiler)
const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
useEffect(() => {
    setErrorMessage('');
}, [sumOfSplitExpenses, splitExpenses]); 
// ⚠️ Warning: The 'splitExpenses' logical expression could make the dependencies 
// of useEffect Hook change on every render. To fix this, wrap the initialization 
// of 'splitExpenses' in its own useMemo() Hook.

// ✅ Rule passes (but unnecessary with React Compiler)
const splitExpenses = useMemo(() => draftTransaction?.comment?.splitExpenses ?? [], [draftTransaction?.comment?.splitExpenses]);
```

**Example 2 - Function dependencies:**
```tsx
// Before: No warning because onPress is stable
const onPress = useCallback(() => doSomething(), []);
useEffect(() => {
    register(onPress);
}, [onPress]);

// After: Warning because onPress changes every render
const onPress = () => doSomething();
useEffect(() => {
    register(onPress);
}, [onPress]); // ⚠️ Warning: onPress changes every render
```

**Recommended Strategy:**
- Option 1: Disable the specific warning if React Compiler handles the stability
- Option 3: Selectively re-add `useMemo`/`useCallback` only where needed for effect deps
- Consider if the effect really needs to run when the value changes, or if we should use a different approach

**Files affected:**
- `SplitExpensePage.tsx` - Array dependencies in useEffect
- Any component with effects depending on inline arrays/objects/functions

**Status:** Actively encountering during refactoring

---

## Implementation Plan

1. **Phase 1:** Continue refactoring, document all rule violations
2. **Phase 2:** Analyze patterns and decide strategy per rule
3. **Phase 3:** Either:
   - Create custom ESLint plugin for conditional disabling
   - Update ESLint config to disable rules globally
   - Selectively re-add memoization where truly needed
4. **Phase 4:** Document final decisions and update coding standards

---

## Notes

- React Compiler is designed to handle all the optimizations these rules were trying to enforce
- The goal is **readable, maintainable code** that the Compiler optimizes
- We should not fight the Compiler with manual memoization unless there's a specific need
- Some rules may need to remain for non-compiled components or legacy code

---

## Additional Rules to Monitor

As we continue refactoring, we may discover additional conflicting rules:

- `react-hooks/preserve-manual-memoization` - Already handling this one!
- Rules about array/object dependencies in hooks
- Custom rules about expensive computations

Add any new conflicts here as we discover them.

---

### 5. `react/no-unstable-nested-components`

**Why it conflicts:**
This rule prevents defining components during render, but when components are defined inline (especially as render props), React Compiler can automatically memoize them to prevent unnecessary re-creation.

**Example:**
```tsx
// ❌ Rule violation (but React Compiler handles it)
<AvatarWithImagePicker
    DefaultAvatar={() => (
        <Avatar
            source={policy?.avatarURL || getDefaultWorkspaceAvatar(policyName)}
            size={CONST.AVATAR_SIZE.X_LARGE}
            // ... other props
        />
    )}
/>

// ✅ Rule passes (but adds unnecessary complexity)
// Extract to separate component file or use useCallback
```

**Recommended Strategy:**
- Option 1: Disable the rule in compiled components - React Compiler memoizes the subtree
- Trust the Compiler to handle component memoization automatically
- Avoid premature optimization by extracting to separate files

**Files affected:**
- `WorkspaceOverviewPage.tsx` - DefaultAvatar render prop

**Status:** Trust React Compiler to memoize inline components
