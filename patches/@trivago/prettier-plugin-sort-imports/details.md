# `@trivago/prettier-plugin-sort-imports` patches

### [@trivago+prettier-plugin-sort-imports+6.0.2+001+add-oxc-parser-support.patch](@trivago+prettier-plugin-sort-imports+6.0.2+001+add-oxc-parser-support.patch)

- Reason:

    ```
    @prettier/plugin-oxc registers oxc and oxc-ts parsers that override the built-in
    babel and typescript parsers for JS/TS files. Since the sort-imports plugin only
    attaches its import-sorting preprocess hook to babel/typescript/flow/vue parsers,
    import sorting is silently skipped when OXC is active. This patch adds oxc and
    oxc-ts parser entries that compose OXC's parser with the sort-imports preprocess hook.
    ```

- Upstream PR/issue: https://github.com/trivago/prettier-plugin-sort-imports/pull/398
- E/App issue: https://github.com/Expensify/App/issues/82687
- PR introducing patch: https://github.com/Expensify/App/pull/83008
