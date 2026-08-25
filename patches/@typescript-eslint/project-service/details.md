# `@typescript-eslint/project-service` patches

### [@typescript-eslint+project-service+8.61.0+001+require-typescript6.patch](@typescript-eslint+project-service+8.61.0+001+require-typescript6.patch)

- Reason:

    ```
    typescript-eslint's project service lazily requires `typescript/lib/tsserverlibrary`.
    TypeScript 7 no longer exports that subpath, so type-aware lint fails on `.mts` files.
    Point the require at `@typescript/old/lib/tsserverlibrary` (TypeScript 6) instead.
    ```

- Upstream PR/issue: https://github.com/typescript-eslint/typescript-eslint/issues/10940
- E/App issue: https://github.com/Expensify/App/issues/99288
- PR introducing patch: https://github.com/Expensify/App/pull/99017
