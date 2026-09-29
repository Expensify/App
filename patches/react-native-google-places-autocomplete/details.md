# `react-native-google-places-autocomplete` patches

### [react-native-google-places-autocomplete+2.6.4+001+keyboard-navigation.patch](react-native-google-places-autocomplete+2.6.4+001+keyboard-navigation.patch)

- Reason:

    ```
    This patch adds keyboard accessibility to autocomplete result rows.
    The row Pressable elements lacked tabIndex, making them unreachable
    via Tab key navigation. When tabbing from the text input, focus would
    leave the container, triggering onBlur which hid the list before any
    selection could occur. Adding tabIndex={0}, accessible,
    accessibilityRole="button", and a Space onKeyDown handler makes rows
    keyboard-focusable and selectable. The accessibilityRole="button" is
    critical: it causes useActiveElementRole to return "button" when a row
    is focused, which disables the form's pressOnEnter keyboard shortcut
    (via shouldDisableEnterShortcut in Button) so Enter reaches the row's
    own onPress handler instead of submitting the form. Space is handled
    via onKeyDown to also prevent page scroll.
    ```

- E/App issue: https://github.com/Expensify/App/issues/79621

### [react-native-google-places-autocomplete+2.6.4+002+fix-tdz-crash-on-render.patch](react-native-google-places-autocomplete+2.6.4+002+fix-tdz-crash-on-render.patch)

- Reason:

    ```
    Upstream 2.6.4 crashes on the component's very first render with
    "ReferenceError: Cannot access '_request' before initialization".
    The 2.6.x rewrite introduced two temporal dead zone (TDZ) bugs where
    component-scope `const`s are read during render before they are
    declared:

    1. `const requestRef = useRef(_request)` reads `_request`, which is
       declared ~300 lines later. Fixed by initializing the ref to `null`;
       the component already assigns `requestRef.current = _request` on
       every render, and the ref is only ever read from inside the
       debounced callback, which cannot fire before that assignment.
    2. `_disableRowLoaders` (a `useCallback`) appears in the dependency
       arrays of two earlier hooks. Dependency arrays are evaluated during
       render, so both reads hit the TDZ. Fixed by moving the
       `_disableRowLoaders` declaration above its first use; it only
       depends on `buildRowsFromResults`, which is declared earlier still,
       so the move is behavior-preserving.

    Note: Jest cannot reproduce this crash because Babel transpiles
    `const` to `var` in the test environment, which erases TDZ semantics.
    It reproduces under Hermes and in browsers, where `const` is native.
    ```

- Upstream issue: not yet reported at the time of writing (2.6.4 is the latest release).

### [react-native-google-places-autocomplete+2.6.4+003+restore-list-loading-state.patch](react-native-google-places-autocomplete+2.6.4+003+restore-list-loading-state.patch)

- Reason:

    ```
    Upstream 2.6.4 gates the whole result list on `dataSource.length > 0`, but the
    loader and the "no results" state are rendered through the FlatList's
    ListEmptyComponent, which by definition only renders when the list IS empty.
    Those two conditions are mutually exclusive, so both `listLoaderComponent` and
    `listEmptyComponent` became unreachable dead props in 2.6.x.

    AddressSearch passes both, so upgrading from 2.5.6 silently dropped the address
    search spinner and the "no results found" message.

    This patch restores the 2.5.6 behavior by also rendering the list when there is
    an empty state to show. The `stateText.length > minLength` guard mirrors 2.5.6's
    `stateText !== ''` gate; it matters because `_request` clears results without
    resetting `listLoaderDisplayed`, so without it an aborted in-flight request
    could leave a spinner on screen after the input is cleared.

    Resulting behavior (matches 2.5.6 / production):
    - loader shows only while searching AND there are no previous results
    - previous results stay visible, with no loader, while the next search runs
    - the empty state shows when a search comes back with nothing

    Covered by tests/unit/AddressSearchListTest.tsx.
    ```

- Upstream issue: not yet reported at the time of writing (2.6.4 is the latest release).

### [react-native-google-places-autocomplete+2.6.4+004+restore-predefined-places-updates.patch](react-native-google-places-autocomplete+2.6.4+004+restore-predefined-places-updates.patch)

- Reason:

    ```
    In 2.5.6 the effect that rebuilds the list from `predefinedPlaces` depended on
    `props.predefinedPlaces`, so the list reacted to that prop changing. In 2.6.4 the
    same effect became mount-only (`}, []`), so predefined places that arrive or are
    filtered out after mount never reach the list.

    AddressSearch passes `filteredPredefinedPlaces` (recent destinations, filtered by
    the search text and hidden once the user starts typing), so on 2.6.4 the recent
    destinations went stale: they never updated, and stale rows kept the list
    non-empty, which also suppressed the loader added in patch 003.

    Restoring the dependency requires a second change. 2.5.6 held its defaults in one
    module-scope `defaultProps` object, so the default `predefinedPlaces` array had a
    stable identity. 2.6.4 moved defaults into destructuring (`= []`), which allocates
    a new array on every render — with the dependency restored that feeds an infinite
    render loop (effect -> setDataSource -> render -> new array -> effect). Hoisting
    the default to a module-level EMPTY_PREDEFINED_PLACES restores the stable identity
    2.5.6 had.

    Covered by tests/unit/AddressSearchListTest.tsx.
    ```

- Upstream issue: not yet reported at the time of writing (2.6.4 is the latest release).

### [react-native-google-places-autocomplete+2.6.4+005+fix-loader-stuck-on-abort.patch](react-native-google-places-autocomplete+2.6.4+005+fix-loader-stuck-on-abort.patch)

- Reason:

    ```
    On Android the address suggestion list could spin forever instead of showing
    results (Expensify/App#98825). Two 2.6.4 changes combine to cause it.

    First, the effect that re-requests on query change gained `stateText` in its
    dependency array, and its cleanup calls `_abortRequests()`. In 2.5.6 that cleanup
    was keyed to `[props.query]` alone, so every abort was paired with a request that
    replaced it. In 2.6.4 the cleanup runs on every keystroke, while the effect body
    only re-requests when `queryString` changed — so typing aborts requests without
    issuing new ones.

    Second, `listLoaderDisplayed` is only ever cleared from `onreadystatechange` at
    readyState 4, and `_abortRequests` detaches that handler (`onreadystatechange =
    null`) before calling `abort()`. An aborted request therefore leaves the loader
    flag stuck true with nothing to reset it.

    AddressSearch passes no `debounce` prop, so `debounceMs` is 0 and the request is
    issued from a `setTimeout(..., 0)`. When that timer wins the race against React
    flushing passive effects, the request reaches readyState 1 (setting the loader
    true) and is then aborted by the cleanup of the very render that scheduled it.
    Nothing re-issues it and nothing clears the flag, so the loader spins forever.
    The race is why this reproduces on Android/Hermes but not reliably on web, where
    the scheduler drains passive effects on a different task queue.

    Upstream 2.6.4 gates the whole list on `dataSource.length > 0`, which makes the
    stuck loader invisible; patch 003 deliberately restores 2.5.6's reachable loader,
    so the leak became user-visible in this app.

    The fix drops `stateText` from that effect's dependency array, restoring 2.5.6's
    `[props.query]` keying (2.5.6 carried the same eslint-disable for the same reason).
    `stateText` is still read in the body, but only inside the `queryChanged` guard,
    and the effect re-runs on every render where `queryString` changed, so the value
    read there is always current. This leaves the four `_abortRequests()` call sites
    exactly as 2.5.6 had them: the query-change/unmount cleanup, `_onPress`,
    `_requestNearby`, and the top of `_request`.

    It also clears the loader flag inside `_abortRequests`, so no abort path can strand
    it — including `_request`'s short-text early return and row press, where 2.5.6 left
    a stale `true` that happened to be invisible. Callers that immediately re-request
    set the flag back to true in the same tick (`open()` moves the new request to
    readyState 1 synchronously, and React batches), so there is no flicker.
    ```

- E/App issue: https://github.com/Expensify/App/issues/98825
- Upstream issue: not yet reported at the time of writing (2.6.4 is the latest release).
