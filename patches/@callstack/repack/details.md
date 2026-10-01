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

- Upstream PR/issue: https://github.com/callstack/repack/issues/1459 - filed with a standalone reproduction. Delete this patch once a release clamps the forwarded percentage.
- E/App issue: None. Reported during review of the PR below.
- PR Introducing Patch: https://github.com/Expensify/App/pull/99407

### [@callstack+repack+5.3.0+002+lazy-platform-compilation.patch](@callstack+repack+5.3.0+002+lazy-platform-compilation.patch)

- Reason:

    ```
    Back-port of upstream lazy platform compilation. On 5.3.0 the dev server starts every configured
    platform compiling immediately, so a machine running one app also pays for a full compile of the
    other platform (measured: iOS 188.3s and Android 190.7s, both compiled although only iOS was ever
    requested). Narrowing the server to one platform does not fix it: that server cannot serve the
    other platform's bundle at all, so a second app reusing the running server gets nothing.

    This patch keeps every platform configured and parks each child compiler at its first watch run
    until something actually asks for that platform's bundle. A platform is activated by
    `getAsset`, i.e. by a bundle request, and only activated platforms emit progress and build
    signals, so one progress stream serves the platform in use. Bookkeeping moved from the
    MultiCompiler hooks to the child compilers because rspack only fires the aggregated `done` once
    every child has reported, and a parked child never reports. `close()` releases parked compilations
    before the compiler closes, as upstream does.
    ```

- Also updates `dist/commands/rspack/Compiler.d.ts`: its declarations describe the pre-patch shape (`isCompilationInProgress: boolean`) and omit the new members.
- Depends on `001`: both patches edit the progress handling in `dist/commands/rspack/Compiler.js`, and this one is authored against the post-`001` file. Keep them in numeric order.
- Upstream PR/issue: https://github.com/callstack/repack/pull/1430 - merged into `main`, not in any release yet; staged for 5.4.0 by https://github.com/callstack/repack/pull/1441. Delete this patch when a release containing it is pinned.
- E/App issue: None. Found while answering review on the PR below.
- PR Introducing Patch: https://github.com/Expensify/App/pull/99407

### [@callstack+repack+5.3.0+003+android-fonts-raw.patch](@callstack+repack+5.3.0+003+android-fonts-raw.patch)

- Reason:

    ```
    In Android release builds Re.Pack's assets loader writes `.ttf`/`.otf`/`.ttc` files to `res/font/`,
    while Metro writes every non-image asset to `res/raw/`. Fonts loaded from JS with `require()` (Skia's
    `useFont`/`matchFont`, used by the Home charts) resolve the asset as an Android resource and only look
    in `drawable` and `raw`, so they never load and the chart spinner never stops. This patch sends font
    files to `raw`, as Metro does. XML font-family resources still go to `font/`.
    ```

- Upstream PR/issue: https://github.com/callstack/repack/issues/1472 - delete this patch once a release fixes it.
- E/App issue: https://github.com/Expensify/App/issues/102619
- PR Introducing Patch: https://github.com/Expensify/App/pull/102766

### [@callstack+repack+5.3.0+004+android-keep-xml.patch](@callstack+repack+5.3.0+004+android-keep-xml.patch)

- Reason:

    ```
    Metro writes `res/raw/keep.xml` next to the Android assets, listing every bundled resource with
    `tools:keep`. JS loads these resources by name at runtime, which Android's resource shrinker cannot
    see, so without the file a release build with `shrinkResources` (the standalone Android app) can
    strip images and fonts that are still in use. Re.Pack writes no such file. This patch makes the
    assets copy step write the same `raw/keep.xml` for Android, with one `@drawable/...`, `@raw/...` or
    `@font/...` entry per copied resource.
    ```

- Upstream PR/issue: https://github.com/callstack/repack/issues/1472 - delete this patch once a release fixes it.
- E/App issue: None. Found while comparing Re.Pack and Metro Android release asset output for https://github.com/Expensify/App/issues/102619.
- PR Introducing Patch: https://github.com/Expensify/App/pull/102766
