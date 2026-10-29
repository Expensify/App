# `ts-api-utils` patches

### [ts-api-utils+2.5.0+001+require-typescript6.patch](ts-api-utils+2.5.0+001+require-typescript6.patch)

- Reason:

    ```
    typescript-eslint pulls in ts-api-utils, which imports the classic compiler API from `typescript`.
    The repo's root `typescript` is TypeScript 7 so that `tsc` is the native compiler.
    Point the CJS require and ESM import at `@typescript/typescript6` so type-aware lint keeps working.
    ```

- Upstream PR/issue: https://github.com/typescript-eslint/typescript-eslint/issues/10940
- E/App issue: https://github.com/Expensify/App/issues/99288
- PR introducing patch: https://github.com/Expensify/App/pull/99017
