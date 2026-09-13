# `@callstack/repack` patches

### [@callstack+repack+5.3.0+001+clamp-dev-server-progress.patch](@callstack+repack+5.3.0+001+clamp-dev-server-progress.patch)

- Reason:

    ```
    rspack's ProgressPlugin reports non-monotonic percentages (observed 45% followed by 44% on a
    single-platform compile). Re.Pack's dev server forwards that raw value to both the HTTP progress
    sender and the terminal reporter, so the React Native loading bar and the terminal bar both run
    backwards. This patch clamps progress per platform so it never decreases within a compilation,
    and resets it on the `watchRun` and `invalid` hooks when a new compilation starts.
    ```

- Upstream PR/issue: None yet. To be filed against https://github.com/callstack/repack; the patch touches `dist/commands/rspack/Compiler.js`, so it must be removed once a release includes the fix.
- E/App issue: None. Reported during review of the PR below.
- PR Introducing Patch: https://github.com/Expensify/App/pull/99407
