# `@callstack/reassure-compare` patches

### [@callstack+reassure-compare+1.6.1+001+skip-scenarios-the-run-did-not-select.patch](@callstack+reassure-compare+1.6.1+001+skip-scenarios-the-run-did-not-select.patch)

- Reason:

    ```
    On pull requests, Reassure measures only the perf tests Jest selects for the changed files, but
    reassure-compare reports every baseline scenario missing from the current run as removed, so a
    selective run lists every unselected scenario as "Removed". reassure-measure now records each
    scenario's test file (testPath, relative to the working directory), and reassure-compare reports a
    baseline scenario as removed only when the current run ran its test file or the file no longer
    exists. Results without testPath (written before the patch) compare as before.
    ```

- Applies together with the `@callstack/reassure-measure` patch of the same name. Patches both the CommonJS and ES module builds.
- Upstream PR/issue: Not filed yet. Drop this patch once Reassure ships the equivalent.
- E/App issue: None.
- PR Introducing Patch: https://github.com/Expensify/App/pull/107158
