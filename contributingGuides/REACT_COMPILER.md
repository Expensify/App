# React Compiler

## What is the React Compiler?

[React Compiler](https://react.dev/learn/react-compiler) is a tool designed to enhance the performance of React applications by automatically memoizing components that lack optimizations.

At Expensify, we are early adopters of this tool and aim to fully leverage its capabilities.

## React Compiler CI check

We have implemented a CI check that runs the React Compiler on all pull requests (PRs). This check compares compilable files from the PR branch with those in the target branch. If it detects that a file was previously compiled successfully but now fails to compile, the check will fail.

## What if CI check fails in my PR?

If the CI check fails for your PR, you need to fix the problem. If you're unsure how to resolve it, you can ask for help in the `#expensify-open-source` Slack channel (and tag `@Kiryl Ziusko`).

## How can I check what exactly prevents file from successful optimization or whether my fix for passing `react-compiler` actually works?

You can run `npm run react-compiler-healthcheck` and examine the output. This command will list the files that failed to compile and provide details on what caused the failures. The output can be extensive, so you may want to write it to a file for easier review:

```bash
npm run react-compiler-healthcheck &> output.txt
```

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

### `manual memoization could not be preserved`

This error usually occurs when a dependency used inside a hook is omitted. This omission creates a memoization that is too complex to optimize automatically. Try including the missing dependencies.

## What if my type of error is not listed here?

This list is actively maintained. If you discover a new error that is not listed and find a way to fix it, please update this documentation and create a PR.
