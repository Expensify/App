# `@callstack/repack` patches

### [@callstack+repack+5.4.1-canary-20261005140324+001+clamp-dev-server-progress.patch](@callstack+repack+5.4.1-canary-20261005140324+001+clamp-dev-server-progress.patch)

- Reason:

    ```
    rspack's ProgressPlugin reports non-monotonic percentages (observed 45% followed by 44% on a
    single-platform compile). Re.Pack's dev server forwards that raw value to both the HTTP progress
    sender and the terminal reporter, so the React Native loading bar and the terminal bar both run
    backwards. This patch clamps progress per platform so it never decreases within a compilation,
    and resets it on the child compiler's `watchRun` and `invalid` hooks when a new compilation
    starts on an active platform.
    ```

- Upstream PR/issue: https://github.com/callstack/repack/issues/1459 - filed with a standalone reproduction, closed won't-fix. Delete this patch once a release clamps the forwarded percentage.
- E/App issue: None. Reported during review of the PR below.
- PR Introducing Patch: https://github.com/Expensify/App/pull/99407

## Removed patches

Patches `002 lazy-platform-compilation`, `003 android-fonts-raw` and `004 android-keep-xml` were
deleted when `@callstack/repack` moved to `5.4.1-canary-20261005140324`:

- `002` lazy platform compilation shipped upstream in 5.4.0 (https://github.com/callstack/repack/pull/1430).
- `003` fonts to `res/raw` shipped upstream in the canary (https://github.com/callstack/repack/pull/1473): fonts go to both `res/font` and `res/raw`.
- `004` `res/raw/keep.xml` shipped upstream in the canary (https://github.com/callstack/repack/pull/1473): `AssetsCopyProcessor` writes it for Android.
