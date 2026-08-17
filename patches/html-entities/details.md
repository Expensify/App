# `html-entities` patches

### [html-entities+2.5.3+001+use-worklet.patch](html-entities+2.5.3+001+use-worklet.patch)

- Reason:
  
    ```
    This patch adds `"worklet";` directive at the beginning of `node_modules/html-entities/index.js`. So the function used in react-native-live-markdown parser is a worklet and able to run in UI thread (react-native-reanimated).
    ```

    The directive is prepended to the existing `"use strict";` line rather than added as a
    line of its own. As a separate line it was a pure insertion, so the surrounding context
    still matched after the patch had been applied and patch-package would happily insert
    another copy on every run, accumulating duplicate directives in `node_modules`. Modifying
    the line means the removal context no longer matches once applied, so re-running
    patch-package correctly detects it as already applied.
  
- Upstream PR/issue: There won't be any upstream PRs as this is something that library maintainers won't add.
- E/App issue: https://github.com/Expensify/App/issues/52475
- PR introducing patch: https://github.com/Expensify/App/pull/53627