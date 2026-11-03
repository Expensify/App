# `eslint-config-expensify` patches

### [eslint-config-expensify+4.0.8+001+import-typescript6.patch](eslint-config-expensify+4.0.8+001+import-typescript6.patch)

- Reason:

    ```
    Type-aware Expensify rules import the classic compiler API from `typescript`.
    The repo's root `typescript` is TypeScript 7 so that `tsc` is the native compiler.
    Point the import at `@typescript/typescript6` so those rules keep working.
    ```

- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/99288
- PR introducing patch: https://github.com/Expensify/App/pull/99017
