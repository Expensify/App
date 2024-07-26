# React Compiler

## What is the React Compiler?

[React Compiler](https://react.dev/learn/react-compiler) is a tool that improves the performance of React by applying auto-memoization to components that are missing optimizations.

At Expensify we are earlier adopters of this tool and we want to make sure we use all power of it.

## React Compiler CI check

We have a CI check that runs the React Compiler on all PRs. This check compares compilable files from PR branch with target branch. If it detects files that were compiled before successfully and now this file fails to be compiled then it will fail the check.

## What if CI check fails in my PR?

If the CI check fails for your PR, then you need to fix the problem. If you are not sure how to fix it, then you can ask for help in the `#expensify-open-source` Slack channel (and tag `@Kiryl Ziusko`).

## How can I check what exactly prevents file from successful optimization or whether my fix for passing `react-compiler` actually works?

You can run `npm run react-compiler-healthcheck` and check the output. You should see the list of files that were compiled unsuccessfully and what exactly prevents them from being successfully compiled. The output can be very big, so you may write output to a file and then check it:

```bash
npm run react-compiler-healthcheck &> output.txt
```


## How to fix a particular problems?

Below are the most common failures and approaches on how to fix them:

### New `ref` produces `Mutating a value returned from a function whose return value should not be mutated`

If you encounter this error, then you need to add `Ref` postfix to the variable name. For example:

```diff
-const rerender = useRef();
+const rerenderRef = useRef()
```

### New `SharedValue` produces `Mutating a value returned from a function whose return value should not be mutated`

If you added a modification of `SharedValue`, then most likely you'll encounter this error. In this case you can ignore the error, because current `react-native-reanimated` API is not compatible with `react-compiler` rules. When [this PR](https://github.com/software-mansion/react-native-reanimated/pull/6312) will be merged we'll rewrite the code to be compatible with `react-compiler` at once, but for now you can ignore this error.

### `manual memoization could not be preserved`

In this case most likely you omitted a dependency which you are using inside the hook. In this case you create a memoization that is more complex and can not be optimized automatically. Try to include missing dependencies.

## What if my type of error is not listed here?

This list is in active development. If you discovered a new error that is not listed here and found a wau to fix it, then you can update this documentation and create a PR.
