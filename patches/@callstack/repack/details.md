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

### [@callstack+repack+5.4.1+002+resume-stdin-for-ctrl-c.patch](@callstack+repack+5.4.1+002+resume-stdin-for-ctrl-c.patch)

- Reason:

    ```
    `npm run ios` / `npm run android` show a prompt before the dev server starts (simulator picker,
    "port in use, use another port?"). The prompt framework closes with `input.unpipe()`, and Node's
    `Readable.unpipe()` calls `pause()` on its source, so `process.stdin` is paused when the dev server
    takes over. `setupInteractions` then calls `setRawMode(true)`, which clears the TTY's ISIG flag: the
    kernel stops turning Ctrl+C into SIGINT, and the 0x03 byte is deliverable only as stream data. A
    paused stream delivers nothing, so the `keypress` listener never fires, the `process.on('SIGINT')`
    handler next to it is unreachable, and the process keeps serving bundles until something external
    kills it. The `r` / `d` / `j` / `a` shortcuts are dead in the same session for the same reason.
    This patch adds the `process.stdin.resume()` that `@rock-js/plugin-metro` does after entering raw mode.
    ```

- Reproduced and verified in a pseudo-terminal with real control bytes injected, against the published 5.4.1 tarball: before the patch the process is alive 4s after Ctrl+C with `stdin.isPaused() === true` and `r` does nothing; after the patch stdin flows, Ctrl+C exits the process, and `r` runs `onReload`.
- Does not restore `Ctrl+Z` or `Ctrl+\`. Re.Pack maps `Ctrl+Z` to `process.emit('SIGTSTP')`, an emitter event with no listener anywhere in `@callstack/repack`, `@rock-js/*` or `repack-dev-server`, so nothing suspends the process; `Ctrl+\` has no keypress mapping at all. Both need key handling from upstream, separate from the paused stream this patch fixes.
- Upstream PR/issue: https://github.com/callstack/repack/issues/1515 - open, filed with the same one-line fix and reproduction. `setupInteractions.js` is byte-identical in 5.4.2 and the canary at time of writing, so no upgrade escapes it. Drop this patch once upstream ships the resume.
- E/App issue: https://github.com/Expensify/App/issues/105422
- PR Introducing Patch: https://github.com/Expensify/App/pull/105612

Removed on the bump to `@callstack/repack@5.4.1`:

- `002+lazy-platform-compilation` — upstream released the feature (`dist/commands/rspack/Compiler.js` now parks each child compiler until `getAsset` requests that platform). Was https://github.com/callstack/repack/pull/1430.
- `003+android-fonts-raw` and `004+android-keep-xml` — https://github.com/callstack/repack/issues/1472 fixed both: the assets loader emits `require()`'d font files to `res/raw` as well as `res/font` (`dist/loaders/assetsLoader/assetsLoader.js`), and the assets copy step writes `res/raw/keep.xml` with `tools:keep` for every copied resource (`dist/plugins/utils/AssetsCopyProcessor.js`), matching Metro. Verified against the published 5.4.1 tarball, and on device: Expensify/App#103243 shipped an AdHoc build on the 5.4.1 canary where fonts resolve from `raw` and all 765 `raw` assets plus 22 drawables survive `shrinkResources=true`. E/App issue: https://github.com/Expensify/App/issues/102619.
