# `@callstack/repack` patches

### [@callstack+repack+5.4.1+001+clamp-dev-server-progress.patch](@callstack+repack+5.4.1+001+clamp-dev-server-progress.patch)

- Reason:

    ```
    rspack's ProgressPlugin reports non-monotonic percentages (observed 45% followed by 44% on a
    single-platform compile). Re.Pack's dev server forwards that raw value to both the HTTP progress
    sender and the terminal reporter, so the React Native loading bar and the terminal bar both run
    backwards. This patch clamps progress per platform so it never decreases within a compilation,
    and resets it on the `watchRun` and `invalid` hooks when a new compilation starts.
    ```

- Rewritten against 5.4.1 on the bump from 5.3.0. The 5.3.0 version of this patch targeted the pre-lazy-compilation `Compiler.js` and no longer applies: upstream released per-platform lazy compilation, so the progress handler now sits behind an `activePlatforms` guard and `isCompilationInProgress` is a per-platform record. Same clamp, new anchors.
- Upstream PR/issue: https://github.com/callstack/repack/issues/1459 - filed with a standalone reproduction; closed as will-not-fix, so this stays until upstream changes its mind.
- E/App issue: None. Reported during review of the PR below.
- PR Introducing Patch: https://github.com/Expensify/App/pull/99407

Removed on the bump to `@callstack/repack@5.4.1`:

- `002+lazy-platform-compilation` — upstream released the feature (`dist/commands/rspack/Compiler.js` now parks each child compiler until `getAsset` requests that platform). Was https://github.com/callstack/repack/pull/1430.
- `003+android-fonts-raw` and `004+android-keep-xml` — https://github.com/callstack/repack/issues/1472 fixed both: the assets loader emits `require()`'d font files to `res/raw` as well as `res/font` (`dist/loaders/assetsLoader/assetsLoader.js`), and the assets copy step writes `res/raw/keep.xml` with `tools:keep` for every copied resource (`dist/plugins/utils/AssetsCopyProcessor.js`), matching Metro. Verified against the published 5.4.1 tarball, and on device: Expensify/App#103243 shipped an AdHoc build on the 5.4.1 canary where fonts resolve from `raw` and all 765 `raw` assets plus 22 drawables survive `shrinkResources=true`. E/App issue: https://github.com/Expensify/App/issues/102619.
