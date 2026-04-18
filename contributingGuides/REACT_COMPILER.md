# React Compiler

## What is the React Compiler?

[React Compiler](https://react.dev/learn/react-compiler) is a tool designed to enhance the performance of React applications by automatically memoizing components that lack optimizations.

React Compiler is enabled in both the webpack (web) and metro (mobile) build pipelines via `babel-plugin-react-compiler`.

## React Compiler CI check

A CI check runs on every PR that modifies `.ts` or `.tsx` files. It uses `@babel/core`'s `transformSync` with `babel-plugin-react-compiler` to check whether each changed file's components and hooks compile successfully.

### What the CI check enforces

The check enforces two rules:

1. **New files must compile.** If you add a new file containing React components or hooks, they must all compile with React Compiler. This prevents new Rules of React violations from entering the codebase.
2. **No regressions.** If a file already compiles on `main` and your PR breaks that, the check fails. This prevents introducing violations into files that were previously compliant.

The check does **not** fail if:
- A file has no React components or hooks (utilities, types, constants are silently skipped)
- A file was already failing to compile on `main` and still fails on your branch (not a regression)

### What to do when the check fails

The CI output shows which files failed, with the compiler error reason, file path, and line number for each failure. Look for lines like:

```
FAILED   src/components/MyComponent.tsx (new file must compile)
    src/components/MyComponent.tsx:42:8: Hooks must always be called in a consistent order...
```

The error messages come directly from React Compiler and describe which [Rule of React](https://react.dev/reference/rules) was violated. See the ["How to fix a particular problem?"](#how-to-fix-a-particular-problem) section below for common fixes.

### Local usage

You can run the same check locally before pushing:

```bash
# Check specific files, directories, or glob patterns
npm run react-compiler-compliance-check check src/components/Foo.tsx
npm run react-compiler-compliance-check check src/components/
npm run react-compiler-compliance-check check "src/hooks/**/*.ts"

# Check only files changed relative to main (same as CI)
npm run react-compiler-compliance-check check-changed

# Show detailed output including files that compiled or were skipped
npm run react-compiler-compliance-check check --verbose src/components/
```

#### Flags

- `--verbose` -- Show detailed output including skipped files and files that compiled successfully.
- `--remote <name>` -- Git remote name for the base branch (default: `origin`).

## How to fix a particular problem?

Below are the most common failures and approaches to fix them:

### New `ref` produces `Mutating a value returned from a function whose return value should not be mutated`

If you encounter this error, you need to add the `Ref` postfix to the variable name. For example:

```diff
-const rerender = useRef();
+const rerenderRef = useRef()
```

### New `SharedValue` produces `Mutating a value returned from a function whose return value should not be mutated`

If you added a modification to `SharedValue`, you'll likely encounter this error. You can ignore this error for now because the current `react-native-reanimated` API is not compatible with `react-compiler` rules. Once [this PR](https://github.com/software-mansion/react-native-reanimated/pull/6312) is merged, we'll rewrite the code to be compatible with `react-compiler`. Until then, you can ignore this error.

### Existing manual memoization could not be preserved. [...]

These types of errors usually occur when the calls to `useMemo` that were made manually are too complex for react-compiler to understand. React compiler is still experimental so unfortunately this can happen.

Some specific cases of this error are described below.

#### The inferred dependencies did not match the manually specified dependencies

This usually happens when a dependency used inside a hook is omitted. Try including the missing dependencies.

Please be aware that `react-compiler` struggles with memoization of nested fields, i. e.:

```ts
// ❌ such code triggers the error
const selectedQboAccountName = useMemo(() => qboAccountOptions?.find(({id}) => id === qboConfig?.reimbursementAccountID)?.name, [qboAccountOptions, qboConfig?.reimbursementAccountID]);

// ✅ this code can be compiled successfully
const reimbursementAccountID = qboConfig?.reimbursementAccountID;
const selectedQboAccountName = useMemo(() => qboAccountOptions?.find(({id}) => id === reimbursementAccountID)?.name, [qboAccountOptions, reimbursementAccountID]);
// 👍 also new version of the code creates a variable for a repeated code
// which is great because it reduces the amount of the duplicated code
```

#### This value may be mutated later, which could cause the value to change unexpectedly

This usually happens when the value returned from `useMemo` is later passed to some other function, and `react-compiler` doesn't know if the value will stay stable or be mutated.

```ts
// ❌ such code triggers the error
const myResult = useMemo(() => SearchUtils.buildSearchQueryJSON(foobar), [foobar]);
// [...] some other code
const betterQuery = Utils.improveQuery(myResult);

// ✅ this code can be compiled successfully
const {myResult, betterQuery} = useMemo(() => {
    const result = SearchUtils.buildSearchQueryJSON(foobar);

    return {
        myResult: result,
        betterQuery: Utils.improveQuery(result)
    }
},[foobar]);
```

### `Invalid nesting in program blocks or scopes`

Such error may happen if we have a nested memoization, i. e.:

```tsx
const qboToggleSettingItems = [
    {
        onToggle: () => console.log('Hello world!'),
        subscribedSetting: CONST.QUICKBOOKS_CONFIG.ENABLED,
    },
];

return (
  <Container>
    {qboToggleSettingItems.map((item) => (
        <ToggleSettingOptionRow
            onToggle={item.onToggle}
            // ❌ such code triggers the error - `qboConfig?.pendingFields` is an external variable from the closure
            // so this code is pretty complicated for `react-compiler` optimizations
            pendingAction={settingsPendingAction([item.subscribedSetting], qboConfig?.pendingFields)}
            // ❌ such code triggers the error - `qboConfig` is an external variable from the closure
            errors={ErrorUtils.getLatestErrorField(qboConfig, item.subscribedSetting)}
        />
    ))}
  </Container>
)
```

And below is a corrected version of the code:

```tsx
const qboToggleSettingItems = [
    {
        onToggle: () => console.log('Hello world!'),
        subscribedSetting: CONST.QUICKBOOKS_CONFIG.ENABLED,
        // 👇 calculate variables and memoize `qboToggleSettingItems` object (done by `react-compiler`)
        errors: ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.ENABLED),
        pendingAction: settingsPendingAction([CONST.QUICKBOOKS_CONFIG.ENABLED], qboConfig?.pendingFields),
    },
];

return (
  <Container>
    {qboToggleSettingItems.map((item) => (
        <ToggleSettingOptionRow
            onToggle={item.onToggle}
            // ✅ we depend only on `qboToggleSettingItems`, no more complex closures, so everything is fine
            pendingAction={item.pendingAction}
            // ✅ we depend only on `qboToggleSettingItems`, no more complex closures, so everything is fine
            errors={item.errors}
        />
    ))}
  </Container>
)
```

### `Unexpected terminal kind optional for ternary test block`

The problem happens when you have a ternary operator and you are using optional chaining `?.` operator:

```tsx
<OfflineWithFeedback
  description={menuItem.description}
  // ❌ such code triggers the error
  brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(menuItem?.subscribedSettings, qboConfig?.errorFields) ? CONST.ERROR : undefined}
>
</OfflineWithFeedback>
```

In this case, `qboConfig?.errorFields` is causing the error, and the solution is to put it outside the ternary test block:

```tsx
// 👇 move optional field outside of a ternary block
const errorFields = qboConfig?.errorFields;

...

<OfflineWithFeedback
    description={menuItem.description}
    // ✅ this code can be compiled successfully now
    brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(menuItem?.subscribedSettings, errorFields) ? CONST.ERROR : undefined}
>
</OfflineWithFeedback>
```

## What if my type of error is not listed here?

This list is actively maintained. If you discover a new error that is not listed and find a way to fix it, please update this documentation and create a PR.
