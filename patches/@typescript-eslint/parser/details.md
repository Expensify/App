# `@typescript-eslint/parser` patches

### [@typescript-eslint+parser+8.58.1+001+require-typescript6.patch](@typescript-eslint+parser+8.58.1+001+require-typescript6.patch)

- Reason:

    ```
    typescript-eslint still needs the TypeScript 6 compiler API (`require('typescript')`).
    The repo's root `typescript` is TypeScript 7 so that `tsc` is the native compiler.
    Point every require at `@typescript/typescript6` so type-aware lint keeps working.
    ```

- Upstream PR/issue: https://github.com/typescript-eslint/typescript-eslint/issues/10940
- E/App issue: https://github.com/Expensify/App/issues/99288
- PR introducing patch: https://github.com/Expensify/App/pull/99017
