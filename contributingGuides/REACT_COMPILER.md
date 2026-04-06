# React Compiler

## What is the React Compiler?

[React Compiler](https://react.dev/learn/react-compiler) is a tool designed to enhance the performance of React applications by automatically memoizing components that lack optimizations.

At Expensify, we are early adopters of this tool and aim to fully leverage its capabilities.

## React Compiler compliance checker

We provide a script, `scripts/react-compiler-compliance-check.ts`, which checks whether React components and hooks compile with React Compiler. It runs in CI on every PR and can also be used locally for quick feedback.

### How it works

The script uses `@babel/core`'s `transformSync` with `babel-plugin-react-compiler` directly (no intermediate tools). For each file, the compiler reports whether components/hooks compiled successfully, failed, or weren't found. This produces a three-state result per file: `COMPILED`, `FAILED`, or `SKIPPED` (no components/hooks).

### CI enforcement (two rules)

The CI check (`check-changed`) enforces two rules on changed `.ts`, `.tsx`, and `.jsx` files:

1. **New files**: If a new file contains components or hooks that fail to compile, the check fails.
2. **Modified files**: If a file compiled successfully on `main` but fails on the PR branch, the check fails (regression).

Files with no React components or hooks are silently skipped.

### Usage

#### Check specific files

```bash
npm run react-compiler-compliance-check check src/components/Foo.tsx src/hooks/useBar.ts
```

#### Check changed files (CI mode, also works locally)

```bash
npm run react-compiler-compliance-check check-changed
```

#### Flags

- `--verbose` — Show detailed output including skipped files and files that compiled successfully.
- `--remote <name>` — Git remote name for the base branch (default: `origin`).

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
